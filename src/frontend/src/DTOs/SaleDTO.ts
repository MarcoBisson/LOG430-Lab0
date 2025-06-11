export interface SaleItemDTO {
    id: number;
    saleId: number;
    productId: number;
    quantity: number;
    unitPrice: number;
}

export interface SaleDTO {
    id: number;
    date: string;
    storeId: number;
    saleItems: SaleItemDTO[];
}