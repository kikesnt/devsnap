/**
 * QR code generation wrapper around `qrcode-generator`.
 *
 * The library is dependency-free and works in the browser, which keeps the
 * generated codes entirely on the client.
 */
import qrcode from 'qrcode-generator';

export type QrErrorLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrOptions {
  errorLevel: QrErrorLevel;
  cellSize: number;
  margin: number;
  foreground: string;
  background: string;
}

export const defaultQrOptions: QrOptions = {
  errorLevel: 'M',
  cellSize: 8,
  margin: 4,
  foreground: '#0b1020',
  background: '#ffffff',
};

export interface QrMatrix {
  size: number;
  modules: boolean[][];
}

export function buildQr(text: string, options: QrOptions): QrMatrix {
  const qr = qrcode(0, options.errorLevel);
  qr.addData(text);
  qr.make();

  const count = qr.getModuleCount();
  const modules: boolean[][] = [];
  for (let row = 0; row < count; row += 1) {
    const line: boolean[] = [];
    for (let column = 0; column < count; column += 1) {
      line.push(qr.isDark(row, column));
    }
    modules.push(line);
  }
  return { size: count, modules };
}

export function drawQr(
  canvas: HTMLCanvasElement,
  matrix: QrMatrix,
  options: QrOptions
): void {
  const dimension = (matrix.size + options.margin * 2) * options.cellSize;
  canvas.width = dimension;
  canvas.height = dimension;

  const context = canvas.getContext('2d');
  if (!context) return;

  context.fillStyle = options.background;
  context.fillRect(0, 0, dimension, dimension);
  context.fillStyle = options.foreground;

  for (let row = 0; row < matrix.size; row += 1) {
    for (let column = 0; column < matrix.size; column += 1) {
      if (!matrix.modules[row]![column]) continue;
      const x = (column + options.margin) * options.cellSize;
      const y = (row + options.margin) * options.cellSize;
      context.fillRect(x, y, options.cellSize, options.cellSize);
    }
  }
}

export function qrToSvg(matrix: QrMatrix, options: QrOptions): string {
  const dimension = (matrix.size + options.margin * 2) * options.cellSize;
  const parts: string[] = [];
  for (let row = 0; row < matrix.size; row += 1) {
    for (let column = 0; column < matrix.size; column += 1) {
      if (!matrix.modules[row]![column]) continue;
      const x = (column + options.margin) * options.cellSize;
      const y = (row + options.margin) * options.cellSize;
      parts.push(`<rect x="${x}" y="${y}" width="${options.cellSize}" height="${options.cellSize}"/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${dimension}" height="${dimension}" viewBox="0 0 ${dimension} ${dimension}"><rect width="${dimension}" height="${dimension}" fill="${options.background}"/><g fill="${options.foreground}">${parts.join('')}</g></svg>`;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('The image could not be generated'));
    }, 'image/png');
  });
}

/** Builds the payload for each preset. */
export type QrPreset = 'url' | 'wifi' | 'vcard' | 'email' | 'sms' | 'event' | 'text';

export function buildPayload(preset: QrPreset, values: Record<string, string>): string {
  switch (preset) {
    case 'wifi':
      return `WIFI:T:${values.security || 'WPA'};S:${values.ssid || ''};P:${values.password || ''};H:${values.hidden === 'true' ? 'true' : 'false'};;`;
    case 'vcard':
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${values.lastName || ''};${values.firstName || ''};;;`,
        `FN:${values.firstName || ''} ${values.lastName || ''}`.trim(),
        values.organization ? `ORG:${values.organization}` : '',
        values.title ? `TITLE:${values.title}` : '',
        values.phone ? `TEL:${values.phone}` : '',
        values.email ? `EMAIL:${values.email}` : '',
        values.website ? `URL:${values.website}` : '',
        values.address ? `ADR:;;${values.address};;;;` : '',
        'END:VCARD',
      ]
        .filter(Boolean)
        .join('\n');
    case 'email':
      return `mailto:${values.to || ''}?subject=${encodeURIComponent(values.subject || '')}&body=${encodeURIComponent(values.body || '')}`;
    case 'sms':
      return `SMSTO:${values.phone || ''}:${values.body || ''}`;
    case 'event': {
      const start = values.start ? new Date(values.start) : null;
      const end = values.end ? new Date(values.end) : null;
      const stamp = (date: Date | null) =>
        date ? date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '') : '';
      return [
        'BEGIN:VEVENT',
        `SUMMARY:${values.title || ''}`,
        values.location ? `LOCATION:${values.location}` : '',
        `DTSTART:${stamp(start)}`,
        `DTEND:${stamp(end)}`,
        values.description ? `DESCRIPTION:${values.description}` : '',
        'END:VEVENT',
      ]
        .filter(Boolean)
        .join('\n');
    }
    case 'text':
      return values.text || '';
    default:
      return values.url || '';
  }
}
