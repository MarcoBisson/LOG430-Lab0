import { CartItem } from '../../../src/backend/domain/entities/CartItem';

describe('CartItem', () => {
    describe('constructor', () => {
        it('should create CartItem with valid parameters', () => {
            const cartItem = new CartItem(1, 2);
            
            expect(cartItem.productId).toBe(1);
            expect(cartItem.quantity).toBe(2);
        });

        it('should create CartItem with zero quantity', () => {
            const cartItem = new CartItem(101, 0);
            
            expect(cartItem.productId).toBe(101);
            expect(cartItem.quantity).toBe(0);
        });

        it('should create CartItem with large quantity', () => {
            const cartItem = new CartItem(202, 500);
            
            expect(cartItem.productId).toBe(202);
            expect(cartItem.quantity).toBe(500);
        });
    });
});
