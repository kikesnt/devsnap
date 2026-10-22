/** Small DOM helpers shared by the tool widgets. */

export function byId<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

export type StatusKind = 'error' | 'ok' | 'info';

export function setStatus(element: HTMLElement | null, message: string, kind: StatusKind = 'info'): void {
  if (!element) return;
  element.textContent = message;
  element.className = `status show status-${kind}`;
  element.setAttribute('role', kind === 'error' ? 'alert' : 'status');
}

export function clearStatus(element: HTMLElement | null): void {
  if (!element) return;
  element.textContent = '';
  element.className = 'status';
}

export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // Clipboard API needs a secure context; fall back to a hidden textarea.
    const area = document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

export function flashButton(button: HTMLButtonElement, message: string, original: string): void {
  const originalLabel = button.textContent;
  button.textContent = message;
  button.disabled = true;
  setTimeout(() => {
    button.textContent = originalLabel ?? original;
    button.disabled = false;
  }, 1400);
}

export function debounce<T extends (...args: never[]) => void>(fn: T, wait = 120): T {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return ((...args: never[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  }) as T;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}
