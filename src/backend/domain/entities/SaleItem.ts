export class SaleItem {
    constructor(
        public id: number,
        public saleId: number,
        public productId: number,
        public quantity: number,
        public unitPrice: number
    ) { }
}