// Public hosted form supplied by the recipient. Never include a recipient email
// or private activation link here. /el/ links are not AJAX submission endpoints.
export const accessFormUrl = 'https://formsubmit.co/el/xuriwu';

export function accessRequestUrl(product: 'knowledge' | 'tracker'): string {
  const url = new URL(accessFormUrl);
  const project = product === 'knowledge' ? 'Knowledge' : 'Tracker';
  url.searchParams.set('subject', `Hanji ${project} access request`);
  return url.href;
}
