import { InventoryService } from '../src/backend/domain/services/InventoryService';
import type { PrismaRepository } from '../src/backend/infrastructure/PrismaRepository';
import type { Product } from '@prisma/client';

describe('InventoryService', () => {
    let mockRepo: jest.Mocked<PrismaRepository>;
    let svc: InventoryService;

    beforeEach(() => {
        mockRepo = {
            listProducts: jest.fn(),
            // on ajoute des stubs vides pour éviter TS errors
            createProduct: jest.fn(),
            findProductById: jest.fn(),
            createSale: jest.fn(),
            decrementStock: jest.fn(),
            findProductsByName: jest.fn(),
            findProductsByCategory: jest.fn(),
            getSaleById: jest.fn(),
            deleteSale: jest.fn(),
            incrementStock: jest.fn(),
        } as any;
        svc = new InventoryService(mockRepo);
    });

    it('retourne la liste complète des produits', async () => {
        const fake: Product[] = [
            { id: 1, name: 'X', price: 1, stock: 10, category: 'C1' },
            { id: 2, name: 'Y', price: 2, stock: 5, category: 'C2' },
        ];
        mockRepo.listProducts.mockResolvedValue(fake);

        const res = await svc.listStock();
        expect(mockRepo.listProducts).toHaveBeenCalled();
        expect(res).toEqual(fake);
    });
});
