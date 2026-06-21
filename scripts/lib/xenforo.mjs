// XenForo thread parsing: fetch every page of a thread, collect the posts
// written by the original poster, and extract location-keyed spawn tables.

import * as cheerio from "cheerio";
import { fetchText } from "./http.mjs";
import { clean } from "./normalize.mjs";

/** Fetch all pages of a thread and return cheerio docs in order. */
export async function fetchThreadPages(threadUrl) {
  const base = threadUrl.endsWith("/") ? threadUrl : `${threadUrl}/`;
  const firstHtml = await fetchText(base);
  const $first = cheerio.load(firstHtml);

  // XenForo pagination: <ul class="pageNav-main"> with .pageNav-page links.
  let lastPage = 1;
  $first(".pageNav-page").each((_, el) => {
    const n = Number(clean($first(el).text()));
    if (Number.isFinite(n) && n > lastPage) lastPage = n;
  });

  const docs = [$first];
  for (let page = 2; page <= lastPage; page++) {
    const html = await fetchText(`${base}page-${page}`);
    docs.push(cheerio.load(html));
  }
  return docs;
}

/**
 * Collect the message bodies authored by the thread starter, in order.
 * Spawn megathreads split their content across several consecutive OP posts.
 */
export function collectOpPosts(docs) {
  let opAuthor = null;
  const bodies = [];

  for (const $ of docs) {
    const articles = $("article.message").toArray();
    for (const article of articles) {
      const author = $(article).attr("data-author") ?? clean($(article).find(".message-name").first().text());
      if (opAuthor === null) opAuthor = author;
      if (author !== opAuthor) continue;
      const body = $(article).find(".message-body .bbWrapper").first();
      if (body.length) bodies.push({ $, body });
    }
  }

  return { opAuthor, bodies };
}

function isSpawnTableHeader(cells) {
  if (cells.length < 6) return false;
  const lowered = cells.map((c) => c.toLowerCase());
  // Require at least pokemon + rarity + level somewhere in the header row.
  return (
    lowered.some((c) => c.includes("pokemon") || c.includes("pokémon")) &&
    lowered.some((c) => c.includes("rarity")) &&
    lowered.some((c) => c.includes("level"))
  );
}

/** Map header cell text to canonical column names by content. */
function headerColumns(cells) {
  return cells.map((c) => {
    const v = c.toLowerCase();
    if (v.includes("sprite") || v === "") return "sprite";
    if (v.includes("pokemon") || v.includes("pokémon")) return "pokemon";
    if (v.includes("rarity")) return "rarity";
    if (v.includes("time")) return "time";
    if (v.includes("method")) return "method";
    if (v.includes("level")) return "level";
    if (v.includes("ev")) return "ev";
    return `unknown:${v}`;
  });
}

/**
 * Walk OP post bodies in document order, tracking the most recent short text
 * line as the "current heading" (= location name). Each spawn table found is
 * attributed to that heading.
 *
 * Returns { locations: Map<headingText, rawRows[]>, warnings: string[] }
 * where each rawRow is { pokemon, rarity, time, method, level, ev }.
 */
export function extractLocationTables({ bodies }) {
  const locations = new Map();
  const warnings = [];

  for (const { $, body } of bodies) {
    let currentHeading = null;

    // Walk ALL descendants in document order; tables and heading-ish text.
    const walk = (node) => {
      for (const child of $(node).children().toArray()) {
        const tag = child.tagName?.toLowerCase();

        if (tag === "table") {
          handleTable($, child);
          continue;
        }
        const $child = $(child);
        const hasTableInside = $child.find("table").length > 0;
        if (hasTableInside) {
          // Container (div/blockquote/etc.) — recurse to keep document order.
          walk(child);
          continue;
        }
        const text = clean($child.text());
        if (text && text.length < 80 && !text.includes("|")) {
          currentHeading = text;
        }
      }
    };

    const handleTable = ($, tableEl) => {
      const rows = $(tableEl).find("tr").toArray();
      if (rows.length === 0) return;

      const headerCells = $(rows[0])
        .find("th, td")
        .toArray()
        .map((c) => clean($(c).text()));

      if (!isSpawnTableHeader(headerCells)) {
        warnings.push(`Skipped table (header: "${headerCells.join(" | ")}") near "${currentHeading}"`);
        return;
      }
      const columns = headerColumns(headerCells);
      const heading = currentHeading ?? "(unknown location)";
      if (!locations.has(heading)) locations.set(heading, []);
      const out = locations.get(heading);

      for (const row of rows.slice(1)) {
        const cells = $(row)
          .find("td, th")
          .toArray()
          .map((c) => clean($(c).text()));
        if (cells.every((c) => !c)) continue;

        const raw = {};
        columns.forEach((col, i) => {
          if (col !== "sprite" && !col.startsWith("unknown:")) raw[col] = cells[i] ?? "";
        });
        if (!raw.pokemon) {
          warnings.push(`Row with empty pokemon cell in "${heading}": [${cells.join(" | ")}]`);
          continue;
        }
        out.push(raw);
      }
    };

    walk(body);
  }

  return { locations, warnings };
}
