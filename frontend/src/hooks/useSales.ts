import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

export function useSell() {
  const qc = useQueryClient();

  return useMutation<any, Error, { productId: number; quantity: number }>({
    mutationFn: ({ productId, quantity }) =>
      api.post("/sales", { productId, quantity }).then(res => res.data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useReturn() {
  const qc = useQueryClient();
  return useMutation<any, Error, number>({
    mutationFn: (saleId) => api.post(`/sales/${saleId}/return`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] })
  });
}
