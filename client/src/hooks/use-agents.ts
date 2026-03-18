import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useAgents() {
  return useQuery({
    queryKey: [api.agents.list.path],
    queryFn: async () => {
      const res = await fetch(api.agents.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Не удалось загрузить агентов");
      const data = await res.json();
      return api.agents.list.responses[200].parse(data);
    },
  });
}

export function useAgent(id: number) {
  return useQuery({
    queryKey: [api.agents.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.agents.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Не удалось загрузить агента");
      const data = await res.json();
      return api.agents.get.responses[200].parse(data);
    },
    enabled: !!id,
  });
}
