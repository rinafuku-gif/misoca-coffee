/** Read only the configured selling-price property's numeric result. Never
 * evaluate a formula, coerce a currency string, or look for a cost fallback. */
export function isNotionPriceType(type: unknown): type is "number" | "formula" {
  return type === "number" || type === "formula";
}
export function readNotionPriceValue(property: Record<string, unknown>): number | null {
  let value: unknown;
  if (property.type === "number") value = property.number;
  else if (property.type === "formula") {
    const formula = property.formula;
    if (!formula || typeof formula !== "object" || Array.isArray(formula)
      || !("type" in formula) || formula.type !== "number" || !("number" in formula)) {
      throw Error("NOTION_PRICE_INVALID");
    }
    value = formula.number;
  } else throw Error("NOTION_PRICE_INVALID");
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) throw Error("NOTION_PRICE_INVALID");
  return value;
}
