export class Product {
  constructor(
    public id: number,
    public name: string,
    public price: number,
    public stock: number
  ) {}
}

export class CartItem {
  constructor(
    public productId: number,
    public quantity: number
  ) {}
}
