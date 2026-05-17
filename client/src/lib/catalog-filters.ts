/** Пресеты тегов для ссылок с главной и AI-консультанта */

export type CatalogTab = "free" | "team";

export const BUSINESS_TAG_PRESETS: Record<string, string[]> = {
  hospitality: ["бронирование", "отель", "гостиница"],
  restaurant: ["ресторан", "кафе", "еда"],
  retail: ["ритейл", "магазин", "продажи"],
  rental: ["аренда", "прокат"],
  service: ["услуги", "сервис", "консультация"],
};

export const TASK_TAG_PRESETS: Record<string, string[]> = {
  customers: ["чат-бот", "поддержка клиентов", "клиент"],
  marketing: ["маркетинг", "email", "рассылки", "seo"],
  finance: ["аналитика", "финансы", "отчеты", "бухгалтерия"],
  hr: ["HR", "кадры", "онбординг"],
  operations: ["автоматизация", "операции", "склад", "заказы"],
};

const KEYWORD_RULES: Array<{ tags: string[]; patterns: RegExp[] }> = [
  {
    tags: TASK_TAG_PRESETS.customers,
    patterns: [/клиент/, /покупател/, /поддержк/, /чат-?бот/, /обслуживан/],
  },
  {
    tags: TASK_TAG_PRESETS.marketing,
    patterns: [/маркетинг/, /реклам/, /продвижен/, /соцсет/, /seo/, /email/],
  },
  {
    tags: TASK_TAG_PRESETS.finance,
    patterns: [/финанс/, /бюджет/, /деньг/, /бухгалтер/, /отчет/, /налог/],
  },
  {
    tags: TASK_TAG_PRESETS.hr,
    patterns: [/hr\b/, /кадр/, /персонал/, /сотрудник/, /онбординг/, /найм/],
  },
  {
    tags: TASK_TAG_PRESETS.operations,
    patterns: [/операци/, /процесс/, /автоматизац/, /склад/, /документ/],
  },
  {
    tags: BUSINESS_TAG_PRESETS.hospitality,
    patterns: [/отел/, /гостиниц/, /хостел/, /бронирован/],
  },
  {
    tags: BUSINESS_TAG_PRESETS.restaurant,
    patterns: [/ресторан/, /кафе/, /бар\b/, /кухн/, /еда\b/],
  },
  {
    tags: BUSINESS_TAG_PRESETS.retail,
    patterns: [/магазин/, /ритейл/, /торговл/, /продаж/],
  },
  {
    tags: BUSINESS_TAG_PRESETS.rental,
    patterns: [/аренд/, /прокат/],
  },
  {
    tags: BUSINESS_TAG_PRESETS.service,
    patterns: [/сервис/, /услуг/, /консультац/, /ремонт/],
  },
];

export function buildAgentsCatalogUrl(opts: {
  tab?: CatalogTab;
  tags?: string[];
  q?: string;
}): string {
  const params = new URLSearchParams();
  params.set("tab", opts.tab ?? "free");
  const tags = [...new Set((opts.tags ?? []).filter(Boolean))];
  if (tags.length > 0) params.set("tags", tags.join(","));
  if (opts.q?.trim()) params.set("q", opts.q.trim());
  return `/agents?${params.toString()}`;
}

export function catalogUrlForBusiness(key: string): string {
  return buildAgentsCatalogUrl({
    tab: "free",
    tags: BUSINESS_TAG_PRESETS[key] ?? [],
  });
}

export function catalogUrlForTask(key: string): string {
  return buildAgentsCatalogUrl({
    tab: "free",
    tags: TASK_TAG_PRESETS[key] ?? [],
  });
}

export function parseAgentsQuery(search: string) {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(raw);
  const tagsParam = params.get("tags") || params.get("tag") || "";
  const tags = tagsParam
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return {
    tab: (params.get("tab") === "team" ? "team" : "free") as CatalogTab,
    tags,
    q: params.get("q") || "",
  };
}

export function resolveCatalogFromText(text: string): {
  tab: CatalogTab;
  tags: string[];
  summary: string;
} {
  const lower = text.toLowerCase();
  const matched = new Set<string>();

  for (const rule of KEYWORD_RULES) {
    if (rule.patterns.some((p) => p.test(lower))) {
      rule.tags.forEach((t) => matched.add(t));
    }
  }

  const tags = [...matched];
  let summary = "подборку бесплатных решений";

  if (tags.some((t) => TASK_TAG_PRESETS.marketing.includes(t)))
    summary = "решения для маркетинга";
  else if (tags.some((t) => TASK_TAG_PRESETS.customers.includes(t)))
    summary = "решения для работы с клиентами";
  else if (tags.some((t) => TASK_TAG_PRESETS.finance.includes(t)))
    summary = "финансовые решения";
  else if (tags.some((t) => BUSINESS_TAG_PRESETS.restaurant.includes(t)))
    summary = "решения для ресторанов и кафе";
  else if (tags.some((t) => BUSINESS_TAG_PRESETS.hospitality.includes(t)))
    summary = "решения для гостиничного бизнеса";
  else if (tags.length > 0) summary = "решения по вашему запросу";

  return { tab: "free", tags, summary };
}

/** Агент подходит, если есть хотя бы один из выбранных тегов (или в тексте/тегах агента) */
export function agentMatchesTags(
  agent: { name: string; description: string; tags?: string[] | null },
  filterTags: string[],
): boolean {
  if (filterTags.length === 0) return true;
  const haystack = [
    agent.name,
    agent.description,
    ...(agent.tags ?? []),
  ].map((s) => s.toLowerCase());

  return filterTags.some((tag) => {
    const t = tag.toLowerCase();
    return haystack.some((h) => h.includes(t));
  });
}
