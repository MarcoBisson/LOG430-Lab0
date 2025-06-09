export interface ProductDTO {
    id: number;
    name: string;
    price: number;
    description?: string;
    category?: string;
    stock: number;
}