// Minimal CSV parser handling quoted fields with embedded commas/newlines.

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Parse a two-column "English Name,Translated Name" mapping CSV (with header). */
export function parseNameMap(text) {
  const map = {};
  for (const [en, translated] of parseCsv(text).slice(1)) {
    if (en && translated) map[en.trim()] = translated.trim();
  }
  return map;
}

/** Parse an "English Name,Translated Name,Description" mapping CSV (with header). */
export function parseLocalizedMap(text) {
  const map = {};
  for (const [en, translated, desc] of parseCsv(text).slice(1)) {
    if (en && translated) map[en.trim()] = { name: translated.trim(), desc: desc?.trim() || null };
  }
  return map;
}
