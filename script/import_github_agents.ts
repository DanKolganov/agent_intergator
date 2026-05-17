import OpenAI from "openai";
import pLimit from "p-limit";
import pRetry from "p-retry";
import { db } from "../server/db";
import { agents } from "../shared/schema";

type GithubRepo = {
  owner: string;
  repo: string;
  url: string;
};

type RepoMeta = {
  fullName: string;
  description: string | null;
  stars: number;
  topics: string[];
  homepage: string | null;
  ownerAvatar: string | null;
  htmlUrl: string;
  readme: string;
};

type AgentDraft = {
  name: string;
  description: string;
  industry: string;
  useCase: string;
  tags: string[];
  imageUrl: string | null;
};

const AWESOME_LIST_REPO =
  process.env.AWESOME_LIST_REPO || "e2b-dev/awesome-ai-agents";
const IMPORT_LIMIT = Number(process.env.IMPORT_LIMIT || 20);
const MIN_STARS = Number(process.env.MIN_STARS || 100);
const CONCURRENCY = Number(process.env.IMPORT_CONCURRENCY || 2);

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

function githubHeaders(extra: Record<string, string> = {}) {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "agent_intergator-importer/1.0",
    ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
    ...extra,
  };
}

async function ghFetch(url: string, init: RequestInit = {}): Promise<Response> {
  return pRetry(
    async () => {
      const res = await fetch(url, { ...init, headers: githubHeaders() });
      if (res.status === 403 || res.status === 429) {
        const reset = res.headers.get("x-ratelimit-reset");
        throw new Error(
          `GitHub rate limited (status ${res.status})${reset ? `, resets at ${reset}` : ""}`,
        );
      }
      if (!res.ok && res.status !== 404) {
        throw new Error(`GitHub ${url} → ${res.status}`);
      }
      return res;
    },
    { retries: 3, minTimeout: 1500 },
  );
}

async function fetchAwesomeReadme(repoSlug: string): Promise<string> {
  const branches = ["HEAD", "main", "master"];
  for (const branch of branches) {
    const url = `https://raw.githubusercontent.com/${repoSlug}/${branch}/README.md`;
    const res = await fetch(url, {
      headers: { "User-Agent": "agent_intergator-importer/1.0" },
    });
    if (res.ok) return res.text();
  }
  throw new Error(`Cannot fetch README for awesome list ${repoSlug}`);
}

function extractRepoLinks(markdown: string, skipRepo: string): GithubRepo[] {
  const seen = new Set<string>();
  const out: GithubRepo[] = [];
  const re = /https?:\/\/github\.com\/([\w.-]+)\/([\w.-]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) !== null) {
    const owner = m[1];
    let repo = m[2].replace(/[.,);:]+$/, "");
    repo = repo.replace(/\.git$/, "");
    const key = `${owner}/${repo}`.toLowerCase();
    if (
      seen.has(key) ||
      key === skipRepo.toLowerCase() ||
      owner === "sponsors" ||
      owner === "topics" ||
      owner === "features"
    ) {
      continue;
    }
    seen.add(key);
    out.push({
      owner,
      repo,
      url: `https://github.com/${owner}/${repo}`,
    });
  }
  return out;
}

async function fetchRepoMeta(r: GithubRepo): Promise<RepoMeta | null> {
  const repoRes = await ghFetch(
    `https://api.github.com/repos/${r.owner}/${r.repo}`,
  );
  if (repoRes.status === 404) return null;
  const repoJson: any = await repoRes.json();

  let readme = "";
  const readmeRes = await ghFetch(
    `https://api.github.com/repos/${r.owner}/${r.repo}/readme`,
    { headers: githubHeaders({ Accept: "application/vnd.github.raw" }) },
  );
  if (readmeRes.ok) {
    readme = await readmeRes.text();
  }

  return {
    fullName: repoJson.full_name,
    description: repoJson.description ?? null,
    stars: Number(repoJson.stargazers_count || 0),
    topics: Array.isArray(repoJson.topics) ? repoJson.topics : [],
    homepage: repoJson.homepage || null,
    ownerAvatar: repoJson.owner?.avatar_url || null,
    htmlUrl: repoJson.html_url,
    readme: readme.slice(0, 8000),
  };
}

function getLLMClient(): OpenAI {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "AI_INTEGRATIONS_OPENAI_API_KEY is required for LLM normalization",
    );
  }
  let baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  if (baseURL) baseURL = baseURL.replace(/\/$/, "");
  return new OpenAI({ apiKey, baseURL });
}

function getLLMModel(): string {
  return process.env.AI_INTEGRATIONS_MODEL || "llama-3.1-8b-instant";
}

async function normalizeWithLLM(
  meta: RepoMeta,
  llm: OpenAI,
): Promise<AgentDraft | null> {
  const prompt = `
Ты — редактор каталога AI-агентов. На вход даны метаданные open-source GitHub-репозитория.
Подготовь карточку для каталога на РУССКОМ языке в нашем стандартном формате.

Правила description:
- Первая строка — название продукта (повтор поля name).
- Пустая строка.
- 4–6 пунктов через "• ".
- Пустая строка.
- Последняя строка: "Идеально для: ..." — короткое описание целевой аудитории.

Поля industry: одна из категорий, например "Разработка", "E-commerce", "Finance", "Маркетинг", "Аналитика", "Productivity", "DevOps", "Образование", "HR", "Контент".
Поле useCase: короткая фраза, что именно делает агент ("Автоматизация продаж", "Поиск по документам" и т.д.).
Поле tags: 3–8 коротких тегов, латиницей, lowercase, через дефис (как у нас в UI).

Верни СТРОГО JSON:
{
  "name": string,
  "description": string,
  "industry": string,
  "useCase": string,
  "tags": string[]
}

Метаданные репозитория:
${JSON.stringify(
  {
    fullName: meta.fullName,
    description: meta.description,
    stars: meta.stars,
    topics: meta.topics,
    homepage: meta.homepage,
    readmeExcerpt: meta.readme.slice(0, 4000),
  },
  null,
  2,
)}
`.trim();

  const response = await llm.chat.completions.create({
    model: getLLMModel(),
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });
  const content = response.choices[0]?.message?.content || "{}";
  let raw: any;
  try {
    raw = JSON.parse(content);
  } catch {
    return null;
  }
  if (
    typeof raw?.name !== "string" ||
    typeof raw?.description !== "string" ||
    typeof raw?.industry !== "string" ||
    typeof raw?.useCase !== "string" ||
    !Array.isArray(raw?.tags)
  ) {
    return null;
  }
  return {
    name: raw.name.trim(),
    description: raw.description.trim(),
    industry: raw.industry.trim(),
    useCase: raw.useCase.trim(),
    tags: raw.tags
      .filter((t: any) => typeof t === "string")
      .map((t: string) => t.toLowerCase().trim())
      .filter(Boolean)
      .slice(0, 8),
    imageUrl: meta.ownerAvatar,
  };
}

async function loadExistingSourceUrls(): Promise<Set<string>> {
  const rows = await db
    .select({ sourceUrl: agents.sourceUrl })
    .from(agents);
  const set = new Set<string>();
  for (const r of rows) {
    if (r.sourceUrl) set.add(r.sourceUrl.toLowerCase());
  }
  return set;
}

async function main() {
  console.log(`▸ awesome list: ${AWESOME_LIST_REPO}`);
  console.log(`▸ import limit: ${IMPORT_LIMIT}, min stars: ${MIN_STARS}`);

  const readme = await fetchAwesomeReadme(AWESOME_LIST_REPO);
  const candidates = extractRepoLinks(readme, AWESOME_LIST_REPO);
  console.log(`▸ extracted ${candidates.length} candidate repos`);

  const existing = await loadExistingSourceUrls();
  const fresh = candidates.filter(
    (c) => !existing.has(c.url.toLowerCase()),
  );
  console.log(
    `▸ ${fresh.length} new (after dedup against ${existing.size} existing)`,
  );

  const limit = pLimit(CONCURRENCY);
  const llm = getLLMClient();

  let imported = 0;
  let skipped = 0;
  let failed = 0;
  const queue: Array<Promise<void>> = [];
  let queuedForLLM = 0;

  for (const cand of fresh) {
    if (queuedForLLM >= IMPORT_LIMIT) break;
    queuedForLLM += 1;

    queue.push(
      limit(async () => {
        try {
          const meta = await fetchRepoMeta(cand);
          if (!meta) {
            skipped += 1;
            return;
          }
          if (meta.stars < MIN_STARS) {
            skipped += 1;
            console.log(
              `  skip ${meta.fullName} (${meta.stars}★ < ${MIN_STARS})`,
            );
            return;
          }
          const draft = await normalizeWithLLM(meta, llm);
          if (!draft) {
            failed += 1;
            console.log(`  fail LLM normalize: ${meta.fullName}`);
            return;
          }
          await db
            .insert(agents)
            .values({
              name: draft.name,
              description: draft.description,
              industry: draft.industry,
              useCase: draft.useCase,
              tags: draft.tags,
              imageUrl: draft.imageUrl,
              isTeamSolution: false,
              sourceUrl: cand.url,
              githubStars: meta.stars,
            })
            .onConflictDoNothing();
          imported += 1;
          console.log(`  ✓ imported ${draft.name} (${meta.stars}★)`);
        } catch (err) {
          failed += 1;
          console.warn(`  ✗ ${cand.url}: ${(err as Error).message}`);
        }
      }),
    );
  }

  await Promise.all(queue);

  console.log(
    `\n done. imported=${imported}, skipped=${skipped}, failed=${failed}`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
