export interface Store {
  id: number;
  name: string;
  address: string;
  type: StoreType;
  createdAt: Date;
  updatedAt: Date;
}

export type StoreType = 'SALES' | 'LOGISTICS' | 'HEADQUARTER';
