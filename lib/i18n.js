/**
 * Returns the localised value for a bilingual product field (e.g. name, description).
 * Falls back to Bulgarian if the requested locale has no value.
 */
export function getLocalizedField(product, field, locale) {
  return product[`${field}_${locale}`] ?? product[`${field}_bg`] ?? '';
}
