import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import type { UseQueryResult } from "@tanstack/react-query";
import type { Product } from "../models/Product";

export function useProducts(filters = {}): UseQueryResult<Product[]> {
  return useQuery<Product[]>({
    queryKey: ["products", filters],
    queryFn: () => api.get("/products", { params: filters }).then(r => r.data),
  });
}
