-- Script Lua pour cache Redis dans NGINX
-- Gestion intelligente du cache distribué

local redis = require "resty.redis"
local cjson = require "cjson"

local _M = {}

-- Configuration Redis
local REDIS_HOST = "redis"
local REDIS_PORT = 6379
local REDIS_TIMEOUT = 1000  -- 1 seconde

-- Bases de données Redis spécialisées
local CACHE_DB = {
    API_RESPONSES = 0,      -- Réponses API GET
    USER_SESSIONS = 1,      -- Sessions utilisateurs
    METRICS = 2,            -- Métriques temporaires
    METADATA = 3           -- Métadonnées avec TTL longs
}

-- TTL par type de contenu (en secondes)
local TTL_CONFIG = {
    api_get = 300,          -- 5 minutes pour GET API
    api_list = 60,          -- 1 minute pour listes
    user_session = 3600,    -- 1 heure pour sessions
    metadata = 86400,       -- 24 heures pour métadonnées
    metrics = 30            -- 30 secondes pour métriques
}

-- Fonction de connexion Redis
function _M.connect_redis(db_num)
    db_num = db_num or CACHE_DB.API_RESPONSES
    
    local red = redis:new()
    red:set_timeout(REDIS_TIMEOUT)
    
    local ok, err = red:connect(REDIS_HOST, REDIS_PORT)
    if not ok then
        ngx.log(ngx.ERR, "Failed to connect to Redis: ", err)
        return nil
    end
    
    -- Sélectionner la base de données
    local res, err = red:select(db_num)
    if not res then
        ngx.log(ngx.ERR, "Failed to select Redis DB ", db_num, ": ", err)
        return nil
    end
    
    return red
end

-- Générer une clé de cache intelligente
function _M.generate_cache_key(request_uri, query_args, user_id)
    local key_parts = {
        "cache",
        ngx.md5(request_uri)
    }
    
    -- Ajouter les paramètres de requête triés pour consistance
    if query_args then
        local sorted_args = {}
        for k, v in pairs(query_args) do
            table.insert(sorted_args, k .. "=" .. tostring(v))
        end
        table.sort(sorted_args)
        table.insert(key_parts, ngx.md5(table.concat(sorted_args, "&")))
    end
    
    -- Ajouter l'ID utilisateur pour cache personnalisé
    if user_id then
        table.insert(key_parts, "user:" .. user_id)
    end
    
    return table.concat(key_parts, ":")
end

-- Détecter le type de contenu et TTL approprié
function _M.get_content_type_ttl(request_uri, request_method)
    if request_method ~= "GET" then
        return nil, 0  -- Pas de cache pour non-GET
    end
    
    -- Règles d'expiration basées sur l'URL
    if string.match(request_uri, "/api/products") then
        if string.match(request_uri, "%?") then
            return "api_list", TTL_CONFIG.api_list
        else
            return "api_get", TTL_CONFIG.api_get
        end
    elseif string.match(request_uri, "/api/stock") then
        return "api_list", TTL_CONFIG.api_list
    elseif string.match(request_uri, "/api/reports") then
        return "metadata", TTL_CONFIG.metadata
    elseif string.match(request_uri, "/api/auth") then
        return nil, 0  -- Jamais de cache pour auth
    elseif string.match(request_uri, "/api/") then
        return "api_get", TTL_CONFIG.api_get
    end
    
    return "api_get", TTL_CONFIG.api_get
end

-- Récupérer depuis le cache
function _M.get_from_cache(cache_key, db_num)
    local red = _M.connect_redis(db_num)
    if not red then
        return nil
    end
    
    local res, err = red:get(cache_key)
    if not res or res == ngx.null then
        red:set_keepalive(10000, 100)
        return nil
    end
    
    -- Décoder les métadonnées du cache
    local cache_data = cjson.decode(res)
    
    red:set_keepalive(10000, 100)
    return cache_data
end

-- Stocker dans le cache
function _M.set_to_cache(cache_key, data, ttl, db_num)
    local red = _M.connect_redis(db_num)
    if not red then
        return false
    end
    
    -- Préparer les métadonnées
    local cache_entry = {
        content = data,
        timestamp = ngx.now(),
        ttl = ttl,
        content_type = ngx.var.content_type or "application/json"
    }
    
    local cache_data = cjson.encode(cache_entry)
    
    local ok, err = red:setex(cache_key, ttl, cache_data)
    if not ok then
        ngx.log(ngx.ERR, "Failed to store in cache: ", err)
        red:set_keepalive(10000, 100)
        return false
    end
    
    red:set_keepalive(10000, 100)
    return true
end

-- Invalider le cache par pattern
function _M.invalidate_cache_pattern(pattern, db_num)
    local red = _M.connect_redis(db_num)
    if not red then
        return false
    end
    
    local keys, err = red:keys(pattern)
    if not keys or #keys == 0 then
        red:set_keepalive(10000, 100)
        return true
    end
    
    for _, key in ipairs(keys) do
        red:del(key)
    end
    
    red:set_keepalive(10000, 100)
    return true
end

-- Middleware principal de cache
function _M.cache_middleware()
    local request_method = ngx.var.request_method
    local request_uri = ngx.var.request_uri
    local query_args = ngx.req.get_uri_args()
    
    -- Extraire l'ID utilisateur du token JWT (si présent)
    local auth_header = ngx.var.http_authorization
    local user_id = nil
    if auth_header then
        -- Parsing simplifié du JWT pour l'exemple
        -- En production, utiliser une bibliothèque JWT complète
        local token = string.match(auth_header, "Bearer%s+(.+)")
        if token then
            user_id = "user_" .. ngx.md5(token):sub(1, 8)
        end
    end
    
    -- Déterminer si on doit cacher
    local content_type, ttl = _M.get_content_type_ttl(request_uri, request_method)
    if not content_type or ttl == 0 then
        ngx.ctx.skip_cache = true
        return
    end
    
    -- Générer la clé de cache
    local cache_key = _M.generate_cache_key(request_uri, query_args, user_id)
    
    -- Tentative de récupération depuis le cache
    local cached_data = _M.get_from_cache(cache_key, CACHE_DB.API_RESPONSES)
    if cached_data then
        ngx.header["X-Cache-Status"] = "HIT"
        ngx.header["X-Cache-Key"] = cache_key
        ngx.header["Content-Type"] = cached_data.content_type
        ngx.header["Cache-Control"] = "max-age=" .. ttl
        
        ngx.status = 200
        ngx.say(cached_data.content)
        ngx.exit(200)
    end
    
    -- Pas de cache trouvé, configurer pour stocker la réponse
    ngx.ctx.cache_key = cache_key
    ngx.ctx.cache_ttl = ttl
    ngx.ctx.cache_db = CACHE_DB.API_RESPONSES
    ngx.header["X-Cache-Status"] = "MISS"
end

-- Stocker la réponse dans le cache après traitement
function _M.store_response()
    if ngx.ctx.skip_cache or not ngx.ctx.cache_key then
        return
    end
    
    local status = ngx.status
    if status ~= 200 then
        return  -- Ne cacher que les réponses 200
    end
    
    -- Capturer le body de la réponse (nécessite ngx.var.response_body)
    local response_body = ngx.var.response_body
    if response_body then
        _M.set_to_cache(
            ngx.ctx.cache_key,
            response_body,
            ngx.ctx.cache_ttl,
            ngx.ctx.cache_db
        )
    end
end

return _M
