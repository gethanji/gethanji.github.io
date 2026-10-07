// Public hosted form supplied by the recipient. Never include a recipient email
// or private activation link here. /el/ links are not AJAX submission endpoints.
export const accessFormUrl = 'https://formsubmit.co/el/xuriwu';

export function accessRequestUrl(product: 'knowledge' | 'tracker'): string {
  const url = new URL(accessFormUrl);
  const project = product === 'knowledge' ? 'Knowledge' : 'Tracker';
  url.searchParams.set('subject', `Hanji ${project} access request`);
  return url.href;
}

// Public invisible-email ID supplied after recipient confirmation.
export const accessFormId = 'c4fda211bcbfbc7401fe094caee1bbc3';
export const accessFormReady = /^[a-f0-9]{32}$/i.test(accessFormId);
export const accessFormEndpoint = accessFormReady ? `https://formsubmit.co/${accessFormId}` : undefined;
