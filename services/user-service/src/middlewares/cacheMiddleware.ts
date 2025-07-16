import type { Request, Response, NextFunction } from 'express';
import { redisCacheService } from '../../application/services/RedisCacheService';
import { createControllerLogger } from '../../utils/logger';

const log = createControllerLogger('CacheMiddleware');

interface CachedResponse {
  data: any;
  statusCode: number;
  headers: Record<string, string>;
}

interface CacheMiddlewareOptions {
  ttl?: number;
  database?: number;
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
}

/**
 * Middleware de cache Redis pour Express
 * Gère automatiquement la mise en cache des réponses API
 */
export function cacheMiddleware(type: string, options: CacheMiddlewareOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Vérifier si le cache est activé et si les conditions sont remplies
    if (!redisCacheService.isHealthy()) {
      return next();
    }

    // Condition personnalisée pour activer le cache
    if (options.condition && !options.condition(req)) {
      return next();
    }

    // Ne cache que les GET par défaut
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Génération de la clé de cache
      const cacheKey = options.keyGenerator 
        ? options.keyGenerator(req)
        : generateDefaultCacheKey(req);

      // Tentative de récupération depuis le cache
      const cached = await redisCacheService.get<CachedResponse>(
        type,
        cacheKey,
        { 
          ttl: options.ttl,
          database: options.database, 
        },
      );

      if (cached) {
        // Cache hit - retourner la réponse mise en cache
        log.info(`Cache HIT: ${type}:${cacheKey}`);
        
        // Restaurer les headers
        Object.entries(cached.headers || {}).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', `${type}:${cacheKey}`);
        
        res.status(cached.statusCode).json(cached.data);
        return;
      }

      // Cache miss - intercepter la réponse pour la mettre en cache
      log.info(`Cache MISS: ${type}:${cacheKey}`);
      
      const originalJson = res.json;
      const originalStatus = res.status;
      let statusCode = 200;

      // Intercepter res.status()
      res.status = function(code: number) {
        statusCode = code;
        return originalStatus.call(this, code);
      };

      // Intercepter res.json()
      res.json = function(data: any) {
        // Ne mettre en cache que les réponses de succès
        if (statusCode >= 200 && statusCode < 300) {
          const headers: Record<string, string> = {};
          
          // Copier les headers pertinents
          ['content-type', 'content-encoding', 'etag'].forEach(header => {
            const value = res.getHeader(header);
            if (value && typeof value === 'string') {
              headers[header] = value;
            }
          });

          const responseToCache: CachedResponse = {
            data,
            statusCode,
            headers,
          };

          // Mise en cache asynchrone (non bloquante)
          redisCacheService.set(
            type,
            cacheKey,
            responseToCache,
            { 
              ttl: options.ttl,
              database: options.database, 
            },
          ).catch((error: Error) => {
            log.error('Erreur lors de la mise en cache:', { error: error.message });
          });

          log.info(`Réponse mise en cache: ${type}:${cacheKey} (status: ${statusCode})`);
        }

        // Ajouter les headers de cache
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', `${type}:${cacheKey}`);
        
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      log.error('Erreur dans le middleware de cache:', { error: String(error) });
      next();
    }
  };
}

/**
 * Génère une clé de cache par défaut basée sur la requête
 */
function generateDefaultCacheKey(req: Request): string {
  const baseKey = req.route ? req.route.path : req.path;
  const params = { ...req.params, ...req.query };
  
  // Inclure les paramètres de pagination et de filtre
  const relevantParams = Object.keys(params)
    .filter(key => !['timestamp', '_'].includes(key)) // Exclure les paramètres non pertinents
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return relevantParams ? `${baseKey}?${relevantParams}` : baseKey;
}

/**
 * Middleware d'invalidation automatique pour les opérations de modification
 */
export function invalidationMiddleware(entity: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;

    res.json = function(data: any) {
      // Déterminer l'action basée sur la méthode HTTP
      const actionMap: Record<string, 'create' | 'update' | 'delete'> = {
        POST: 'create',
        PUT: 'update',
        PATCH: 'update',
        DELETE: 'delete',
      };

      const action = actionMap[req.method];
      
      if (action && res.statusCode >= 200 && res.statusCode < 300) {
        
        // Invalidation intelligente asynchrone
        redisCacheService.smartInvalidation(entity, action)
          .catch((error: Error) => {
            log.error('Erreur lors de l\'invalidation:', { error: error.message });
          });
      }

      return originalJson.call(this, data);
    };

    next();
  };
}

/**
 * Endpoint pour les statistiques de cache
 */
export async function cacheStatsHandler(req: Request, res: Response) {
  try {
    const stats = await redisCacheService.getStats();
    res.json({
      cache: stats,
      health: redisCacheService.isHealthy(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log.error('Erreur lors de la récupération des statistiques:', { error: String(error) });
    res.status(500).json({
      error: 'Erreur lors de la récupération des statistiques de cache',
    });
  }
}

/**
 * Endpoint pour l'invalidation manuelle de cache
 */
export async function cacheInvalidateHandler(req: Request, res: Response) {
  try {
    const { pattern, type, database = '0' } = req.query as Record<string, string>;
    let invalidatedCount = 0;
    const dbNumber = parseInt(database, 10);

    if (pattern) {
      invalidatedCount = await redisCacheService.invalidatePattern(pattern, dbNumber);
    } else if (type) {
      invalidatedCount = await redisCacheService.invalidate(type, undefined, dbNumber);
    } else {
      return res.status(400).json({
        error: 'Pattern ou type requis pour l\'invalidation',
      });
    }

    res.json({
      message: 'Cache invalidé avec succès',
      invalidatedKeys: invalidatedCount,
      pattern: pattern || type,
      database: dbNumber,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log.error('Erreur lors de l\'invalidation:', { error: String(error) });
    res.status(500).json({
      error: 'Erreur lors de l\'invalidation du cache',
    });
  }
}
