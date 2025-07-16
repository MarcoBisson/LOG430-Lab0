import { prisma } from '../../infrastructure/prisma/PrismaClient';
import { 
  dbConnectionPoolSize, 
  dbConnectionPoolIdle, 
  dbConnectionPoolUsed, 
  dbConnectionPoolWaiting, 
} from '../../metrics';

export class DatabaseMetricsService {
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Collecte les métriques du pool de connexions PostgreSQL
   */
  async collectPoolMetrics(): Promise<void> {
    try {
      // Requête pour obtenir les informations sur les connexions actives
      const connectionStats = await prisma.$queryRaw`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections,
          count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction,
          count(*) FILTER (WHERE wait_event_type IS NOT NULL) as waiting_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      ` as Array<{
        total_connections: bigint;
        active_connections: bigint;
        idle_connections: bigint;
        idle_in_transaction: bigint;
        waiting_connections: bigint;
      }>;

      if (connectionStats && connectionStats.length > 0) {
        const stats = connectionStats[0];
        
        // Mise à jour des métriques Prometheus
        dbConnectionPoolSize.set(Number(stats.total_connections));
        dbConnectionPoolUsed.set(Number(stats.active_connections) + Number(stats.idle_in_transaction));
        dbConnectionPoolIdle.set(Number(stats.idle_connections));
        dbConnectionPoolWaiting.set(Number(stats.waiting_connections));
      }

      // Métriques supplémentaires sur les verrous et les requêtes lentes
      const lockStats = await prisma.$queryRaw`
        SELECT count(*) as blocked_queries
        FROM pg_stat_activity 
        WHERE wait_event_type = 'Lock' AND datname = current_database()
      ` as Array<{ blocked_queries: bigint }>;

      if (lockStats && lockStats.length > 0) {
        // On peut ajouter une métrique pour les requêtes bloquées si nécessaire
        console.log(`Blocked queries: ${lockStats[0].blocked_queries}`);
      }

    } catch (error) {
      console.error('Erreur lors de la collecte des métriques du pool de connexions:', error);
    }
  }

  /**
   * Collecte les métriques de performance des requêtes
   */
  async collectQueryMetrics(): Promise<void> {
    try {
      // Approche plus défensive - vérifier d'abord si la table existe et ses colonnes
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'pg_catalog' 
          AND table_name = 'pg_stat_user_tables'
        ) as exists
      ` as Array<{ exists: boolean }>;

      if (!tableExists[0]?.exists) {
        console.log('pg_stat_user_tables n\'est pas disponible');
        return;
      }

      // Utiliser une requête plus simple et compatible
      const tableStats = await prisma.$queryRaw`
        SELECT 
          schemaname,
          relname,
          seq_scan,
          seq_tup_read,
          idx_scan,
          idx_tup_fetch,
          n_tup_ins,
          n_tup_upd,
          n_tup_del
        FROM pg_stat_user_tables
        WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
        ORDER BY (seq_tup_read + idx_tup_fetch) DESC
        LIMIT 10
      ` as Array<{
        schemaname: string;
        relname: string;
        seq_scan: bigint;
        seq_tup_read: bigint;
        idx_scan: bigint;
        idx_tup_fetch: bigint;
        n_tup_ins: bigint;
        n_tup_upd: bigint;
        n_tup_del: bigint;
      }>;

      // Log des statistiques pour debug (en développement)
      if (process.env.NODE_ENV === 'development' && tableStats) {
        console.log('Top tables par activité:');
        tableStats.forEach(table => {
          const totalReads = Number(table.seq_tup_read) + Number(table.idx_tup_fetch);
          console.log(`${table.relname}: ${totalReads} tuples lus`);
        });
      }

    } catch (error) {
      console.error('Erreur lors de la collecte des métriques de requête:', error);
      // En cas d'erreur, on continue sans faire planter l'application
    }
  }

  /**
   * Version simplifiée des métriques de base de données
   * Utilisée comme fallback si les tables système ne sont pas accessibles
   */
  async collectBasicDbMetrics(): Promise<void> {
    try {
      // Requête simple pour tester la connectivité
      const result = await prisma.$queryRaw`SELECT 1 as connected` as Array<{ connected: number }>;
      
      if (result && result[0]?.connected === 1) {
        console.log('Connexion DB OK');
        // On pourrait ajouter ici des métriques basiques comme le nombre d'enregistrements
        // dans les tables principales si nécessaire
      }
    } catch (error) {
      console.error('Erreur de connectivité DB:', error);
    }
  }

  /**
   * Démarre la collecte périodique des métriques
   */
  startMetricsCollection(intervalMs: number = 30000): void {
    if (this.intervalId) {
      console.warn('Collecte de métriques déjà démarrée');
      return;
    }

    console.log(`Démarrage de la collecte de métriques DB toutes les ${intervalMs}ms`);
    
    // Première collecte immédiate avec gestion d'erreurs
    this.collectPoolMetrics().catch(console.error);
    this.collectQueryMetrics().catch(console.error);

    // Collecte périodique
    this.intervalId = setInterval(async () => {
      try {
        await this.collectPoolMetrics();
        await this.collectQueryMetrics();
      } catch (error) {
        console.error('Erreur lors de la collecte périodique:', error);
        // Utiliser le fallback en cas d'erreur
        await this.collectBasicDbMetrics();
      }
    }, intervalMs);
  }

  /**
   * Arrête la collecte périodique des métriques
   */
  stopMetricsCollection(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Collecte de métriques DB arrêtée');
    }
  }

  /**
   * Collecte une fois toutes les métriques
   */
  async collectAllMetrics(): Promise<void> {
    try {
      await Promise.all([
        this.collectPoolMetrics(),
        this.collectQueryMetrics(),
      ]);
    } catch (error) {
      console.error('Erreur lors de la collecte complète des métriques:', error);
      // Utiliser le fallback
      await this.collectBasicDbMetrics();
    }
  }
}

// Instance singleton
export const databaseMetricsService = new DatabaseMetricsService();
