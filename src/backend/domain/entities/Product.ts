export class Product {
    constructor(
        public id: number,
        public name: string,
        public price: number,
        public description: string | null,
        public category: string | null,
        public stock: number
    ) { }
}
