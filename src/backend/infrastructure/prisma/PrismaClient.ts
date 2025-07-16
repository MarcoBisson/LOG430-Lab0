import { PrismaClient } from '@prisma/client';
import { 
  dbConnectionPoolSize, 
  dbConnectionPoolIdle, 
  dbConnectionPoolUsed, 
  dbQueryDuration,
  dbQueryTotal,
  dbConnectionErrors,
} from '../../metrics';

class InstrumentedPrismaClient extends PrismaClient {
  constructor() {
    super();

    // Instrumenter les requêtes pour mesurer la durée et compter les appels
    this.$use(async (params, next) => {
      const end = dbQueryDuration.startTimer({ model: params.model || 'unknown', action: params.action });
      
      try {
        const result = await next(params);
        
        dbQueryTotal.inc({ 
          model: params.model || 'unknown', 
          action: params.action, 
          result: 'success', 
        });
        
        end();
        return result;
      } catch (error) {
        dbQueryTotal.inc({ 
          model: params.model || 'unknown', 
          action: params.action, 
          result: 'error', 
        });
        
        dbConnectionErrors.inc({ error_type: 'query_error' });
        end();
        throw error;
      }
    });
  }

  // Méthode pour obtenir les métriques du pool de connexions
  async getPoolMetrics() {
    try {
      // Prisma ne expose pas directement les métriques du pool de connexions
      // Mais on peut utiliser des requêtes système pour PostgreSQL
      const poolInfo = await this.$queryRaw`
        SELECT 
          (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()) as total_connections,
          (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database() AND state = 'active') as active_connections,
          (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database() AND state = 'idle') as idle_connections
      ` as Array<{
        total_connections: bigint;
        active_connections: bigint;
        idle_connections: bigint;
      }>;

      if (poolInfo && poolInfo.length > 0) {
        const info = poolInfo[0];
        dbConnectionPoolSize.set(Number(info.total_connections));
        dbConnectionPoolUsed.set(Number(info.active_connections));
        dbConnectionPoolIdle.set(Number(info.idle_connections));
      }
    } catch (error) {
      console.error('Error getting pool metrics:', error);
      dbConnectionErrors.inc({ error_type: 'metrics_error' });
    }
  }

  // Méthode pour démarrer la collecte périodique des métriques
  startMetricsCollection(intervalMs: number = 30000) {
    setInterval(() => {
      this.getPoolMetrics();
    }, intervalMs);
  }
}

// Instance singleton de Prisma
export const prisma = new InstrumentedPrismaClient();

// Démarrer la collecte de métriques au démarrage
prisma.startMetricsCollection();

export default prisma;
