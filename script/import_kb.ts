import { readFile } from "fs/promises";
import { db } from "../server/db";
import { knowledgeBase } from "../shared/schema";

type Doc = {
  title: string;
  content: string;
  sourceUrl?: string | null;
  tags?: string[];
};

function usage() {
  console.log(`Usage:
  npm run kb:import -- ./path/to/kb.json

Format (JSON array):
[
  { "title": "...", "content": "...", "sourceUrl": "https://...", "tags": ["tag-1","tag-2"] }
]
`);
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    usage();
    process.exit(1);
  }

  const raw = await readFile(filePath, "utf-8");
  const docs = JSON.parse(raw) as Doc[];
  if (!Array.isArray(docs) || docs.length === 0) {
    throw new Error("kb.json must be a non-empty JSON array");
  }

  let inserted = 0;
  for (const d of docs) {
    if (!d?.title || !d?.content) continue;
    await db
      .insert(knowledgeBase)
      .values({
        title: d.title,
        content: d.content,
        sourceUrl: d.sourceUrl ?? null,
        tags: d.tags ?? [],
      })
      .onConflictDoNothing();
    inserted += 1;
  }

  console.log(`Imported ${inserted} docs.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

