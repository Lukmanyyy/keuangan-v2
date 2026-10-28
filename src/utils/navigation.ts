export function isRemovedAdminUrl(path: string, hash: string) {
  return /^\/admin(?:\/|$)/.test(path) || hash === '#admin';
}

export function publicScreenFromUrl(path: string, hash: string): 'welcome'|'privacy'|'terms' {
  if (path === '/privacy' || path.startsWith('/privacy/') || hash === '#privacy') return 'privacy';
  if (path === '/terms' || path.startsWith('/terms/') || hash === '#terms') return 'terms';
  return 'welcome';
}
