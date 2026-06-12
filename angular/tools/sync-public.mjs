// Mirrors the repo-root /public (shared assets + data) into angular/public,
// because the Angular builder only accepts assets inside the workspace root.
// Temporary scaffolding until the app moves to the repo root.

import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "..", "..", "public");
const target = join(here, "..", "public");

if (!existsSync(source)) {
  console.error(`source not found: ${source}`);
  process.exit(1);
}
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });
console.log(`synced ${source} -> ${target}`);
