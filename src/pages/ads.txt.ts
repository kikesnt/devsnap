import type { APIRoute } from 'astro';
import { ADSENSE_CLIENT } from '../config';

/**
 * ads.txt
 *
 * Authorised sellers for the domain. The AdSense line is the seller id from
 * the AdSense account. Google Ad Manager uses the same `pub-` identifier with
 * a different tag, so this file has to be kept in sync when the account is
 * migrated from AdSense to Ad Manager.
 */
export const GET: APIRoute = () => {
  const lines: string[] = [
    '# ads.txt for DevSnap',
    '# AdSense publisher id',
  ];

  if (ADSENSE_CLIENT) {
    lines.push(`google.com, ${ADSENSE_CLIENT}, DIRECT, f08c47fec0942fa0`);
  } else {
    lines.push('# Add the publisher id once the AdSense account is created:');
    lines.push('# google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0');
  }

  const body = `${lines.join('\n')}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
