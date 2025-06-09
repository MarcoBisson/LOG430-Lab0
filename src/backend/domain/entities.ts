export class ProductEntity {
  constructor(
    public id: number,
    public name: string,
    public price: number,
    public description: string | null,
    public category: string | null,
    public stock: number
  ) { }
}

export class StoreEntity {
  constructor(
    public id: number,
    public name: string,
    public address: string
  ) { }
}

export class StoreStockEntity {
  constructor(
    public id: number,
    public storeId: number,
    public productId: number,
    public quantity: number
  ) { }
}

export class SaleItemEntity {
  constructor(
    public id: number,
    public saleId: number,
    public productId: number,
    public quantity: number,
    public unitPrice: number
  ) { }
}

export class SaleEntity {
  constructor(
    public id: number,
    public date: Date,
    public storeId: number,
    public saleItems: SaleItemEntity[]
  ) { }
}

export class ReplenishmentRequestEntity {
  constructor(
    public id: number,
    public storeId: number,
    public productId: number,
    public quantity: number,
    public status: 'PENDING' | 'APPROVED' | 'REJECTED',
    public createdAt: Date
  ) { }
}

export class CartItem {
  constructor(
    public productId: number,
    public quantity: number,
  ) { }
}
