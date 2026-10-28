import type { APIRoute } from 'astro';
import { ADSENSE_SELLER_LINE } from '../config';

/**
 * ads.txt
 *
 * The authorised sellers for the domain. AdSense reads this file to check
 * that the site is allowed to sell the account's inventory, and it reports
 * "ads.txt error" when the file is served without an authorised seller.
 *
 * The line names the publisher id of the ACCOUNT (`pub-…`), which is the
 * same for every site in the account and is not a secret. The per-site
 * editor id (`ca-pub-…`, read from PUBLIC_ADSENSE_CLIENT) is not a seller
 * and must never appear here.
 *
 * The line is served whether or not this build serves ads: ads.txt is a
 * statement about the domain, not about the ad units on the page. A build
 * without ads still has to be reviewable, and the review checks this file.
 */
export const GET: APIRoute = () => {
  const body = `# ads.txt for DevSnap\n${ADSENSE_SELLER_LINE}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
