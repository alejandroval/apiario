import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';

const KEY = 'apiario:v1';
export const HIVE_COUNT = 12;

export function defaultState() {
  return {
    hives: Array.from({ length: HIVE_COUNT }, (_, i) => ({
      id: i + 1,
      name: `Arnia ${i + 1}`,
    })),
    visits: [],
    treatments: [],
  };
}

export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return defaultState();
    const data = JSON.parse(raw);
    const base = defaultState();
    return {
      hives: Array.isArray(data.hives) && data.hives.length ? data.hives : base.hives,
      visits: Array.isArray(data.visits) ? data.visits : [],
      treatments: Array.isArray(data.treatments) ? data.treatments : [],
    };
  } catch {
    return defaultState();
  }
}

export async function saveState(state) {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}

export function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

// ---- Date (salvate come YYYY-MM-DD in ora locale) ----
const MONTHS = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];

export function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISODate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(s) {
  if (!s) return '';
  const d = fromISODate(s);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function daysSince(s) {
  const a = fromISODate(s);
  const t = new Date();
  const b = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round((b - a) / 86400000);
}

export function sortByDateDesc(list) {
  return [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

// ---- Foto degli scontrini (copiate nella cartella documenti dell'app) ----
function receiptsDir() {
  const dir = new Directory(Paths.document, 'ricevute');
  if (!dir.exists) dir.create();
  return dir;
}

export async function saveReceiptPhoto(sourceUri) {
  const clean = sourceUri.split('?')[0];
  const ext = (clean.split('.').pop() || 'jpg').toLowerCase().slice(0, 4);
  const name = `scontrino-${Date.now()}.${ext}`;
  const dest = new File(receiptsDir(), name);
  await new File(sourceUri).copy(dest);
  return name;
}

export function receiptUri(name) {
  if (!name) return null;
  try {
    return new File(Paths.document, 'ricevute', name).uri;
  } catch {
    return null;
  }
}

export function deleteReceiptPhoto(name) {
  if (!name) return;
  try {
    const f = new File(Paths.document, 'ricevute', name);
    if (f.exists) f.delete();
  } catch {
    // ignorato: il file potrebbe non esistere più
  }
}
