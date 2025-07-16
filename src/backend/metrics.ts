import * as client from 'prom-client';
import type * as express from 'express';

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics(); // CPU, mémoire, etc.

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.5, 1, 1.5, 2, 5],
});

export const errorCounter = new client.Counter({
  name: 'http_errors_total',
  help: 'Nombre de réponses HTTP 4xx/5xx',
  labelNames: ['method', 'route', 'code'],
});

// Métriques du pool de connexions de base de données
export const dbConnectionPoolSize = new client.Gauge({
  name: 'db_connection_pool_size',
  help: 'Taille actuelle du pool de connexions de la base de données',
});

export const dbConnectionPoolIdle = new client.Gauge({
  name: 'db_connection_pool_idle',
  help: 'Nombre de connexions inactives dans le pool',
});

export const dbConnectionPoolUsed = new client.Gauge({
  name: 'db_connection_pool_used',
  help: 'Nombre de connexions actives dans le pool',
});

export const dbConnectionPoolWaiting = new client.Gauge({
  name: 'db_connection_pool_waiting',
  help: 'Nombre de requêtes en attente d\'une connexion',
});

export const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Durée des requêtes de base de données en secondes',
  labelNames: ['model', 'action'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

export const dbQueryTotal = new client.Counter({
  name: 'db_queries_total',
  help: 'Nombre total de requêtes de base de données',
  labelNames: ['model', 'action', 'result'],
});

export const dbConnectionErrors = new client.Counter({
  name: 'db_connection_errors_total',
  help: 'Nombre total d\'erreurs de connexion à la base de données',
  labelNames: ['error_type'],
});

export function metricsMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    const routePath = req.route?.path || req.path; // fallback
    const labels = { method: req.method, route: routePath, code: res.statusCode };
    end(labels);
    if (res.statusCode >= 400) {
        errorCounter.inc(labels);
    }
  });
  next();
}

export function metricsRoute(app: express.Express) {
  app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  });
}
