import { Sale } from '../../../src/backend/domain/entities/Sale';
import { SaleItem } from '../../../src/backend/domain/entities/SaleItem';
import type { ISaleRepository } from '../../../src/backend/domain/repositories/ISaleRepository';

export class MockSaleRepository implements ISaleRepository {
    private sales: (Sale & { saleItems: SaleItem[] })[] = [];
    private nextId = 1;

    // Helper methods
    seed(sales: (Sale & { saleItems: SaleItem[] })[]) {
        this.sales = sales;
        this.nextId = Math.max(...sales.map(s => s.id), 0) + 1;
    }

    clear() {
        this.sales = [];
        this.nextId = 1;
    }

    async createSale(storeId: number, items: { productId: number; quantity: number }[]): Promise<Sale & { saleItems: SaleItem[] }> {
        const saleItems = items.map(item => new SaleItem(
            Math.floor(Math.random() * 1000),
            this.nextId,
            item.productId,
            item.quantity,
            10.99, // Mock price
        ));

        const sale = {
            ...new Sale(this.nextId++, new Date(), storeId, saleItems),
            saleItems,
        };

        this.sales.push(sale);
        return sale;
    }

    async getSaleById(id: number): Promise<(Sale & { saleItems: SaleItem[] }) | null> {
        return this.sales.find(s => s.id === id) || null;
    }

    async deleteSale(id: number): Promise<void> {
        const index = this.sales.findIndex(s => s.id === id);
        if (index === -1) throw new Error(`Sale ${id} not found`);
        this.sales.splice(index, 1);
    }

    async groupSalesByStore(_userId: number, _startDate?: Date, _endDate?: Date): Promise<{ storeId: number; totalQuantity: number }[]> {
        const storeMap = new Map<number, number>();
        
        this.sales.forEach(sale => {
            const totalQuantity = sale.saleItems.reduce((sum, item) => sum + item.quantity, 0);
            storeMap.set(sale.storeId, (storeMap.get(sale.storeId) || 0) + totalQuantity);
        });

        return Array.from(storeMap.entries()).map(([storeId, totalQuantity]) => ({
            storeId,
            totalQuantity,
        }));
    }

    async getTopProducts(_userId: number, limit: number, _startDate?: Date, _endDate?: Date): Promise<{ productId: number; totalQuantity: number }[]> {
        const productMap = new Map<number, number>();
        
        this.sales.forEach(sale => {
            sale.saleItems.forEach(item => {
                productMap.set(item.productId, (productMap.get(item.productId) || 0) + item.quantity);
            });
        });

        return Array.from(productMap.entries())
            .map(([productId, totalQuantity]) => ({ productId, totalQuantity }))
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, limit);
    }
}
