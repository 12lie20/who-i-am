/**
 * Normalize Arabic text for comparison by removing diacritics,
 * standardizing letter variants, stripping the definite article, etc.
 */
export function normalizeArabic(text: string): string {
  return text
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, '')  // Remove tashkeel/diacritics
    .replace(/[أإآ]/g, 'ا')                  // Normalize alef variants
    .replace(/ة/g, 'ه')                      // Ta marbuta → Ha
    .replace(/ى/g, 'ي')                      // Alef maksura → Ya
    .replace(/[ؤئ]/g, 'ء')                   // Normalize hamza variants
    .replace(/ـ/g, '')                        // Remove tatweel/kashida
    .replace(/^ال/, '')                       // Strip leading ال
    .replace(/\s+/g, '')                      // Remove all spaces
}

/**
 * Compare two Arabic strings using fuzzy normalization.
 * Returns true if both strings normalize to the same value.
 */
export function arabicFuzzyMatch(input: string, target: string): boolean {
  const normalizedInput = normalizeArabic(input)
  const normalizedTarget = normalizeArabic(target)
  return normalizedInput === normalizedTarget
}
