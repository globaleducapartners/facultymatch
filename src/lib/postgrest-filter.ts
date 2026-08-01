/**
 * Escapes a value for safe interpolation into a hand-built PostgREST
 * `.or()`/`.and()` filter string (e.g. `` `headline.ilike.%${escapeOrValue(q)}%` ``).
 *
 * PostgREST's or/and syntax treats `,`, `.`, `(` and `)` as structural
 * characters. A raw user value containing them can break out of the intended
 * condition and inject an extra filter branch. Per PostgREST's own escaping
 * rule, wrapping the value in double quotes neutralizes those characters —
 * this only needs a backslash-escape for literal `\` and `"` inside it.
 */
export function escapeOrValue(value: string): string {
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return /[,.()]/.test(value) ? `"${escaped}"` : escaped;
}
