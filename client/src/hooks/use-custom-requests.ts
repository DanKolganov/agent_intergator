import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertCustomAgentRequest } from "@shared/schema";

export function useCustomRequest(id: number) {
  return useQuery({
    queryKey: [api.customRequests.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.customRequests.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Не удалось загрузить запрос");
      const data = await res.json();
      return api.customRequests.get.responses[200].parse(data);
    },
    enabled: !!id,
    // Poll every 3 seconds if the request is still pending or analyzing
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'pending' || status === 'analyzing' ? 3000 : false;
    },
  });
}

export function useCreateCustomRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertCustomAgentRequest) => {
      const validated = api.customRequests.create.input.parse(data);
      const res = await fetch(api.customRequests.create.path, {
        method: api.customRequests.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Ошибка валидации");
        }
        throw new Error("Не удалось создать запрос");
      }
      
      const responseData = await res.json();
      return api.customRequests.create.responses[201].parse(responseData);
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.customRequests.get.path, data.id], data);
    },
  });
}

export function useAnalyzeCustomRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.customRequests.analyze.path, { id });
      const res = await fetch(url, {
        method: api.customRequests.analyze.method,
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Не удалось запустить анализ");
      }
      
      const responseData = await res.json();
      return api.customRequests.analyze.responses[200].parse(responseData);
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.customRequests.get.path, data.id], data);
      queryClient.invalidateQueries({ queryKey: [api.customRequests.get.path, data.id] });
    },
  });
}
