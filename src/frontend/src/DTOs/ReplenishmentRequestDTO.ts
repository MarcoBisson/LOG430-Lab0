export interface ReplenishmentRequestDTO {
    id: number;
    storeId: number;
    productId: number;
    quantity: number;
    status: string;
}