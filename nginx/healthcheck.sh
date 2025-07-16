#!/bin/sh

# Health check script pour NGINX Load Balancer

# Vérifier que NGINX répond
if ! curl -f http://localhost/health >/dev/null 2>&1; then
    echo "NGINX health check failed"
    exit 1
fi

# Vérifier le status NGINX
if ! curl -f http://localhost/nginx-status >/dev/null 2>&1; then
    echo "NGINX status check failed"
    exit 1
fi

echo "NGINX is healthy"
exit 0
