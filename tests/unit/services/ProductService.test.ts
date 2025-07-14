import { ProductService } from '../../../src/backend/application/services/ProductService';
import { MockProductRepository } from '../../mocks/repositories/MockProductRepository';
import { Product, ProductStock } from '../../../src/backend/domain/entities/Product';

describe('ProductService', () => {
    let productService: ProductService;
    let mockProductRepository: MockProductRepository;

    beforeEach(() => {
        mockProductRepository = new MockProductRepository();
        productService = new ProductService(mockProductRepository);
    });

    describe('listProducts', () => {
        it('should return an empty list when no products exist', async () => {
            const result = await productService.listProducts();
            expect(result).toEqual([]);
        });

        it('should return all products', async () => {
            const testProducts = [
                new Product(1, 'Laptop', 999.99, 'Gaming laptop', 'Electronics'),
                new Product(2, 'Mouse', 29.99, 'Wireless mouse', 'Electronics'),
            ];
            mockProductRepository.seed(testProducts);

            const result = await productService.listProducts();

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Laptop');
            expect(result[1].name).toBe('Mouse');
        });
    });

    describe('createProduct', () => {
        it('should create a new product successfully', async () => {
            const productData = {
                name: 'Keyboard',
                price: 79.99,
                description: 'Mechanical keyboard',
                category: 'Electronics',
                stock: 10,
            };

            const result = await productService.createProduct(1, productData);

            expect(result).toBeInstanceOf(Product);
            expect(result.name).toBe('Keyboard');
            expect(result.price).toBe(79.99);
            expect(result.description).toBe('Mechanical keyboard');
            expect(result.category).toBe('Electronics');
        });

        it('should create a product with minimal data', async () => {
            const productData = {
                name: 'Basic Item',
                price: 5.00,
                stock: 1,
            };

            const result = await productService.createProduct(1, productData);

            expect(result.name).toBe('Basic Item');
            expect(result.price).toBe(5.00);
            expect(result.description).toBeNull();
            expect(result.category).toBeNull();
        });
    });

    describe('getProductById', () => {
        it('should return a product when it exists', async () => {
            const testProduct = new Product(1, 'Test Product', 50.00, 'Description', 'Category');
            mockProductRepository.seed([testProduct]);

            const result = await productService.getProductById(1);

            expect(result).not.toBeNull();
            expect(result?.name).toBe('Test Product');
        });

        it('should return null when product does not exist', async () => {
            const result = await productService.getProductById(999);
            expect(result).toBeNull();
        });
    });

    describe('getProductsByName', () => {
        beforeEach(() => {
            const testProducts = [
                new Product(1, 'Gaming Laptop', 1200.00, 'High-end gaming', 'Electronics'),
                new Product(2, 'Office Laptop', 800.00, 'Business laptop', 'Electronics'),
                new Product(3, 'Desktop Computer', 1500.00, 'Gaming desktop', 'Electronics'),
            ];
            mockProductRepository.seed(testProducts);
        });

        it('should find products by partial name match', async () => {
            const result = await productService.getProductsByName('laptop');

            expect(result).toHaveLength(2);
            expect(result.map(p => p.name)).toContain('Gaming Laptop');
            expect(result.map(p => p.name)).toContain('Office Laptop');
        });

        it('should be case insensitive', async () => {
            const result = await productService.getProductsByName('GAMING');

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Gaming Laptop');
        });

        it('should return empty array when no matches found', async () => {
            const result = await productService.getProductsByName('nonexistent');
            expect(result).toHaveLength(0);
        });
    });

    describe('getProductsByCategory', () => {
        beforeEach(() => {
            const testProducts = [
                new Product(1, 'Laptop', 1000.00, 'Gaming laptop', 'Electronics'),
                new Product(2, 'Chair', 200.00, 'Office chair', 'Furniture'),
                new Product(3, 'Desk', 300.00, 'Standing desk', 'Furniture'),
            ];
            mockProductRepository.seed(testProducts);
        });

        it('should find products by category', async () => {
            const result = await productService.getProductsByCategory('Furniture');

            expect(result).toHaveLength(2);
            expect(result.map(p => p.name)).toContain('Chair');
            expect(result.map(p => p.name)).toContain('Desk');
        });

        it('should return empty array when category not found', async () => {
            const result = await productService.getProductsByCategory('NonExistent');
            expect(result).toHaveLength(0);
        });
    });

    describe('updateProduct', () => {
        beforeEach(() => {
            const testProduct = new Product(1, 'Original Product', 100.00, 'Original description', 'Original');
            mockProductRepository.seed([{ ...testProduct, stock: 10 }]);
        });

        it('should update product successfully', async () => {
            const updateData = {
                name: 'Updated Product',
                price: 150.00,
                description: 'Updated description',
                category: 'Updated Category',
                stock: 20,
            };

            const result = await productService.updateProduct(1, 1, updateData);

            expect(result).toBeInstanceOf(ProductStock);
            expect(result.name).toBe('Updated Product');
            expect(result.price).toBe(150.00);
            expect(result.stock).toBe(20);
        });

        it('should throw error when product not found', async () => {
            const updateData = { stock: 15 };

            await expect(productService.updateProduct(999, 1, updateData))
                .rejects.toThrow('Product 999 not found');
        });
    });

    describe('deleteProduct', () => {
        beforeEach(() => {
            const testProduct = new Product(1, 'Product to Delete', 50.00, 'Description', 'Category');
            mockProductRepository.seed([testProduct]);
        });

        it('should delete product successfully', async () => {
            await expect(productService.deleteProduct(1)).resolves.not.toThrow();
        });

        it('should throw error when product not found', async () => {
            await expect(productService.deleteProduct(999))
                .rejects.toThrow('Product 999 not found');
        });
    });

    describe('getProductsByStore', () => {
        beforeEach(() => {
            const testProducts = [
                { ...new Product(1, 'Store Product 1', 100.00, 'Description 1', 'Category'), stock: 5 },
                { ...new Product(2, 'Store Product 2', 200.00, 'Description 2', 'Category'), stock: 10 },
            ];
            mockProductRepository.seed(testProducts);
        });

        it('should return products with stock information', async () => {
            const result = await productService.getProductsByStore(1);

            expect(result.products[0]).toBeInstanceOf(ProductStock);
            expect(result.products[0].stock).toBe(5);
            expect(result.products[1].stock).toBe(10);
        });

        it('should return empty array for store with no products', async () => {
            mockProductRepository.clear();
            const result = await productService.getProductsByStore(1);
            expect(result.products).toHaveLength(0);
        });
    });
    test('should set stock to 0 if input.stock is undefined', async () => {
        const mockProductRepo = {
            createProduct: jest.fn().mockResolvedValue({
                id: 1,
                name: 'Test',
                price: 10,
                description: null,
                category: null,
                stock: 0,
            }),
        };
        const service = new ProductService(mockProductRepo as any);

        await service.createProduct(1, {
            name: 'Test',
            price: 10,
        } as any);

        expect(mockProductRepo.createProduct).toHaveBeenCalledWith(1, expect.objectContaining({ stock: 0 }));
    });
});
