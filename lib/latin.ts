/**
 * Detect Latin/Faker placeholder text so the app can show English content instead.
 */
export function looksLikeLatin(text: string): boolean {
  if (!text || typeof text !== 'string') return false
  const t = text.toLowerCase()
  return (
    /\b(qui|ut|et|officiis|necessitatibus|repudiandae|voluptatem|dolor|temporibus|ullam|consequatur|harum|blanditiis|recusandae|perspiciatis|praesentium|adipisci|delectus|repellat|voluptat)\b/.test(t) ||
    /\b(lorem|ipsum|dolor sit|amet consectetur)\b/.test(t)
  )
}
