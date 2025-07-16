FROM nginx:1.25-alpine

# Installation des outils et dépendances pour Redis
RUN apk add --no-cache curl redis

# Installation du module NGINX Redis (si disponible)
# Note: Pour une implémentation complète, nous utiliserons lua-resty-redis
RUN apk add --no-cache lua5.1 lua5.1-dev

# Copie de la configuration NGINX avec support Redis
COPY nginx.conf /etc/nginx/nginx.conf
COPY redis-cache.lua /etc/nginx/lua/redis-cache.lua

# Création des répertoires nécessaires
RUN mkdir -p /var/cache/nginx /etc/nginx/lua

# Page d'erreur personnalisée
COPY 50x.html /usr/share/nginx/html/

# Script de health check
COPY healthcheck.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/healthcheck.sh

# Configuration des logs
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
