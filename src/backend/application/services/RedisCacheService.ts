import type { RedisClientType } from 'redis';
import { createClient } from 'redis';
import { createControllerLogger } from '../../utils/logger';

interface CacheConfig {
  host: string;
  port: number;
  db?: number;
  defaultTtl: number;
}

interface CacheOptions {
  ttl?: number;
  database?: number;
}

/**
 * Service de cache Redis distribué avec gestion intelligente des TTL
 */
export class RedisCacheService {
  private readonly client: RedisClientType;
  private isConnected = false;
  private readonly log = createControllerLogger('RedisCacheService');
  
  // Configuration des TTL par type de contenu
  private readonly TTL_CONFIG = {
    // API Responses (DB 0)
    'products:list': 300,     // 5 min - données fréquemment consultées
    'products:detail': 600,   // 10 min - détails produit plus stables
    'inventory:store': 180,   // 3 min - stock magasin change souvent
    'inventory:central': 300, // 5 min - stock central plus stable
    'logistics:alerts': 60,   // 1 min - alertes critiques temps réel
    'logistics:requests': 120, // 2 min - demandes de réapprovisionnement
    'sales:reports': 900,     // 15 min - rapports de vente
    'auth:profile': 1800,     // 30 min - profil utilisateur
    
    // User Sessions (DB 1)
    'session': 3600,          // 1 heure - sessions utilisateur
    'session:refresh': 7200,  // 2 heures - tokens de rafraîchissement
    
    // Metrics (DB 2)
    'metrics:db': 300,        // 5 min - métriques base de données
    'metrics:app': 120,       // 2 min - métriques application
    'metrics:performance': 60, // 1 min - métriques de performance
    
    // Metadata (DB 3)
    'config:app': 3600,       // 1 heure - configuration application
    'schema:validation': 1800, // 30 min - schémas de validation
    'lookup:data': 7200,      // 2 heures - données de référence
  };

  constructor(config: CacheConfig) {
    this.client = createClient({
      socket: {
        host: config.host,
        port: config.port,
      },
      database: config.db || 0,
    });

    this.client.on('error', (err: Error) => {
      this.log.error('Erreur Redis:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      this.log.info('Connexion Redis établie');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      this.log.warn('Connexion Redis perdue');
      this.isConnected = false;
    });
  }

  /**
   * Initialise la connexion Redis
   */
  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.log.info('Service Redis Cache initialisé');
    } catch (error) {
      this.log.error('Échec de connexion Redis:', error as Error);
      throw error;
    }
  }

  /**
   * Ferme la connexion Redis
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
      this.log.info('Connexion Redis fermée');
    }
  }

  /**
   * Génère une clé de cache intelligente
   */
  private generateCacheKey(type: string, identifier: string, params?: Record<string, any>): string {
    let key = `cache:${type}:${identifier}`;
    
    if (params) {
      const paramString = Object.keys(params)
        .sort()
        .map(k => `${k}=${params[k]}`)
        .join('&');
      key += `:${Buffer.from(paramString).toString('base64').substring(0, 16)}`;
    }
    
    return key;
  }

  /**
   * Détermine le TTL intelligent basé sur le type de données
   */
  private getIntelligentTTL(type: string, customTtl?: number): number {
    if (customTtl) {
      return customTtl;
    }

    // Recherche du TTL configuré pour ce type
    for (const [configType, ttl] of Object.entries(this.TTL_CONFIG)) {
      if (type.startsWith(configType)) {
        return ttl;
      }
    }

    // TTL par défaut basé sur le pattern du type
    if (type.includes('list') || type.includes('alerts')) {
      return 60; // 1 min pour les listes et alertes
    }
    if (type.includes('detail') || type.includes('profile')) {
      return 600; // 10 min pour les détails
    }
    if (type.includes('report') || type.includes('config')) {
      return 1800; // 30 min pour les rapports et config
    }

    return 300; // 5 min par défaut
  }

  /**
   * Met en cache une valeur avec TTL intelligent
   */
  async set(
    type: string,
    identifier: string,
    value: any,
    options: CacheOptions = {},
  ): Promise<void> {
    if (!this.isConnected) {
      this.log.warn('Redis non connecté, cache ignoré');
      return;
    }

    try {
      const key = this.generateCacheKey(type, identifier, options);
      const ttl = this.getIntelligentTTL(type, options.ttl);
      const database = options.database || 0;
      
      // Sélectionner la base de données appropriée
      if (database !== 0) {
        await this.client.select(database);
      }

      await this.client.setEx(key, ttl, JSON.stringify({
        data: value,
        cached_at: new Date().toISOString(),
        ttl: ttl,
        type: type,
      }));

      this.log.info(`Cache SET: ${key} (TTL: ${ttl}s, DB: ${database})`);

      // Revenir à la DB 0 par défaut
      if (database !== 0) {
        await this.client.select(0);
      }
    } catch (error) {
      this.log.error('Erreur lors de la mise en cache:', error as Error);
    }
  }

  /**
   * Récupère une valeur du cache
   */
  async get<T = any>(
    type: string,
    identifier: string,
    options: CacheOptions = {},
  ): Promise<T | null> {
    if (!this.isConnected) {
      return null;
    }

    try {
      const key = this.generateCacheKey(type, identifier, options);
      const database = options.database || 0;
      
      // Sélectionner la base de données appropriée
      if (database !== 0) {
        await this.client.select(database);
      }

      const cached = await this.client.get(key);

      // Revenir à la DB 0 par défaut
      if (database !== 0) {
        await this.client.select(0);
      }

      if (!cached) {
        return null;
      }

      const parsed = JSON.parse(cached);
      this.log.info(`Cache HIT: ${key} (DB: ${database})`);
      
      return parsed.data as T;
    } catch (error) {
      this.log.error('Erreur lors de la lecture du cache:', error as Error);
      return null;
    }
  }

  /**
   * Invalide le cache par pattern
   */
  async invalidatePattern(
    pattern: string,
    database: number = 0,
  ): Promise<number> {
    if (!this.isConnected) {
      return 0;
    }

    try {
      // Sélectionner la base de données appropriée
      if (database !== 0) {
        await this.client.select(database);
      }

      const keys = await this.client.keys(`cache:${pattern}*`);
      
      if (keys.length > 0) {
        await this.client.del(keys);
        this.log.info(`Cache invalidé: ${keys.length} clés (pattern: ${pattern}, DB: ${database})`);
      }

      // Revenir à la DB 0 par défaut
      if (database !== 0) {
        await this.client.select(0);
      }

      return keys.length;
    } catch (error) {
      this.log.error('Erreur lors de l\'invalidation du cache:', error as Error);
      return 0;
    }
  }

  /**
   * Invalide le cache par type et identifiant
   */
  async invalidate(
    type: string,
    identifier?: string,
    database: number = 0,
  ): Promise<number> {
    const pattern = identifier ? `${type}:${identifier}` : type;
    return this.invalidatePattern(pattern, database);
  }

  /**
   * Invalidation intelligente basée sur les changements de données
   */
  async smartInvalidation(entity: string, action: 'create' | 'update' | 'delete'): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      const invalidationRules: Record<string, string[]> = {
        // Invalidation pour les produits
        product: [
          'products:list',
          'products:detail',
          'inventory:central',
          'sales:reports',
        ],
        
        // Invalidation pour les stocks
        stock: [
          'inventory:store',
          'inventory:central',
          'logistics:alerts',
          'products:list',
        ],
        
        // Invalidation pour les ventes
        sale: [
          'sales:reports',
          'inventory:store',
          'logistics:alerts',
        ],
        
        // Invalidation pour la logistique
        logistics: [
          'logistics:requests',
          'logistics:alerts',
          'inventory:central',
          'inventory:store',
        ],
        
        // Invalidation pour les utilisateurs
        user: [
          'auth:profile',
        ],
      };

      const patterns = invalidationRules[entity] || [];
      let totalInvalidated = 0;

      for (const pattern of patterns) {
        const count = await this.invalidatePattern(pattern);
        totalInvalidated += count;
      }

      this.log.info(`Smart invalidation: ${entity}:${action} -> ${totalInvalidated} clés invalidées`);
    } catch (error) {
      this.log.error('Erreur lors de l\'invalidation intelligente:', error as Error);
    }
  }

  /**
   * Statistiques du cache
   */
  async getStats(): Promise<any> {
    if (!this.isConnected) {
      return { error: 'Redis non connecté' };
    }

    try {
      const info = await this.client.info('memory');
      const dbSizes: Record<string, number> = {};
      
      // Obtenir la taille de chaque base de données
      for (let db = 0; db <= 3; db++) {
        await this.client.select(db);
        dbSizes[`db${db}`] = await this.client.dbSize();
      }
      
      // Revenir à la DB 0
      await this.client.select(0);

      return {
        memory: info,
        databases: dbSizes,
        connected: this.isConnected,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.log.error('Erreur lors de la récupération des stats:', error as Error);
      return { error: 'Erreur lors de la récupération des statistiques' };
    }
  }

  /**
   * Vérifie si le service est connecté
   */
  isHealthy(): boolean {
    return this.isConnected;
  }
}

// Instance singleton
export const redisCacheService = new RedisCacheService({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  defaultTtl: 300,
});
