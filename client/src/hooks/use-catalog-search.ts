import { useLocation, useSearch } from "wouter";
import { parseAgentsQuery } from "@/lib/catalog-filters";

/** pathname + query string для корректной работы вкладок и тегов */
export function useCatalogSearch() {
  const [pathname, navigate] = useLocation();
  const search = useSearch();
  const fullPath = `${pathname}${search}`;

  return {
    pathname,
    search,
    fullPath,
    query: parseAgentsQuery(search),
    navigate,
  };
}
