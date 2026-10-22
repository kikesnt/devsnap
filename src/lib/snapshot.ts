/**
 * Canvas rendering for the code snapshot tool.
 *
 * The image is drawn entirely on the client. A lightweight tokenizer provides
 * the syntax colours; a full highlighter would add far more weight than the
 * result justifies, and the visual difference on a 900 pixel wide image is
 * negligible.
 */

export interface SnapshotTheme {
  id: string;
  name: string;
  background: string;
  chrome: string;
  text: string;
  accent: string;
  keyword: string;
  string: string;
  number: string;
  comment: string;
  function: string;
  added: string;
  removed: string;
  addedBackground: string;
  removedBackground: string;
}

export const snapshotThemes: SnapshotTheme[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    background: '#0b1020',
    chrome: '#151b30',
    text: '#e6edf3',
    accent: '#7c8cff',
    keyword: '#c792ea',
    string: '#a5d6a7',
    number: '#f9a76c',
    comment: '#6b7793',
    function: '#82aaff',
    added: '#7ee787',
    removed: '#ff7b72',
    addedBackground: 'rgba(46, 160, 67, 0.16)',
    removedBackground: 'rgba(248, 81, 73, 0.16)',
  },
  {
    id: 'paper',
    name: 'Paper',
    background: '#ffffff',
    chrome: '#f1f3f7',
    text: '#24292f',
    accent: '#4f46e5',
    keyword: '#8250df',
    string: '#0a7c42',
    number: '#b35900',
    comment: '#6e7781',
    function: '#0550ae',
    added: '#116329',
    removed: '#a40e26',
    addedBackground: 'rgba(46, 160, 67, 0.14)',
    removedBackground: 'rgba(248, 81, 73, 0.12)',
  },
  {
    id: 'carbon',
    name: 'Carbon',
    background: '#1a1a1a',
    chrome: '#242424',
    text: '#e8e8e8',
    accent: '#ff7b72',
    keyword: '#ff7b72',
    string: '#a5d6a7',
    number: '#79c0ff',
    comment: '#8b949e',
    function: '#d2a8ff',
    added: '#7ee787',
    removed: '#ff7b72',
    addedBackground: 'rgba(46, 160, 67, 0.18)',
    removedBackground: 'rgba(248, 81, 73, 0.18)',
  },
  {
    id: 'solarized',
    name: 'Solarized',
    background: '#002b36',
    chrome: '#073642',
    text: '#93a1a1',
    accent: '#2aa198',
    keyword: '#859900',
    string: '#2aa198',
    number: '#d33682',
    comment: '#586e75',
    function: '#268bd2',
    added: '#859900',
    removed: '#dc322f',
    addedBackground: 'rgba(133, 153, 0, 0.18)',
    removedBackground: 'rgba(220, 50, 47, 0.18)',
  },
  {
    id: 'dracula',
    name: 'Dracula',
    background: '#282a36',
    chrome: '#343746',
    text: '#f8f8f2',
    accent: '#bd93f9',
    keyword: '#ff79c6',
    string: '#f1fa8c',
    number: '#bd93f9',
    comment: '#6272a4',
    function: '#50fa7b',
    added: '#50fa7b',
    removed: '#ff5555',
    addedBackground: 'rgba(80, 250, 123, 0.16)',
    removedBackground: 'rgba(255, 85, 85, 0.16)',
  },
  {
    id: 'rose',
    name: 'Rose',
    background: '#191724',
    chrome: '#1f1d2e',
    text: '#e0def4',
    accent: '#ebbcba',
    keyword: '#c4a7e7',
    string: '#f6c177',
    number: '#ebbcba',
    comment: '#6e6a86',
    function: '#9ccfd8',
    added: '#31748f',
    removed: '#e78284',
    addedBackground: 'rgba(49, 116, 143, 0.22)',
    removedBackground: 'rgba(231, 130, 132, 0.2)',
  },
  {
    id: 'github',
    name: 'GitHub',
    background: '#0d1117',
    chrome: '#161b22',
    text: '#e6edf3',
    accent: '#58a6ff',
    keyword: '#ff7b72',
    string: '#a5d6a7',
    number: '#79c0ff',
    comment: '#8b949e',
    function: '#d2a8ff',
    added: '#7ee787',
    removed: '#ff7b72',
    addedBackground: 'rgba(46, 160, 67, 0.18)',
    removedBackground: 'rgba(248, 81, 73, 0.16)',
  },
];

export interface SnapshotOptions {
  theme: string;
  title: string;
  showChrome: boolean;
  fontSize: number;
  padding: number;
  accent: string;
  language: string;
}

export const defaultSnapshotOptions: SnapshotOptions = {
  theme: 'midnight',
  title: '',
  showChrome: true,
  fontSize: 14,
  padding: 28,
  accent: '',
  language: 'auto',
};

export type TokenKind = 'plain' | 'keyword' | 'string' | 'number' | 'comment' | 'function' | 'added' | 'removed' | 'diffmeta';

export interface Token {
  kind: TokenKind;
  text: string;
}

const KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case',
  'break', 'continue', 'new', 'class', 'extends', 'super', 'this', 'typeof', 'instanceof', 'in', 'of',
  'try', 'catch', 'finally', 'throw', 'async', 'await', 'yield', 'import', 'export', 'from', 'default',
  'def', 'end', 'self', 'None', 'True', 'False', 'elif', 'lambda', 'pass', 'raise', 'with', 'as',
  'fn', 'pub', 'mut', 'impl', 'trait', 'struct', 'enum', 'use', 'package', 'func', 'type', 'go',
  'interface', 'public', 'private', 'protected', 'static', 'void', 'null', 'true', 'false', 'undefined',
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'INNER', 'ON', 'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT',
  'AND', 'OR', 'NOT', 'AS', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE',
  'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'DEFAULT', 'UNIQUE', 'INDEX',
]);

/** A diff is detected by the presence of unified-diff markers. */
export function isDiff(text: string): boolean {
  const lines = text.split('\n');
  const markers = lines.filter((line) => /^(diff |index |--- |\+\+\+ |@@ )/.test(line)).length;
  return markers >= 2;
}

export function detectLanguage(text: string, forced?: string): string {
  if (forced && forced !== 'auto') return forced;
  if (isDiff(text)) return 'diff';
  if (/^\s*[{\[]/.test(text) && /"\w+"\s*:/.test(text)) return 'json';
  if (/^\s*<\?xml|^\s*<[a-z]+[\s>]/i.test(text)) return 'xml';
  if (/^\s*(\$|#)\s+\w+|^(GET|POST|PUT|PATCH|DELETE)\s+\//m.test(text)) return 'shell';
  if (/\b(def|function|const|let|var|class|import|export)\b/.test(text)) return 'javascript';
  if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE)\b/i.test(text)) return 'sql';
  if (/^[A-Z_]+\s*=/m.test(text)) return 'env';
  return 'text';
}

export function tokenize(text: string, language: string): Token[] {
  const tokens: Token[] = [];
  const push = (kind: TokenKind, value: string) => {
    const last = tokens[tokens.length - 1];
    if (last && last.kind === kind) last.text += value;
    else tokens.push({ kind, text: value });
  };

  if (language === 'diff') {
    for (const line of text.split('\n')) {
      if (/^\+\+\+|^---/.test(line)) push('diffmeta', line);
      else if (line.startsWith('+')) push('added', line);
      else if (line.startsWith('-')) push('removed', line);
      else if (line.startsWith('@@')) push('keyword', line);
      else push('plain', line);
    }
    return tokens;
  }

  const pattern =
    /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|#[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_$][\w$]*\b)|(\s+)|([{}()[\];,.:=<>+\-*/%!&|?])/g;

  let match: RegExpExecArray | null;
  let lastIndex = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) push('plain', text.slice(lastIndex, match.index));
    const [full, comment, string, number, word, space, punct] = match;

    if (comment !== undefined) push('comment', comment);
    else if (string !== undefined) push('string', string);
    else if (number !== undefined) push('number', number);
    else if (word !== undefined) {
      if (KEYWORDS.has(word)) push('keyword', word);
      else if (/^[A-Z][A-Za-z0-9_]*$/.test(word)) push('function', word);
      else push('plain', word);
    } else if (space !== undefined) push('plain', space);
    else if (punct !== undefined) push('plain', punct);
    else push('plain', full ?? '');

    lastIndex = match.index + full.length;
  }
  if (lastIndex < text.length) push('plain', text.slice(lastIndex));

  return tokens;
}

export function themeById(id: string): SnapshotTheme {
  return snapshotThemes.find((theme) => theme.id === id) ?? snapshotThemes[0]!;
}

function colorFor(kind: TokenKind, theme: SnapshotTheme): string {
  switch (kind) {
    case 'keyword':
      return theme.keyword;
    case 'string':
      return theme.string;
    case 'number':
      return theme.number;
    case 'comment':
      return theme.comment;
    case 'function':
      return theme.function;
    case 'added':
      return theme.added;
    case 'removed':
      return theme.removed;
    case 'diffmeta':
      return theme.accent;
    default:
      return theme.text;
  }
}

const DIALOG_HEIGHTS: Record<string, number> = { light: 46, dark: 46, rose: 46, auto: 46 };

export function renderSnapshot(
  canvas: HTMLCanvasElement,
  source: string,
  options: SnapshotOptions
): { width: number; height: number } {
  const theme = themeById(options.theme);
  const accent = options.accent || theme.accent;
  const scale = 2;
  const fontFamily =
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';
  const fontSize = options.fontSize;
  const lineHeight = Math.round(fontSize * 1.5);
  const padding = options.padding;
  const chromeHeight = options.showChrome ? 46 : 0;

  const measure = document.createElement('canvas').getContext('2d');
  if (!measure) return { width: 0, height: 0 };
  measure.font = `${fontSize}px ${fontFamily}`;

  const language = detectLanguage(source, options.language);
  const isDiffImage = language === 'diff';

  const lines = source.replace(/\n$/, '').split('\n');
  const tokenized = lines.map((line) => tokenize(line, language));

  const widest = tokenized.reduce((max, tokens) => {
    const width = tokens.reduce((sum, token) => sum + measure.measureText(token.text).width, 0);
    return Math.max(max, width);
  }, 0);

  const contentWidth = Math.max(320, Math.ceil(widest) + padding * 2);
  const contentHeight = lines.length * lineHeight + padding * 2;
  const width = contentWidth;
  const height = contentHeight + chromeHeight;

  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const context = canvas.getContext('2d');
  if (!context) return { width, height };
  context.scale(scale, scale);

  // Background.
  context.fillStyle = theme.background;
  context.fillRect(0, 0, width, height);

  // Window chrome.
  if (options.showChrome) {
    context.fillStyle = theme.chrome;
    context.fillRect(0, 0, width, chromeHeight);
    const dots = ['#ff5f57', '#febc2e', '#28c840'];
    dots.forEach((color, index) => {
      context.beginPath();
      context.arc(22 + index * 20, chromeHeight / 2, 6, 0, Math.PI * 2);
      context.fillStyle = color;
      context.fill();
    });
    if (options.title) {
      context.fillStyle = theme.text;
      context.globalAlpha = 0.75;
      context.font = `500 ${Math.round(fontSize * 0.85)}px ${fontFamily}`;
      context.textAlign = 'center';
      context.fillText(options.title, width / 2, chromeHeight / 2 + fontSize * 0.3);
      context.globalAlpha = 1;
      context.textAlign = 'left';
    }
    context.fillStyle = accent;
    context.fillRect(0, chromeHeight - 2, width, 2);
  }

  // Code.
  context.font = `${fontSize}px ${fontFamily}`;
  context.textBaseline = 'top';

  lines.forEach((line, rowIndex) => {
    const y = chromeHeight + padding + rowIndex * lineHeight;

    if (isDiffImage) {
      const marker = line[0];
      if (marker === '+') {
        context.fillStyle = theme.addedBackground;
        context.fillRect(0, y - 2, width, lineHeight);
      } else if (marker === '-') {
        context.fillStyle = theme.removedBackground;
        context.fillRect(0, y - 2, width, lineHeight);
      }
    }

    let x = padding;
    for (const token of tokenized[rowIndex] ?? []) {
      context.fillStyle = colorFor(token.kind, theme);
      context.fillText(token.text, x, y);
      x += measure.measureText(token.text).width;
    }
  });

  return { width, height };
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
}
