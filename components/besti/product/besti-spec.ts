import { t } from "../../kalio/i18n/kalio-i18n";
/*
 * Besti — a product's specifications, read from Selldone's flat spec:
 * { "Design": "group", "Form Factor": ["Laptop", "Convertible"], … } in the
 * order of `spec_order`. A key whose value is "group" opens a group; the
 * rows after it belong to it. Nested spec is not read (Selldone ignores it
 * too). Nothing here names a key.
 */

export interface SpecRow {
  key: string;
  value: string;
}

export interface SpecGroup {
  title: string;
  rows: SpecRow[];
}

function text(value: any): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(", ");
  if (typeof value === "object") return "";
  return String(value).trim();
}

export function specGroups(product: any): SpecGroup[] {
  const spec = product?.spec;
  if (!spec || typeof spec !== "object" || Array.isArray(spec)) return [];
  const order: string[] =
    (Array.isArray(product?.spec_order) && product.spec_order.length ? product.spec_order : null) ||
    (Array.isArray(spec.spec_order) && spec.spec_order.length ? spec.spec_order : null) ||
    Object.keys(spec);
  const seen = new Set<string>();
  const keys = [...order, ...Object.keys(spec)].filter((k) => k !== "spec_order" && !seen.has(k) && seen.add(k));
  const out: SpecGroup[] = [];
  let group: SpecGroup = { title: t("besti.spec.general", "General"), rows: [] };
  for (const key of keys) {
    const value = spec[key];
    if (value === "group") {
      if (group.rows.length) out.push(group);
      group = { title: key, rows: [] };
      continue;
    }
    const v = text(value);
    if (v) group.rows.push({ key, value: v });
  }
  if (group.rows.length) out.push(group);
  return out;
}

export function specRows(product: any): SpecRow[] {
  return specGroups(product).flatMap((g) => g.rows);
}
