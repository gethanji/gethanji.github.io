import {canonicalRoutes, locales, route} from '../data/site';
export function GET({site}) {
 const origin=site.origin;
 const rows=canonicalRoutes.map(({lang,page,path})=>`<url><loc>${origin}${path}</loc>${locales.map(l=>`<xhtml:link rel="alternate" hreflang="${l}" href="${origin}${route(l,page)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${origin}${route('en',page)}"/></url>`);
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${rows.join('')}<url><loc>${origin}/docs/</loc></url></urlset>`,{headers:{'Content-Type':'application/xml'}});
}
