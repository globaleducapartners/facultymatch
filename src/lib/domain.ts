/**
 * Extract the root domain from a website URL (remove protocol, www, path).
 * Examples:
 *   "https://www.ucam.edu"       → "ucam.edu"
 *   "https://ucam.edu"           → "ucam.edu"
 *   "https://www.ucam.edu/es"    → "ucam.edu"
 *   "ucam.edu"                    → "ucam.edu"
 */
export function extractDomainFromWebsite(website: string | null | undefined): string | null {
  if (!website) return null;
  try {
    let hostname = website.trim().toLowerCase();
    // Prepend protocol if missing
    if (!/^https?:\/\//i.test(hostname)) {
      hostname = "https://" + hostname;
    }
    const url = new URL(hostname);
    let domain = url.hostname;
    // Remove leading www.
    domain = domain.replace(/^www\./, "");
    return domain;
  } catch {
    // If URL parsing fails, try manual extraction
    const cleaned = website.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    return cleaned.replace(/^www\./, "") || null;
  }
}

/**
 * Get the domain part from an email address.
 * "mamarti@alu.ucam.edu" → "alu.ucam.edu"
 */
export function extractDomainFromEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const parts = email.trim().toLowerCase().split("@");
  return parts.length === 2 && parts[1] ? parts[1] : null;
}

/**
 * Check if an email domain matches a blocked domain, accounting for subdomains.
 * Returns true if:
 *   - emailDomain === blockedDomain (exact match), OR
 *   - emailDomain ends with "." + blockedDomain (subdomain match)
 *
 * Examples:
 *   matchesBlockedDomain("ucam.edu", "ucam.edu")         → true
 *   matchesBlockedDomain("alu.ucam.edu", "ucam.edu")     → true
 *   matchesBlockedDomain("gmail.com", "ucam.edu")        → false
 *   matchesBlockedDomain("fake-ucam.edu", "ucam.edu")    → false
 */
export function matchesBlockedDomain(
  emailDomain: string | null,
  blockedDomain: string | null
): boolean {
  if (!emailDomain || !blockedDomain) return false;
  const ed = emailDomain.toLowerCase();
  const bd = blockedDomain.toLowerCase();
  return ed === bd || ed.endsWith("." + bd);
}

/**
 * Given a user's email address and an array of blocked domain rules (from visibility_rules),
 * return the set of faculty_ids whose blocking domain matches the user's email domain.
 *
 * This is used to apply domain-based blocking when viewing profiles or searching.
 *
 * @param userEmail - The email of the user viewing/accessing the content
 * @param domainRules - Array of { faculty_id, domain } from visibility_rules WHERE domain IS NOT NULL AND rule = 'block'
 * @returns Set of faculty_ids that should be blocked
 */
export function getDomainBlockedFacultyIds(
  userEmail: string | null | undefined,
  domainRules: { faculty_id: string; domain: string | null }[] | null
): string[] {
  if (!userEmail || !domainRules || domainRules.length === 0) return [];
  const emailDomain = extractDomainFromEmail(userEmail);
  if (!emailDomain) return [];
  const blockedIds: string[] = [];
  for (const rule of domainRules) {
    if (matchesBlockedDomain(emailDomain, rule.domain)) {
      blockedIds.push(rule.faculty_id);
    }
  }
  return blockedIds;
}