/**
 * Generates a URL-friendly slug from a given string.
 *
 * @param input The input string to be slugified.
 * @returns A URL-friendly slug (no spaces, no symbols).
 */
export function generateSlug(input: string): string {
  // 1. Convert the string to lowercase.
  let slug = input.toLowerCase()

  // 2. Normalize the string to remove diacritical marks (e.g., é -> e).
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  // 3. Remove all non-alphanumeric characters (except spaces and hyphens).
  slug = slug.replace(/[^a-z0-9\s-]/g, '')

  // 4. Replace one or more spaces with a single hyphen.
  slug = slug.replace(/\s+/g, '-')

  // 5. Trim any leading or trailing hyphens.
  slug = slug.replace(/^-+|-+$/g, '')

  return slug
}
