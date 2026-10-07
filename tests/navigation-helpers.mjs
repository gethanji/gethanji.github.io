// Astro updates scroll history before its asynchronous fetch/swap completes.
// Wait for the destination lifecycle, not the first same-document history event.
export async function navigateClick(page,selector) {
 const href=await page.$eval(selector,e=>e.href);
 await page.click(selector);
 await page.waitForFunction(href=>location.href===href&&document.documentElement.dataset.pageReady===location.pathname&&!document.documentElement.hasAttribute('data-astro-transition'),{},href);
}
