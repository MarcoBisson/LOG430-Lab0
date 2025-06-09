import { CartItemDTO } from './CartItemDTO';

export interface SaleDTO {
    id: number;
    storeId: number;
    saleItems: CartItemDTO[];
}