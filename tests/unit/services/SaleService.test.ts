import { SaleService } from '../../../src/backend/application/services/SaleService';
import { MockSaleRepository } from '../../mocks/repositories/MockSaleRepository';
import { MockStoreRepository } from '../../mocks/repositories/MockStoreRepository';
import { Sale } from '../../../src/backend/domain/entities/Sale';
import { SaleItem } from '../../../src/backend/domain/entities/SaleItem';
import { StoreStock } from '../../../src/backend/domain/entities/StoreStock';
import type { CartItem } from '../../../src/backend/domain/entities/CartItem';

describe('SaleService', () => {
    let saleService: SaleService;
    let mockSaleRepository: MockSaleRepository;
    let mockStoreRepository: MockStoreRepository;

    beforeEach(() => {
        mockSaleRepository = new MockSaleRepository();
        mockStoreRepository = new MockStoreRepository();
        saleService = new SaleService(mockSaleRepository, mockStoreRepository);
    });

    describe('getSaleById', () => {
        it('should return a sale when it exists', async () => {
            const saleItems = [
                new SaleItem(1, 1, 101, 2, 25.99),
                new SaleItem(2, 1, 102, 1, 15.50),
            ];
            const testSale = { 
                ...new Sale(1, new Date(), 1, saleItems), 
                saleItems,
            };
            mockSaleRepository.seed([testSale]);

            const result = await saleService.getSaleById(1);

            expect(result).not.toBeNull();
            expect(result?.id).toBe(1);
            expect(result?.saleItems).toHaveLength(2);
            expect(result?.saleItems[0].productId).toBe(101);
        });

        it('should return null when sale does not exist', async () => {
            const result = await saleService.getSaleById(999);
            expect(result).toBeNull();
        });
    });

    describe('recordSale', () => {
        beforeEach(() => {
            const storeStocks = [
                new StoreStock(1, 1, 101, 10),
                new StoreStock(2, 1, 102, 5),
                new StoreStock(3, 1, 103, 0),
            ];
            mockStoreRepository.seed([], storeStocks);
        });

        it('should record a sale successfully when stock is sufficient', async () => {
            const cartItems: CartItem[] = [
                { productId: 101, quantity: 2 },
                { productId: 102, quantity: 1 },
            ];

            const result = await saleService.recordSale(1, cartItems);

            expect(result).toBeInstanceOf(Sale);
            expect(result.storeId).toBe(1);
            expect(result.saleItems).toHaveLength(2);
            
            const stock101 = await mockStoreRepository.findStoreStockByProduct(1, 101);
            const stock102 = await mockStoreRepository.findStoreStockByProduct(1, 102);
            expect(stock101?.quantity).toBe(8);
            expect(stock102?.quantity).toBe(4);
        });

        it('should throw error when stock is insufficient', async () => {
            const cartItems: CartItem[] = [
                { productId: 101, quantity: 15 },
            ];

            await expect(saleService.recordSale(1, cartItems))
                .rejects.toThrow('Insufficient stock for product 101');
        });

        it('should throw error when product has no stock', async () => {
            const cartItems: CartItem[] = [
                { productId: 103, quantity: 1 },
            ];

            await expect(saleService.recordSale(1, cartItems))
                .rejects.toThrow('Insufficient stock for product 103');
        });

        it('should throw error when product does not exist in store', async () => {
            const cartItems: CartItem[] = [
                { productId: 999, quantity: 1 },
            ];

            await expect(saleService.recordSale(1, cartItems))
                .rejects.toThrow('Insufficient stock for product 999');
        });

        it('should handle multiple items with mixed stock scenarios', async () => {
            const cartItems: CartItem[] = [
                { productId: 101, quantity: 3 },
                { productId: 102, quantity: 10 },
            ];

            await expect(saleService.recordSale(1, cartItems))
                .rejects.toThrow('Insufficient stock for product 102');
        });

        it('should create sale with correct date and store information', async () => {
            const cartItems: CartItem[] = [
                { productId: 101, quantity: 1 },
            ];

            const result = await saleService.recordSale(1, cartItems);

            expect(result.storeId).toBe(1);
            expect(result.date).toBeInstanceOf(Date);
            expect(result.id).toBeGreaterThan(0);
        });
    });

    describe('sale transaction atomicity', () => {
        beforeEach(() => {
            const storeStocks = [
                new StoreStock(1, 1, 101, 5),
                new StoreStock(2, 1, 102, 3),
            ];
            mockStoreRepository.seed([], storeStocks);
        });

        it('should not modify stock if any item fails validation', async () => {
            const cartItems: CartItem[] = [
                { productId: 101, quantity: 2 },
                { productId: 102, quantity: 5 },
            ];

            const initialStock101 = await mockStoreRepository.findStoreStockByProduct(1, 101);
            const initialStock102 = await mockStoreRepository.findStoreStockByProduct(1, 102);

            await expect(saleService.recordSale(1, cartItems))
                .rejects.toThrow('Insufficient stock for product 102');

            const finalStock101 = await mockStoreRepository.findStoreStockByProduct(1, 101);
            const finalStock102 = await mockStoreRepository.findStoreStockByProduct(1, 102);
            
            expect(finalStock101?.quantity).toBe(initialStock101?.quantity);
            expect(finalStock102?.quantity).toBe(initialStock102?.quantity);
        });
    });

    describe('edge cases', () => {
        it('should handle empty cart items', async () => {
            const cartItems: CartItem[] = [];

            const result = await saleService.recordSale(1, cartItems);

            expect(result.saleItems).toHaveLength(0);
        });

        it('should handle zero quantity items', async () => {
            const storeStocks = [new StoreStock(1, 1, 101, 10)];
            mockStoreRepository.seed([], storeStocks);

            const cartItems: CartItem[] = [
                { productId: 101, quantity: 0 },
            ];

            const result = await saleService.recordSale(1, cartItems);
            
            expect(result.saleItems).toHaveLength(1);
            expect(result.saleItems[0].quantity).toBe(0);
            
            const stock = await mockStoreRepository.findStoreStockByProduct(1, 101);
            expect(stock?.quantity).toBe(10);
        });
    });
});
