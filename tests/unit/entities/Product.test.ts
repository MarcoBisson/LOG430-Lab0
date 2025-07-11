import { Product, ProductStock } from '../../../src/backend/domain/entities/Product';

describe('Product Entity', () => {
    describe('Product class', () => {
        it('should create a product with all properties', () => {
            const product = new Product(1, 'Laptop', 999.99, 'Gaming laptop', 'Electronics');

            expect(product.id).toBe(1);
            expect(product.name).toBe('Laptop');
            expect(product.price).toBe(999.99);
            expect(product.description).toBe('Gaming laptop');
            expect(product.category).toBe('Electronics');
        });

        it('should create a product with null description and category', () => {
            const product = new Product(1, 'Basic Product', 50.00, null, null);

            expect(product.id).toBe(1);
            expect(product.name).toBe('Basic Product');
            expect(product.price).toBe(50.00);
            expect(product.description).toBeNull();
            expect(product.category).toBeNull();
        });

        it('should handle zero price', () => {
            const product = new Product(1, 'Free Item', 0, 'No cost', 'Free');

            expect(product.price).toBe(0);
        });

        it('should handle empty string name', () => {
            const product = new Product(1, '', 10.00, null, null);

            expect(product.name).toBe('');
        });

        it('should handle very long strings', () => {
            const longString = 'a'.repeat(1000);
            const product = new Product(1, longString, 10.00, longString, longString);

            expect(product.name).toBe(longString);
            expect(product.description).toBe(longString);
            expect(product.category).toBe(longString);
        });

        it('should handle special characters in strings', () => {
            const specialName = 'Product™ @#$%^&*()';
            const specialDesc = 'Description with émojis 🚀 and symbols ©®';
            const specialCategory = 'Category-with_special.chars';

            const product = new Product(1, specialName, 10.00, specialDesc, specialCategory);

            expect(product.name).toBe(specialName);
            expect(product.description).toBe(specialDesc);
            expect(product.category).toBe(specialCategory);
        });

        it('should handle very large prices', () => {
            const largePrice = Number.MAX_SAFE_INTEGER;
            const product = new Product(1, 'Expensive Item', largePrice, null, null);

            expect(product.price).toBe(largePrice);
        });

        it('should handle decimal prices', () => {
            const decimalPrice = 99.999;
            const product = new Product(1, 'Precise Price', decimalPrice, null, null);

            expect(product.price).toBe(decimalPrice);
        });
    });

    describe('ProductStock class', () => {
        it('should create a product stock with all properties', () => {
            const productStock = new ProductStock(
                1, 
                'Laptop', 
                999.99, 
                'Gaming laptop', 
                'Electronics', 
                50,
            );

            expect(productStock.id).toBe(1);
            expect(productStock.name).toBe('Laptop');
            expect(productStock.price).toBe(999.99);
            expect(productStock.description).toBe('Gaming laptop');
            expect(productStock.category).toBe('Electronics');
            expect(productStock.stock).toBe(50);
        });

        it('should create a product stock with zero stock', () => {
            const productStock = new ProductStock(1, 'Out of Stock', 10.00, null, null, 0);

            expect(productStock.stock).toBe(0);
        });

        it('should handle very large stock quantities', () => {
            const largeStock = Number.MAX_SAFE_INTEGER;
            const productStock = new ProductStock(1, 'Huge Stock', 10.00, null, null, largeStock);

            expect(productStock.stock).toBe(largeStock);
        });

        it('should inherit all Product properties', () => {
            const productStock = new ProductStock(
                123, 
                'Test Product', 
                45.67, 
                'Test Description', 
                'Test Category', 
                100,
            );

            expect(productStock.id).toBe(123);
            expect(productStock.name).toBe('Test Product');
            expect(productStock.price).toBe(45.67);
            expect(productStock.description).toBe('Test Description');
            expect(productStock.category).toBe('Test Category');
            
            expect(productStock.stock).toBe(100);
        });

        it('should be distinguishable from regular Product', () => {
            const product = new Product(1, 'Regular', 10.00, null, null);
            const productStock = new ProductStock(1, 'With Stock', 10.00, null, null, 5);

            expect(product).toBeInstanceOf(Product);
            expect(productStock).toBeInstanceOf(ProductStock);
            expect(productStock).toBeInstanceOf(Product);
            
            expect('stock' in product).toBe(false);
            expect('stock' in productStock).toBe(true);
        });
    });

    describe('Product and ProductStock comparison', () => {
        it('should have same properties except stock', () => {
            const product = new Product(1, 'Test', 10.00, 'Description', 'Category');
            const productStock = new ProductStock(1, 'Test', 10.00, 'Description', 'Category', 15);

            expect(product.id).toBe(productStock.id);
            expect(product.name).toBe(productStock.name);
            expect(product.price).toBe(productStock.price);
            expect(product.description).toBe(productStock.description);
            expect(product.category).toBe(productStock.category);
        });

        it('should allow conversion from Product to ProductStock concept', () => {
            const product = new Product(1, 'Original', 25.00, 'Desc', 'Cat');
            
            const productStock = new ProductStock(
                product.id,
                product.name,
                product.price,
                product.description,
                product.category,
                10,
            );

            expect(productStock.id).toBe(product.id);
            expect(productStock.name).toBe(product.name);
            expect(productStock.price).toBe(product.price);
            expect(productStock.description).toBe(product.description);
            expect(productStock.category).toBe(product.category);
            expect(productStock.stock).toBe(10);
        });
    });

    describe('immutability considerations', () => {
        it('should allow property modification', () => {
            const product = new Product(1, 'Original', 10.00, null, null);
            
            product.name = 'Modified';
            product.price = 20.00;

            expect(product.name).toBe('Modified');
            expect(product.price).toBe(20.00);
        });

        it('should allow ProductStock property modification', () => {
            const productStock = new ProductStock(1, 'Original', 10.00, null, null, 5);
            
            productStock.name = 'Modified';
            productStock.stock = 15;

            expect(productStock.name).toBe('Modified');
            expect(productStock.stock).toBe(15);
        });
    });
});
