/**
 * cURL command parsing and conversion.
 *
 * The parser handles the flags that actually appear in commands copied out of
 * a browser's devtools, which is where almost every cURL command comes from.
 */

export interface ParsedCurl {
  url: string;
  method: string;
  headers: { name: string; value: string }[];
  body?: string;
  cookies?: string;
  auth?: { user: string; password: string };
  insecure: boolean;
  unsupported: string[];
}

const METHOD_FLAGS: Record<string, string> = {
  '-X': 'method',
  '--request': 'method',
  '-H': 'header',
  '--header': 'header',
  '-d': 'data',
  '--data': 'data',
  '--data-raw': 'data',
  '--data-binary': 'data',
  '--data-urlencode': 'data',
  '-b': 'cookie',
  '--cookie': 'cookie',
  '-u': 'auth',
  '--user': 'auth',
  '-k': 'insecure',
  '--insecure': 'insecure',
  '-A': 'user-agent',
  '--user-agent': 'user-agent',
  '-e': 'referer',
  '--referer': 'referer',
  '-L': 'follow',
  '--location': 'follow',
};

export function parseCurl(command: string): ParsedCurl {
  const result: ParsedCurl = {
    url: '',
    method: 'GET',
    headers: [],
    insecure: false,
    unsupported: [],
  };

  const tokens = tokenize(command);
  let index = 0;

  while (index < tokens.length) {
    const token = tokens[index]!;
    index += 1;

    if (token === 'curl') continue;

    if (token.startsWith('-')) {
      const [flag, inlineValue] = token.includes('=')
        ? [token.slice(0, token.indexOf('=')), token.slice(token.indexOf('=') + 1)]
        : [token, undefined];

      const kind = METHOD_FLAGS[flag];
      if (!kind) {
        result.unsupported.push(flag);
        continue;
      }

      if (kind === 'insecure') {
        result.insecure = true;
        continue;
      }

      if (kind === 'follow') {
        result.headers.push({ name: 'X-Follow-Redirects', value: 'true' });
        continue;
      }

      let value = inlineValue;
      if (value === undefined) {
        value = tokens[index] ?? '';
        index += 1;
      }

      if (kind === 'method') {
        result.method = value.toUpperCase();
        continue;
      }
      if (kind === 'header') {
        const separator = value.indexOf(':');
        if (separator === -1) {
          result.unsupported.push(flag);
          continue;
        }
        result.headers.push({
          name: value.slice(0, separator).trim(),
          value: value.slice(separator + 1).trim(),
        });
        continue;
      }
      if (kind === 'data') {
        result.body = (result.body ?? '') + value;
        continue;
      }
      if (kind === 'cookie') {
        result.cookies = value;
        continue;
      }
      if (kind === 'auth') {
        const separator = value.indexOf(':');
        result.auth =
          separator === -1
            ? { user: value, password: '' }
            : { user: value.slice(0, separator), password: value.slice(separator + 1) };
        continue;
      }
      if (kind === 'user-agent' || kind === 'referer') {
        result.headers.push({
          name: kind === 'user-agent' ? 'User-Agent' : 'Referer',
          value,
        });
      }
      continue;
    }

    if (!result.url) {
      result.url = token;
      continue;
    }
  }

  if (result.body !== undefined && result.method === 'GET') {
    result.method = 'POST';
  }

  return result;
}

/** Splits a command line, respecting quotes. */
function tokenize(command: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quote: string | null = null;

  for (let index = 0; index < command.length; index += 1) {
    const char = command[index]!;

    if (quote) {
      if (char === '\\' && index + 1 < command.length) {
        current += command[index + 1];
        index += 1;
        continue;
      }
      if (char === quote) {
        quote = null;
        continue;
      }
      current += char;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (/\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    if (char === '\\' && index + 1 < command.length) {
      current += command[index + 1];
      index += 1;
      continue;
    }
    current += char;
  }

  if (current) tokens.push(current);
  return tokens;
}

function quote(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function looksLikeJson(body: string | undefined): boolean {
  if (!body) return false;
  try {
    JSON.parse(body);
    return true;
  } catch {
    return false;
  }
}

function headerMap(parsed: ParsedCurl): Record<string, string> {
  const map: Record<string, string> = {};
  for (const header of parsed.headers) {
    map[header.name.toLowerCase()] = header.value;
  }
  if (parsed.cookies) map.cookie = parsed.cookies;
  return map;
}

export function toFetch(parsed: ParsedCurl): string {
  const headers = headerMap(parsed);
  const lines: string[] = [];
  lines.push(`const response = await fetch(${quote(parsed.url)}, {`);
  lines.push(`  method: ${quote(parsed.method)},`);
  const headerEntries = Object.entries(headers);
  if (headerEntries.length > 0) {
    lines.push('  headers: {');
    for (const [name, value] of headerEntries) {
      lines.push(`    ${quote(name)}: ${quote(value)},`);
    }
    lines.push('  },');
  }
  if (parsed.body !== undefined) {
    const asJson = looksLikeJson(parsed.body);
    lines.push(
      `  body: ${asJson ? `JSON.stringify(${parsed.body})` : quote(parsed.body)},`
    );
  }
  lines.push('});');
  lines.push('');
  lines.push('const data = await response.json();');
  return lines.join('\n');
}

export function toPython(parsed: ParsedCurl): string {
  const headers = headerMap(parsed);
  const lines: string[] = [];
  lines.push('import requests');
  lines.push('');
  const hasHeaders = Object.keys(headers).length > 0;
  if (hasHeaders) {
    lines.push('headers = {');
    for (const [name, value] of Object.entries(headers)) {
      lines.push(`    ${quote(name)}: ${quote(value)},`);
    }
    lines.push('}');
    lines.push('');
  }
  if (parsed.auth) {
    lines.push(
      `response = requests.${parsed.method.toLowerCase()}(${quote(parsed.url)}${
        hasHeaders ? ', headers=headers' : ''
      }, auth=(${quote(parsed.auth.user)}, ${quote(parsed.auth.password)}))`
    );
  } else if (parsed.body !== undefined) {
    const asJson = looksLikeJson(parsed.body);
    const arg = asJson ? 'json=' : 'data=';
    lines.push(
      `response = requests.${parsed.method.toLowerCase()}(${quote(parsed.url)}${
        hasHeaders ? ', headers=headers' : ''
      }, ${arg}${parsed.body})`
    );
  } else {
    lines.push(
      `response = requests.${parsed.method.toLowerCase()}(${quote(parsed.url)}${
        hasHeaders ? ', headers=headers' : ''
      })`
    );
  }
  lines.push('');
  lines.push('print(response.json())');
  return lines.join('\n');
}

export function toGo(parsed: ParsedCurl): string {
  const headers = headerMap(parsed);
  const lines: string[] = [];
  lines.push('package main');
  lines.push('');
  lines.push('import (');
  lines.push('\t"fmt"');
  lines.push('\t"io"');
  lines.push('\t"net/http"');
  lines.push('\t"strings"');
  lines.push(')');
  lines.push('');
  lines.push('func main() {');
  lines.push(`\turl := ${quote(parsed.url)}`);
  if (parsed.body !== undefined) {
    lines.push(`\tpayload := ${quote(parsed.body)}`);
  }
  lines.push('');
  lines.push('\treq, _ := http.NewRequest(' + quote(parsed.method) + ', url, body)');
  for (const [name, value] of Object.entries(headers)) {
    lines.push(`\treq.Header.Set(${quote(name)}, ${quote(value)})`);
  }
  lines.push('');
  lines.push('\tres, err := http.DefaultClient.Do(req)');
  lines.push('\tif err != nil {');
  lines.push('\t\tpanic(err)');
  lines.push('\t}');
  lines.push('\tdefer res.Body.Close()');
  lines.push('');
  lines.push('\tdata, _ := io.ReadAll(res.Body)');
  lines.push('\tfmt.Println(string(data))');
  lines.push('}');
  return lines.join('\n');
}

export function toPhp(parsed: ParsedCurl): string {
  const headers = headerMap(parsed);
  const lines: string[] = [];
  lines.push('<?php');
  lines.push('');
  lines.push('$ch = curl_init();');
  lines.push('');
  lines.push(`curl_setopt($ch, CURLOPT_URL, ${quote(parsed.url)});`);
  lines.push(`curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);`);
  lines.push(`curl_setopt($ch, CURLOPT_CUSTOMREQUEST, ${quote(parsed.method)});`);
  for (const [name, value] of Object.entries(headers)) {
    lines.push(`curl_setopt($ch, CURLOPT_HTTPHEADER, [${quote(`${name}: ${value}`)}]);`);
  }
  if (parsed.body !== undefined) {
    lines.push(`curl_setopt($ch, CURLOPT_POSTFIELDS, ${quote(parsed.body)});`);
  }
  if (parsed.insecure) {
    lines.push('curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);');
  }
  lines.push('');
  lines.push('$response = curl_exec($ch);');
  lines.push('curl_close($ch);');
  lines.push('');
  lines.push('echo $response;');
  return lines.join('\n');
}

export function toRuby(parsed: ParsedCurl): string {
  const headers = headerMap(parsed);
  const lines: string[] = [];
  lines.push("require 'net/http'");
  lines.push("require 'uri'");
  lines.push("require 'json'");
  lines.push('');
  lines.push('uri = URI(' + quote(parsed.url) + ')');
  lines.push('');
  lines.push('http = Net::HTTP.new(uri.host, uri.port)');
  lines.push('http.use_ssl = uri.scheme == "https"');
  lines.push('');
  const rubyMethod = parsed.method.charAt(0) + parsed.method.slice(1).toLowerCase();
  lines.push(`request = Net::HTTP::${rubyMethod}.new(uri)`);
  for (const [name, value] of Object.entries(headers)) {
    lines.push(`request[${quote(name)}] = ${quote(value)}`);
  }
  if (parsed.body !== undefined) {
    lines.push(`request.body = ${quote(parsed.body)}`);
  }
  lines.push('');
  lines.push('response = http.request(request)');
  lines.push('puts response.read_body');
  return lines.join('\n');
}

export function toRust(parsed: ParsedCurl): string {
  const headers = headerMap(parsed);
  const lines: string[] = [];
  lines.push('use reqwest::blocking::Client;');
  lines.push('');
  lines.push('fn main() -> Result<(), Box<dyn std::error::Error>> {');
  lines.push('    let client = Client::new();');
  lines.push('');
  const headerLines = Object.entries(headers)
    .map(([name, value]) => `        .header(${quote(name)}, ${quote(value)})`)
    .join('\n');
  lines.push('    let response = client');
  lines.push(`        .${parsed.method.toLowerCase()}(${quote(parsed.url)})`);
  if (headerLines) lines.push(headerLines);
  if (parsed.body !== undefined) {
    lines.push(`        .body(${quote(parsed.body)})`);
  }
  lines.push('        .send()?;');
  lines.push('');
  lines.push('    println!("{}", response.text()?);');
  lines.push('    Ok(())');
  lines.push('}');
  return lines.join('\n');
}

export function toHttpie(parsed: ParsedCurl): string {
  const headers = headerMap(parsed);
  const parts: string[] = ['http'];
  if (parsed.method !== 'GET') parts.push(parsed.method);
  parts.push(parsed.url);
  for (const [name, value] of Object.entries(headers)) {
    if (name === 'content-type') {
      parts.push(`Content-Type:${value}`);
    } else {
      parts.push(`${name}:${value}`);
    }
  }
  if (parsed.body !== undefined) {
    const asJson = looksLikeJson(parsed.body);
    parts.push(asJson ? parsed.body : `=${parsed.body}`);
  }
  return parts.join(' ');
}

export type CurlTarget = 'fetch' | 'python' | 'go' | 'php' | 'ruby' | 'rust' | 'httpie';

export const curlTargets: { id: CurlTarget; label: string }[] = [
  { id: 'fetch', label: 'JavaScript (fetch)' },
  { id: 'python', label: 'Python (requests)' },
  { id: 'go', label: 'Go (net/http)' },
  { id: 'php', label: 'PHP (cURL)' },
  { id: 'ruby', label: 'Ruby (net/http)' },
  { id: 'rust', label: 'Rust (reqwest)' },
  { id: 'httpie', label: 'HTTPie' },
];

export function convertCurl(parsed: ParsedCurl, target: CurlTarget): string {
  switch (target) {
    case 'fetch':
      return toFetch(parsed);
    case 'python':
      return toPython(parsed);
    case 'go':
      return toGo(parsed);
    case 'php':
      return toPhp(parsed);
    case 'ruby':
      return toRuby(parsed);
    case 'rust':
      return toRust(parsed);
    case 'httpie':
      return toHttpie(parsed);
  }
}
