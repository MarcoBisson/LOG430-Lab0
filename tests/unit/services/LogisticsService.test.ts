import { LogisticsService } from '../../../src/backend/application/services/LogisticsService';
import { MockLogisticsRepository } from '../../mocks/repositories/MockLogisticsRepository';
import { MockStoreRepository } from '../../mocks/repositories/MockStoreRepository';
import { Store } from '../../../src/backend/domain/entities/Store';
import { StoreStock } from '../../../src/backend/domain/entities/StoreStock';
import { ReplenishmentRequest } from '../../../src/backend/domain/entities/ReplenishmentRequest';
import type { ReplenishmentRequestStatus, StoreType } from '@prisma/client';

describe('LogisticsService', () => {
    let logisticsService: LogisticsService;
    let mockLogisticsRepository: MockLogisticsRepository;
    let mockStoreRepository: MockStoreRepository;

    beforeEach(() => {
        mockStoreRepository = new MockStoreRepository();
        mockLogisticsRepository = new MockLogisticsRepository(mockStoreRepository);
        logisticsService = new LogisticsService(mockLogisticsRepository, mockStoreRepository);
    });

    describe('requestReplenishment', () => {
        beforeEach(() => {
            const stores = [
                new Store(1, 'Main Store', '123 Main St', 'SALES' as StoreType),
                new Store(2, 'Warehouse', '456 Storage Ave', 'LOGISTICS' as StoreType),
            ];
            mockStoreRepository.seed(stores);
        });

        it('should create replenishment request for valid sales store', async () => {
            const result = await logisticsService.requestReplenishment(1, 101, 50);

            expect(result).toBeInstanceOf(ReplenishmentRequest);
            expect(result.storeId).toBe(1);
            expect(result.productId).toBe(101);
            expect(result.quantity).toBe(50);
            expect(result.status).toBe('PENDING');
        });

        it('should throw error when store does not exist', async () => {
            await expect(logisticsService.requestReplenishment(999, 101, 50))
                .rejects.toThrow('Store not found');
        });

        it('should throw error when store type is not SALES', async () => {
            await expect(logisticsService.requestReplenishment(2, 101, 50))
                .rejects.toThrow('Invalid store type for replenishment');
        });

        it('should handle zero quantity request', async () => {
            const result = await logisticsService.requestReplenishment(1, 101, 0);
            expect(result.quantity).toBe(0);
        });

        it('should handle large quantity request', async () => {
            const result = await logisticsService.requestReplenishment(1, 101, 10000);
            expect(result.quantity).toBe(10000);
        });
    });

    describe('approveReplenishment', () => {
        beforeEach(() => {
            const stores = [
                new Store(1, 'Main Store', '123 Main St', 'SALES' as StoreType),
                new Store(2, 'Warehouse', '456 Storage Ave', 'LOGISTICS' as StoreType),
            ];
            const logisticStores = [stores[1]];
            
            const centralStock = [
                { productId: 101, stock: 100 },
                { productId: 102, stock: 5 },
            ];

            const requests = [
                new ReplenishmentRequest(1, 1, 101, 20, 'PENDING' as ReplenishmentRequestStatus, new Date()),
                new ReplenishmentRequest(2, 1, 102, 10, 'PENDING' as ReplenishmentRequestStatus, new Date()),
            ];

            mockStoreRepository.seed(stores);
            mockLogisticsRepository.seed(centralStock, requests, logisticStores);
        });

        it('should approve replenishment request successfully', async () => {
            // Ajouter le stock du produit 101 dans le magasin logistique (ID 2)
            const logisticStoreStocks = [new StoreStock(1, 2, 101, 100)];
            mockStoreRepository.seed([
                new Store(1, 'Main Store', '123 Main St', 'SALES' as StoreType),
                new Store(2, 'Warehouse', '456 Storage Ave', 'LOGISTICS' as StoreType),
            ], logisticStoreStocks);

            const result = await logisticsService.approveReplenishment(1);

            expect(result.status).toBe('APPROVED');
            expect(result.id).toBe(1);

            // Vérifier que le stock du magasin logistique a été décrémenté
            const updatedLogisticStock = await mockStoreRepository.findStoreStockByProduct(2, 101);
            expect(updatedLogisticStock?.quantity).toBe(80); // 100 - 20 = 80

            // Vérifier que le stock du magasin de vente a été incrémenté
            const salesStoreStock = await mockStoreRepository.findStoreStockByProduct(1, 101);
            expect(salesStoreStock?.quantity).toBe(20);
        });

        it('should throw error when request does not exist', async () => {
            await expect(logisticsService.approveReplenishment(999))
                .rejects.toThrow('Request not found');
        });

        it('should throw error when store does not exist', async () => {
            const invalidRequest = new ReplenishmentRequest(
                3, 999, 101, 10, 'PENDING' as ReplenishmentRequestStatus, new Date(),
            );
            mockLogisticsRepository.seed([], [invalidRequest], []);

            await expect(logisticsService.approveReplenishment(3))
                .rejects.toThrow('Store not found');
        });

        it('should throw error when store type is not SALES', async () => {
            const invalidRequest = new ReplenishmentRequest(
                3, 2, 101, 10, 'PENDING' as ReplenishmentRequestStatus, new Date(),
            );
            mockLogisticsRepository.seed([], [invalidRequest], []);

            await expect(logisticsService.approveReplenishment(3))
                .rejects.toThrow('Invalid store type for replenishment');
        });

        it('should throw error when insufficient central stock', async () => {
            // Configurer un stock insuffisant dans le magasin logistique pour le produit 102
            // Le test demande 10 mais nous ne mettons que 5 en stock
            const insufficientStoreStocks = [new StoreStock(1, 2, 102, 5)];
            mockStoreRepository.seed([
                new Store(1, 'Main Store', '123 Main St', 'SALES' as StoreType),
                new Store(2, 'Warehouse', '456 Storage Ave', 'LOGISTICS' as StoreType),
            ], insufficientStoreStocks);

            await expect(logisticsService.approveReplenishment(2))
                .rejects.toThrow('Insufficient stock in logistics stores for product 102. Required: 10');
        });

        it('should increment store stock when approved', async () => {
            const stores = [
                new Store(1, 'Test Store', '123 Test St', 'SALES' as StoreType),
                new Store(2, 'Warehouse', '456 Storage Ave', 'LOGISTICS' as StoreType)
            ];
            const storeStocks = [
                new StoreStock(1, 1, 101, 30), // Stock initial du magasin de vente
                new StoreStock(2, 2, 101, 100) // Stock du magasin logistique
            ];
            mockStoreRepository.seed(stores, storeStocks);

            // Nous devons aussi configurer les magasins logistiques et la demande
            const logisticStores = [stores[1]];
            const requests = [
                new ReplenishmentRequest(1, 1, 101, 20, 'PENDING' as ReplenishmentRequestStatus, new Date()),
            ];
            mockLogisticsRepository.seed([], requests, logisticStores);

            await logisticsService.approveReplenishment(1);

            const storeStock = await mockStoreRepository.findStoreStockByProduct(1, 101);
            expect(storeStock?.quantity).toBe(50); // 30 + 20 = 50
        });
    });

    describe('checkCriticalStock', () => {
        beforeEach(() => {
            const storeStocks = [
                new StoreStock(1, 1, 101, 2),
                new StoreStock(2, 1, 102, 8),
                new StoreStock(3, 1, 103, 0),
                new StoreStock(4, 2, 101, 3),
            ];
            mockStoreRepository.seed([], storeStocks);
        });

        it('should return stocks below default threshold', async () => {
            const result = await logisticsService.checkCriticalStock();

            expect(result).toHaveLength(3);
            expect(result.map(s => s.quantity)).toEqual([2, 0, 3]);
        });

        it('should return stocks below custom threshold', async () => {
            const result = await logisticsService.checkCriticalStock(10);

            expect(result).toHaveLength(4);
        });

        it('should return stocks below low threshold', async () => {
            const result = await logisticsService.checkCriticalStock(1);

            expect(result).toHaveLength(1);
        });

        it('should handle zero threshold', async () => {
            const result = await logisticsService.checkCriticalStock(0);

            expect(result).toHaveLength(0);
        });
    });

    describe('getReplenishments', () => {
        it('should return all replenishment requests', async () => {
            const requests = [
                new ReplenishmentRequest(1, 1, 101, 20, 'PENDING' as ReplenishmentRequestStatus, new Date()),
                new ReplenishmentRequest(2, 1, 102, 15, 'APPROVED' as ReplenishmentRequestStatus, new Date()),
                new ReplenishmentRequest(3, 2, 103, 30, 'REJECTED' as ReplenishmentRequestStatus, new Date()),
            ];
            mockLogisticsRepository.seed([], requests);

            const result = await logisticsService.getReplenishments();

            expect(result).toHaveLength(3);
            expect(result.map(r => r.status)).toEqual(['PENDING', 'APPROVED', 'REJECTED']);
        });

        it('should return empty array when no requests exist', async () => {
            const result = await logisticsService.getReplenishments();
            expect(result).toHaveLength(0);
        });
    });

    describe('getLogisticStores', () => {
        it('should return all logistics stores', async () => {
            const logisticStores = [
                new Store(1, 'Main Warehouse', '123 Storage St', 'LOGISTICS' as StoreType),
                new Store(2, 'Secondary Warehouse', '456 Supply Ave', 'LOGISTICS' as StoreType),
            ];
            mockLogisticsRepository.seed([], [], logisticStores);

            const result = await logisticsService.getLogisticStores();

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Main Warehouse');
            expect(result[1].name).toBe('Secondary Warehouse');
        });

        it('should return empty array when no logistics stores exist', async () => {
            const result = await logisticsService.getLogisticStores();
            expect(result).toHaveLength(0);
        });
    });

    describe('integration scenarios', () => {
        it('should handle complete replenishment workflow', async () => {
            const stores = [new Store(1, 'Store', '123 St', 'SALES' as StoreType)];
            const logisticStores = [new Store(2, 'Warehouse', '456 Ave', 'LOGISTICS' as StoreType)];
            
            // Configurer le stock dans le magasin logistique (pas le stock central global)
            const logisticStoreStocks = [new StoreStock(1, 2, 101, 100)]; // Store ID 2, Product 101, Quantity 100
            
            mockStoreRepository.seed(stores, logisticStoreStocks);
            mockLogisticsRepository.seed([], [], logisticStores);

            const request = await logisticsService.requestReplenishment(1, 101, 25);
            expect(request.status).toBe('PENDING');

            const allRequests = await logisticsService.getReplenishments();
            expect(allRequests).toHaveLength(1);

            const approved = await logisticsService.approveReplenishment(request.id);
            expect(approved.status).toBe('APPROVED');

            // Vérifier que le stock du magasin logistique a été décrémenté
            const updatedLogisticStock = await mockStoreRepository.findStoreStockByProduct(2, 101);
            expect(updatedLogisticStock?.quantity).toBe(75);

            // Vérifier que le stock du magasin de vente a été incrémenté
            const salesStoreStock = await mockStoreRepository.findStoreStockByProduct(1, 101);
            expect(salesStoreStock?.quantity).toBe(25);
        });
    });
});
