import { SaleItem } from './SaleItem';

export class Sale {
    constructor(
        public id: number,
        public date: Date,
        public storeId: number,
        public saleItems: SaleItem[]
    ) { }
}