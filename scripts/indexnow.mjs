#!/usr/bin/env node
// Tell Bing (and every search engine that consumes IndexNow) that the site's
// URLs changed.
//
// IndexNow is Microsoft's protocol: a POST to api.indexnow.org with the site
// key and the list of URLs. Bing consumes it natively, which is what makes a
// new page show up in Bing in minutes instead of days.
//
// Two design rules:
//
//   1. The key is NOT a secret. By design it is published at the root of the
//      site, in the <key>.txt file. If the search engine cannot read that
//      file the request is rejected with a 422. That is why the key is found
//      by file name: the file that gets published is the source of the key.
//
//   2. This script never fails the build. If IndexNow is down, if the network
//      is broken or if the key never reaches the root, it prints a line and
//      exits with code 0. Notifying a search engine is an extra, not a
//      requirement.
//
// Usage: node scripts/indexnow.mjs [relative-path-of-the-sitemap]

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENDPOINT = "https://api.indexnow.org/indexnow";
const TIMEOUT_MS = 20000;

// The key is found by file name: 32 hex characters, as IndexNow keys are. It
// is the same file that gets published at the root of the site.
const readKey = () => {
  const publicDir = join(ROOT, "public");
  if (!existsSync(publicDir)) return null;
  const names = readdirSync(publicDir).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  return names.length ? names[0].slice(0, -4) : null;
};

// Possible sitemaps, in order of preference.
const SITEMAP_PATHS = [
  join(ROOT, "dist", "sitemap.xml"),
  join(ROOT, "dist", "sitemap-0.xml"),
  join(ROOT, "out", "sitemap.xml"),
];

const extractUrls = (xml) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);

// Only URLs that already answer are submitted. A URL that is not live yet is
// dropped: the search engine would reject it and could throw away the whole
// request, which is the opposite of what we want.
const answers = async (url) => {
  try {
    const r = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return r.status < 400;
  } catch {
    return false;
  }
};

const notify = async (host, key, urls) => {
  const body = {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList: urls,
  };
  const r = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = (await r.text()).slice(0, 300).trim();
  // 200 = validated and processed. 202 = queued while the key is validated.
  // 400 = malformed request. 422 = the key file was not found. 429 = too many
  // requests.
  console.log(`IndexNow: HTTP ${r.status} ${text} | ${urls.length} URLs on ${host}`);
  return r.status;
};

const main = async () => {
  const key = readKey();
  if (!key) {
    console.log("IndexNow: no key in public/<key>.txt. Nobody was notified.");
    return;
  }

  const sitemap = process.argv[2]
    ? join(ROOT, process.argv[2])
    : SITEMAP_PATHS.find((path) => existsSync(path));
  if (!sitemap) {
    console.log("IndexNow: no built sitemap found. Nobody was notified.");
    return;
  }

  let candidates;
  try {
    candidates = [...new Set(extractUrls(readFileSync(sitemap, "utf8")))];
  } catch (e) {
    console.log(`IndexNow: could not read the sitemap (${e.message}).`);
    return;
  }
  if (!candidates.length) {
    console.log("IndexNow: the sitemap has no URLs.");
    return;
  }

  const host = new URL(candidates[0]).host;
  const ours = candidates.filter((u) => {
    try {
      return new URL(u).host === host;
    } catch {
      return false;
    }
  });

  // Eight at a time: these are network calls and there is no need for more.
  const live = [];
  for (let i = 0; i < ours.length; i += 8) {
    const chunk = ours.slice(i, i + 8);
    const results = await Promise.all(chunk.map(async (u) => ((await answers(u)) ? u : null)));
    live.push(...results.filter(Boolean));
  }
  if (!live.length) {
    console.log(`IndexNow: none of the ${ours.length} URLs answer yet. Nobody was notified.`);
    return;
  }

  try {
    await notify(host, key, live);
  } catch (e) {
    console.log(`IndexNow: could not notify (${e.message}).`);
  }
};

await main();
