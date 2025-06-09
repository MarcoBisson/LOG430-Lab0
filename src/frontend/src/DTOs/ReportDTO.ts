export interface ReportDTO {
    salesByStore: { storeId: number; totalQuantity: number }[];
    topProducts: { productId: number; totalQuantity: number }[];
    centralStock: { productId: number; stock: number }[];
}