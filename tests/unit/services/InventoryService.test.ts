import { InventoryService } from '../../../src/backend/application/services/InventoryService';
import { MockLogisticsRepository } from '../../mocks/repositories/MockLogisticsRepository';
import { MockStoreRepository } from '../../mocks/repositories/MockStoreRepository';
import { StoreStock } from '../../../src/backend/domain/entities/StoreStock';

describe('InventoryService', () => {
    let inventoryService: InventoryService;
    let mockLogisticsRepository: MockLogisticsRepository;
    let mockStoreRepository: MockStoreRepository;

    beforeEach(() => {
        mockLogisticsRepository = new MockLogisticsRepository();
        mockStoreRepository = new MockStoreRepository();
        inventoryService = new InventoryService(mockLogisticsRepository, mockStoreRepository);
    });

    describe('getCentralStock', () => {
        it('should return central stock from logistics repository', async () => {
            const mockCentralStock = [
                { productId: 1, stock: 100 },
                { productId: 2, stock: 50 },
                { productId: 3, stock: 25 },
            ];
            mockLogisticsRepository.seed(mockCentralStock);

            const result = await inventoryService.getCentralStock();

            expect(result.products).toEqual(mockCentralStock.map(s => ({
                productId: s.productId,
                stock: s.stock,
                name: expect.any(String),
            })));
            expect(result.products).toHaveLength(3);
        });

        it('should return empty array when no central stock exists', async () => {
            const result = await inventoryService.getCentralStock();
            expect(result.products).toEqual([]);
            expect(result.products).toHaveLength(0);
        });

        it('should handle products with zero stock', async () => {
            const mockCentralStock = [
                { productId: 1, stock: 0, name: 'Produit 1' },
                { productId: 2, stock: 100, name: 'Produit 2' },
            ];
            mockLogisticsRepository.seed(mockCentralStock);

            const result = await inventoryService.getCentralStock();

            expect(result.products).toEqual(mockCentralStock);
            expect(result.products[0].stock).toBe(0);
        });

        it('should maintain product ID and stock integrity', async () => {
            const mockCentralStock = [
                { productId: 12345, stock: 999 },
            ];
            mockLogisticsRepository.seed(mockCentralStock);

            const result = await inventoryService.getCentralStock();

            expect(result.products[0].productId).toBe(12345);
            expect(result.products[0].stock).toBe(999);
        });
    });

    describe('getStoreStock', () => {
        beforeEach(() => {
            const storeStocks = [
                new StoreStock(1, 1, 101, 20),
                new StoreStock(2, 1, 102, 15),
                new StoreStock(3, 2, 101, 30),
                new StoreStock(4, 2, 103, 5),
            ];
            mockStoreRepository.seed([], storeStocks);
        });

        it('should return stock for specific store', async () => {
            const result = await inventoryService.getStoreStock(1);

            expect(result).toHaveLength(2);
            expect(result.every(stock => stock.storeId === 1)).toBe(true);
            
            const productIds = result.map(s => s.productId);
            expect(productIds).toContain(101);
            expect(productIds).toContain(102);
        });

        it('should return correct quantities for store products', async () => {
            const result = await inventoryService.getStoreStock(1);

            const product101Stock = result.find(s => s.productId === 101);
            const product102Stock = result.find(s => s.productId === 102);
            
            expect(product101Stock?.quantity).toBe(20);
            expect(product102Stock?.quantity).toBe(15);
        });

        it('should return empty array for store with no stock', async () => {
            const result = await inventoryService.getStoreStock(999);

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('should return different stocks for different stores', async () => {
            const store1Stock = await inventoryService.getStoreStock(1);
            const store2Stock = await inventoryService.getStoreStock(2);

            expect(store1Stock).toHaveLength(2);
            expect(store2Stock).toHaveLength(2);
            
            const store1ProductIds = store1Stock.map(s => s.productId);
            expect(store1ProductIds).toEqual(expect.arrayContaining([101, 102]));
            
            const store2ProductIds = store2Stock.map(s => s.productId);
            expect(store2ProductIds).toEqual(expect.arrayContaining([101, 103]));
        });

        it('should return StoreStock instances with correct properties', async () => {
            const result = await inventoryService.getStoreStock(1);

            expect(result).toHaveLength(2);
            result.forEach(stock => {
                expect(stock).toBeInstanceOf(StoreStock);
                expect(stock.id).toBeGreaterThan(0);
                expect(stock.storeId).toBe(1);
                expect(stock.productId).toBeGreaterThan(0);
                expect(stock.quantity).toBeGreaterThanOrEqual(0);
            });
        });

        it('should handle stores with zero quantity products', async () => {
            const zeroStocks = [
                new StoreStock(5, 3, 201, 0),
                new StoreStock(6, 3, 202, 10),
            ];
            mockStoreRepository.seed([], zeroStocks);

            const result = await inventoryService.getStoreStock(3);

            expect(result).toHaveLength(2);
            const zeroStock = result.find(s => s.productId === 201);
            expect(zeroStock?.quantity).toBe(0);
        });
    });

    describe('integration scenarios', () => {
        it('should handle concurrent central and store stock operations', async () => {
            const centralStock = [
                { productId: 101, stock: 1000 },
                { productId: 102, stock: 500 },
            ];
            mockLogisticsRepository.seed(centralStock);

            const storeStocks = [
                new StoreStock(1, 1, 101, 50),
                new StoreStock(2, 1, 102, 25),
                new StoreStock(3, 2, 101, 75),
            ];
            mockStoreRepository.seed([], storeStocks);

            const [centralResult, store1Result, store2Result] = await Promise.all([
                inventoryService.getCentralStock(),
                inventoryService.getStoreStock(1),
                inventoryService.getStoreStock(2),
            ]);

            expect(centralResult.products).toHaveLength(2);
            expect(store1Result).toHaveLength(2);
            expect(store2Result).toHaveLength(1);
            
            expect(centralResult.products.find(s => s.productId === 101)?.stock).toBe(1000);
            expect(store1Result.find(s => s.productId === 101)?.quantity).toBe(50);
            expect(store2Result.find(s => s.productId === 101)?.quantity).toBe(75);
        });

        it('should maintain data consistency across multiple calls', async () => {
            const centralStock = [{ productId: 1, stock: 100 }];
            const storeStocks = [new StoreStock(1, 1, 1, 10)];
            
            mockLogisticsRepository.seed(centralStock);
            mockStoreRepository.seed([], storeStocks);

            const centralResult1 = await inventoryService.getCentralStock();
            const centralResult2 = await inventoryService.getCentralStock();
            const storeResult1 = await inventoryService.getStoreStock(1);
            const storeResult2 = await inventoryService.getStoreStock(1);

            expect(centralResult1).toEqual(centralResult2);
            expect(storeResult1).toEqual(storeResult2);
        });
    });

    describe('edge cases', () => {
        it('should handle large quantities', async () => {
            const largeStock = [{ productId: 1, stock: Number.MAX_SAFE_INTEGER - 1 }];
            mockLogisticsRepository.seed(largeStock);

            const result = await inventoryService.getCentralStock();

            expect(result.products[0].stock).toBe(Number.MAX_SAFE_INTEGER - 1);
        });

        it('should handle many products in central stock', async () => {
            const manyProducts = Array.from({ length: 1000 }, (_, i) => ({
                productId: i + 1,
                stock: Math.floor(Math.random() * 100),
            }));
            mockLogisticsRepository.seed(manyProducts);

            const result = await inventoryService.getCentralStock();

            expect(result.products).toHaveLength(1000);
            expect(result.products[0].productId).toBe(1);
            expect(result.products[999].productId).toBe(1000);
        });

        it('should handle many products in store stock', async () => {
            const manyStoreStocks = Array.from({ length: 100 }, (_, i) => 
                new StoreStock(i + 1, 1, i + 1, Math.floor(Math.random() * 50)),
            );
            mockStoreRepository.seed([], manyStoreStocks);

            const result = await inventoryService.getStoreStock(1);

            expect(result).toHaveLength(100);
            expect(result.every(s => s.storeId === 1)).toBe(true);
        });
    });
});
