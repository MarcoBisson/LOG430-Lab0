import { ProductService } from '../src/domain/services/ProductService';
import type { PrismaRepository } from '../src/infrastructure/PrismaRepository';
import type { Product } from '@prisma/client';

describe('ProductService', () => {
    let mockRepo: jest.Mocked<PrismaRepository>;
    let svc: ProductService;

    beforeEach(() => {
        mockRepo = {
            createProduct: jest.fn(),
            // on ajoute des stubs vides pour éviter TS errors
            findProductById: jest.fn(),
            listProducts: jest.fn(),
            createSale: jest.fn(),
            decrementStock: jest.fn(),
            findProductsByName: jest.fn(),
            findProductsByCategory: jest.fn(),
            getSaleById: jest.fn(),
            deleteSale: jest.fn(),
            incrementStock: jest.fn(),
        } as any;
        svc = new ProductService(mockRepo);
    });

    it('doit appeler createProduct avec les bons paramètres', async () => {
        const fake: Product = { id: 1, name: 'P1', price: 9.99, stock: 100, category: 'C1' };
        mockRepo.createProduct.mockResolvedValue(fake);

        const res = await svc.addProduct('P1', 9.99, 100, 'C1');
        expect(mockRepo.createProduct).toHaveBeenCalledWith({
            name: 'P1',
            price: 9.99,
            stock: 100,
            category: 'C1',
        });
        expect(res).toEqual(fake);
    });
});
