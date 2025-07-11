import { Sale } from '../../../src/backend/domain/entities/Sale';
import { SaleItem } from '../../../src/backend/domain/entities/SaleItem';

describe('Sale Entity', () => {
    const mockDate = new Date('2024-01-15T10:30:00Z');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Sale class', () => {
        it('should create a sale with all properties', () => {
            const saleItems = [
                new SaleItem(1, 1, 101, 2, 25.50),
                new SaleItem(2, 1, 102, 1, 35.50),
            ];
            const sale = new Sale(1, mockDate, 2, saleItems);

            expect(sale.id).toBe(1);
            expect(sale.date).toBe(mockDate);
            expect(sale.storeId).toBe(2);
            expect(sale.saleItems).toBe(saleItems);
            expect(sale.saleItems).toHaveLength(2);
        });

        it('should create a sale with no items', () => {
            const sale = new Sale(1, mockDate, 1, []);

            expect(sale.id).toBe(1);
            expect(sale.saleItems).toEqual([]);
            expect(sale.saleItems).toHaveLength(0);
        });

        it('should create a sale with single item', () => {
            const saleItem = new SaleItem(1, 1, 101, 1, 10.00);
            const sale = new Sale(1, mockDate, 1, [saleItem]);

            expect(sale.saleItems).toHaveLength(1);
            expect(sale.saleItems[0]).toBe(saleItem);
        });

        it('should handle different store IDs', () => {
            const sale1 = new Sale(1, mockDate, 1, []);
            const sale2 = new Sale(2, mockDate, 999, []);

            expect(sale1.storeId).toBe(1);
            expect(sale2.storeId).toBe(999);
        });

        it('should handle dates properly', () => {
            const pastDate = new Date('2020-01-01');
            const futureDate = new Date('2030-12-31');

            const pastSale = new Sale(1, pastDate, 1, []);
            const futureSale = new Sale(2, futureDate, 1, []);

            expect(pastSale.date).toBe(pastDate);
            expect(futureSale.date).toBe(futureDate);
        });

        it('should allow property modification', () => {
            const sale = new Sale(1, mockDate, 1, []);
            const newItems = [new SaleItem(1, 1, 101, 1, 10.00)];

            sale.storeId = 2;
            sale.saleItems = newItems;

            expect(sale.storeId).toBe(2);
            expect(sale.saleItems).toBe(newItems);
        });

        it('should handle large arrays of sale items', () => {
            const manyItems = Array.from({ length: 100 }, (_, i) => 
                new SaleItem(i + 1, 1, i + 100, 1, 10.00),
            );
            const sale = new Sale(1, mockDate, 1, manyItems);

            expect(sale.saleItems).toHaveLength(100);
            expect(sale.saleItems[0].id).toBe(1);
            expect(sale.saleItems[99].id).toBe(100);
        });

        it('should handle edge case dates', () => {
            const epochDate = new Date(0);
            const maxDate = new Date(8640000000000000);

            const epochSale = new Sale(1, epochDate, 1, []);
            const maxSale = new Sale(2, maxDate, 1, []);

            expect(epochSale.date).toBe(epochDate);
            expect(maxSale.date).toBe(maxDate);
        });

        it('should calculate total from sale items', () => {
            const saleItems = [
                new SaleItem(1, 1, 101, 2, 25.50),
                new SaleItem(2, 1, 102, 1, 35.50),
            ];
            new Sale(1, mockDate, 1, saleItems);

            const calculatedTotal = saleItems.reduce((sum, item) => 
                sum + (item.quantity * item.unitPrice), 0,
            );
            expect(calculatedTotal).toBe(86.50);
        });
    });

    describe('SaleItem class', () => {
        it('should create a sale item with all properties', () => {
            const saleItem = new SaleItem(1, 5, 2, 25.50, 3);

            expect(saleItem.id).toBe(1);
            expect(saleItem.saleId).toBe(5);
            expect(saleItem.productId).toBe(2);
            expect(saleItem.quantity).toBe(25.50);
            expect(saleItem.unitPrice).toBe(3);
        });

        it('should handle single quantity items', () => {
            const saleItem = new SaleItem(1, 1, 5, 1, 10.00);

            expect(saleItem.quantity).toBe(1);
            expect(saleItem.unitPrice).toBe(10.00);
        });

        it('should handle multiple quantity items', () => {
            const saleItem = new SaleItem(1, 1, 3, 5, 15.00);

            expect(saleItem.quantity).toBe(5);
            expect(saleItem.unitPrice).toBe(15.00);
        });

        it('should handle decimal prices', () => {
            const saleItem = new SaleItem(1, 1, 1, 2, 12.34);

            expect(saleItem.unitPrice).toBe(12.34);
        });

        it('should handle large quantities and prices', () => {
            const largeQuantity = 1000000;
            const largePrice = 999.99;

            const saleItem = new SaleItem(1, 1, 1, largeQuantity, largePrice);

            expect(saleItem.quantity).toBe(largeQuantity);
            expect(saleItem.unitPrice).toBe(largePrice);
            expect(saleItem.quantity * saleItem.unitPrice).toBe(largeQuantity * largePrice);
        });

        it('should allow property modification', () => {
            const saleItem = new SaleItem(1, 1, 1, 2, 10.00);

            saleItem.quantity = 3;
            saleItem.unitPrice = 15.00;

            expect(saleItem.quantity).toBe(3);
            expect(saleItem.unitPrice).toBe(15.00);
        });

        it('should handle different sale and product IDs', () => {
            const saleItem1 = new SaleItem(1, 100, 200, 1, 10.00);
            const saleItem2 = new SaleItem(2, 999, 888, 2, 5.00);

            expect(saleItem1.saleId).toBe(100);
            expect(saleItem1.productId).toBe(200);
            expect(saleItem2.saleId).toBe(999);
            expect(saleItem2.productId).toBe(888);
        });
    });

    describe('Sale and SaleItem relationship scenarios', () => {
        it('should represent a complete sale scenario', () => {
            const saleItems = [
                new SaleItem(1, 1, 101, 2, 25.00),
                new SaleItem(2, 1, 102, 1, 35.50),
            ];
            const sale = new Sale(1, mockDate, 1, saleItems);

            const calculatedTotal = saleItems.reduce((sum, item) => 
                sum + (item.quantity * item.unitPrice), 0,
            );
            expect(calculatedTotal).toBe(85.50);
            expect(sale.saleItems).toHaveLength(2);
        });

        it('should maintain sale-item relationships', () => {
            const saleItems = [
                new SaleItem(1, 1, 101, 1, 10.00),
                new SaleItem(2, 1, 102, 2, 15.00),
            ];
            const sale = new Sale(1, mockDate, 1, saleItems);

            sale.saleItems.forEach(item => {
                expect(item.saleId).toBe(sale.id);
            });
        });

        it('should handle empty sale (no items)', () => {
            const sale = new Sale(1, mockDate, 1, []);

            const calculatedTotal = sale.saleItems.reduce((sum, item) => 
                sum + (item.quantity * item.unitPrice), 0,
            );
            expect(calculatedTotal).toBe(0);
            expect(sale.saleItems).toHaveLength(0);
        });

        it('should handle large number of items', () => {
            const manyItems = Array.from({ length: 50 }, (_, i) => 
                new SaleItem(i + 1, 1, i + 100, 1, 2.00),
            );
            const sale = new Sale(1, mockDate, 1, manyItems);

            const calculatedTotal = sale.saleItems.reduce((sum, item) => 
                sum + (item.quantity * item.unitPrice), 0,
            );
            expect(calculatedTotal).toBe(100.00);
            expect(sale.saleItems).toHaveLength(50);
        });
    });
});
