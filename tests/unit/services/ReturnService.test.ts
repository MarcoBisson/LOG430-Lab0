import { ReturnService } from '../../../src/backend/application/services/ReturnService';
import { MockSaleRepository } from '../../mocks/repositories/MockSaleRepository';
import { MockStoreRepository } from '../../mocks/repositories/MockStoreRepository';
import { Sale } from '../../../src/backend/domain/entities/Sale';
import { SaleItem } from '../../../src/backend/domain/entities/SaleItem';
import { StoreStock } from '../../../src/backend/domain/entities/StoreStock';
import { Store } from '../../../src/backend/domain/entities/Store';
import { StoreType } from '@prisma/client';

describe('ReturnService', () => {
    let returnService: ReturnService;
    let mockSaleRepository: MockSaleRepository;
    let mockStoreRepository: MockStoreRepository;

    beforeEach(() => {
        mockSaleRepository = new MockSaleRepository();
        mockStoreRepository = new MockStoreRepository();
        returnService = new ReturnService(mockSaleRepository, mockStoreRepository);
    });

    describe('processReturn', () => {
        beforeEach(() => {
            const initialStoreStocks = [
                new StoreStock(1, 1, 101, 10),
                new StoreStock(2, 1, 102, 5),
                new StoreStock(3, 2, 101, 20),
            ];
            mockStoreRepository.seed([], initialStoreStocks);
        });

        it('should process return successfully for valid sale', async () => {
            const saleItems = [
                new SaleItem(1, 1, 101, 3, 25.99),
                new SaleItem(2, 1, 102, 2, 15.50),
            ];
            const sale = {
                ...new Sale(1, new Date(), 1, saleItems),
                saleItems,
            };
            mockSaleRepository.seed([sale]);

            await returnService.processReturn(1);

            const stock101 = await mockStoreRepository.findStoreStockByProduct(1, 101);
            const stock102 = await mockStoreRepository.findStoreStockByProduct(1, 102);
            
            expect(stock101?.quantity).toBe(13);
            expect(stock102?.quantity).toBe(7);

            const deletedSale = await mockSaleRepository.getSaleById(1);
            expect(deletedSale).toBeNull();
        });

        it('should throw error when sale does not exist', async () => {
            await expect(returnService.processReturn(999))
                .rejects.toThrow('Vente 999 introuvable.');
        });

        it('should handle returns for single item sales', async () => {
            const saleItems = [
                new SaleItem(1, 1, 101, 5, 10.00),
            ];
            const sale = {
                ...new Sale(1, new Date(), 1, saleItems),
                saleItems,
            };
            mockSaleRepository.seed([sale]);

            await returnService.processReturn(1);

            const stock = await mockStoreRepository.findStoreStockByProduct(1, 101);
            expect(stock?.quantity).toBe(15); // 10 + 5 returned
        });

        it('should handle returns for multiple items of same product', async () => {
            const saleItems = [
                new SaleItem(1, 1, 101, 2, 25.99),
                new SaleItem(2, 1, 101, 3, 25.99),
            ];
            const sale = {
                ...new Sale(1, new Date(), 1, saleItems),
                saleItems,
            };
            mockSaleRepository.seed([sale]);

            await returnService.processReturn(1);

            const stock = await mockStoreRepository.findStoreStockByProduct(1, 101);
            expect(stock?.quantity).toBe(15);
        });

        it('should handle returns with zero quantity items', async () => {
            const saleItems = [
                new SaleItem(1, 1, 101, 0, 25.99),
                new SaleItem(2, 1, 102, 1, 15.50),
            ];
            const sale = {
                ...new Sale(1, new Date(), 1, saleItems),
                saleItems,
            };
            mockSaleRepository.seed([sale]);

            await returnService.processReturn(1);

            const stock101 = await mockStoreRepository.findStoreStockByProduct(1, 101);
            const stock102 = await mockStoreRepository.findStoreStockByProduct(1, 102);
            
            expect(stock101?.quantity).toBe(10);
            expect(stock102?.quantity).toBe(6);
        });

        it('should handle returns for products not currently in stock', async () => {
            const saleItems = [
                new SaleItem(1, 1, 999, 1, 10.00),
            ];
            const sale = {
                ...new Sale(1, new Date(), 1, saleItems),
                saleItems,
            };
            mockSaleRepository.seed([sale]);

            await expect(returnService.processReturn(1)).resolves.not.toThrow();

            const newStock = await mockStoreRepository.findStoreStockByProduct(1, 999);
            expect(newStock?.quantity).toBe(1);
        });

        it('should handle returns across different stores', async () => {
            const saleItems = [
                new SaleItem(1, 2, 101, 3, 25.99),
            ];
            const sale = {
                ...new Sale(2, new Date(), 2, saleItems),
                saleItems,
            };
            mockSaleRepository.seed([sale]);

            await returnService.processReturn(2);

            const store2Stock = await mockStoreRepository.findStoreStockByProduct(2, 101);
            expect(store2Stock?.quantity).toBe(23);

            const store1Stock = await mockStoreRepository.findStoreStockByProduct(1, 101);
            expect(store1Stock?.quantity).toBe(10);
        });

        it('should handle sales with no items', async () => {
            const sale = {
                ...new Sale(1, new Date(), 1, []),
                saleItems: [],
            };
            mockSaleRepository.seed([sale]);

            await expect(returnService.processReturn(1)).resolves.not.toThrow();

            const stock = await mockStoreRepository.findStoreStockByProduct(1, 101);
            expect(stock?.quantity).toBe(10);
        });

        it('should handle large quantity returns', async () => {
            const saleItems = [
                new SaleItem(1, 1, 101, 1000, 1.00),
            ];
            const sale = {
                ...new Sale(1, new Date(), 1, saleItems),
                saleItems,
            };
            mockSaleRepository.seed([sale]);

            await returnService.processReturn(1);

            const stock = await mockStoreRepository.findStoreStockByProduct(1, 101);
            expect(stock?.quantity).toBe(1010);
        });

        it('should be all items returned or none', async () => {
            const saleItems = [
                new SaleItem(1, 1, 101, 2, 25.99),
                new SaleItem(2, 1, 102, 1, 15.50),
            ];
            const sale = {
                ...new Sale(1, new Date(), 1, saleItems),
                saleItems,
            };
            mockSaleRepository.seed([sale]);

            let callCount = 0;
            const originalIncrement = mockStoreRepository.incrementStoreStock;
            mockStoreRepository.incrementStoreStock = jest.fn(async (storeId, productId, quantity) => {
                callCount++;
                if (callCount === 2) {
                    throw new Error('Simulated failure on second item');
                }
                return originalIncrement.call(mockStoreRepository, storeId, productId, quantity);
            });

            await expect(returnService.processReturn(1)).rejects.toThrow('Simulated failure on second item');

            const saleStillExists = await mockSaleRepository.getSaleById(1);
            expect(saleStillExists).not.toBeNull();
        });
    });

    describe('edge cases and error handling', () => {
        it('should handle concurrent return attempts', async () => {
            const saleItems = [
                new SaleItem(1, 1, 101, 1, 10.00),
            ];
            const sale = {
                ...new Sale(1, new Date(), 1, saleItems),
                saleItems,
            };
            mockSaleRepository.seed([sale]);

            await returnService.processReturn(1);

            await expect(returnService.processReturn(1))
                .rejects.toThrow('Vente 1 introuvable.');
        });

        it('should handle very old sales', async () => {
            const oldDate = new Date('2020-01-01');
            const saleItems = [
                new SaleItem(1, 1, 101, 1, 10.00),
            ];
            const sale = {
                ...new Sale(1, oldDate, 1, saleItems),
                saleItems,
            };
            mockSaleRepository.seed([sale]);

            await expect(returnService.processReturn(1)).resolves.not.toThrow();
        });

        it('should preserve sale item details during return process', async () => {
            const saleItems = [
                new SaleItem(1, 1, 101, 5, 25.99),
                new SaleItem(2, 1, 102, 3, 15.50),
            ];
            const sale = {
                ...new Sale(1, new Date(), 1, saleItems),
                saleItems,
            };
            mockSaleRepository.seed([sale]);

            const originalSale = await mockSaleRepository.getSaleById(1);
            expect(originalSale?.saleItems).toHaveLength(2);

            await returnService.processReturn(1);

            const deletedSale = await mockSaleRepository.getSaleById(1);
            expect(deletedSale).toBeNull();
        });
    });

    describe('integration with stock management', () => {
        it('should correctly update stock levels across multiple returns', async () => {
            const store = new Store(1, 'Store 1', 'Address 1', StoreType.SALES);
            const initialStock = new StoreStock(1, 1, 101, 10);
            mockStoreRepository.seed([store], [initialStock]);
            
            const sale1Items = [new SaleItem(1, 1, 101, 2, 10.00)];
            const sale2Items = [new SaleItem(2, 2, 101, 3, 10.00)];
            
            const sale1 = { ...new Sale(1, new Date(), 1, sale1Items), saleItems: sale1Items };
            const sale2 = { ...new Sale(2, new Date(), 1, sale2Items), saleItems: sale2Items };
            
            mockSaleRepository.seed([sale1, sale2]);

            await returnService.processReturn(1);
            let stock = await mockStoreRepository.findStoreStockByProduct(1, 101);
            expect(stock?.quantity).toBe(12);

            await returnService.processReturn(2);
            stock = await mockStoreRepository.findStoreStockByProduct(1, 101);
            expect(stock?.quantity).toBe(15);
        });
    });
});
