import { daysSince, sortByDateDesc } from './storage';

export const QUEEN_OPTIONS = [
  { value: 'si', label: 'Presente', tone: 'ok' },
  { value: 'no', label: 'Assente', tone: 'bad' },
  { value: 'nv', label: 'Non vista', tone: 'warn' },
];

export const YESNO = [
  { value: true, label: 'Sì', tone: 'ok' },
  { value: false, label: 'No', tone: 'warn' },
];

export const POLLEN_OPTIONS = [
  { value: 0, label: 'Assente', tone: 'bad' },
  { value: 1, label: 'Poco', tone: 'warn' },
  { value: 2, label: 'Medio', tone: 'honey' },
  { value: 3, label: 'Molto', tone: 'ok' },
];

export const GRIP_OPTIONS = [
  { value: 1, label: 'Scarsa', tone: 'bad' },
  { value: 2, label: 'Media', tone: 'warn' },
  { value: 3, label: 'Buona', tone: 'ok' },
];

export const VARROA_OPTIONS = [
  { value: 0, label: 'Assente', tone: 'ok' },
  { value: 1, label: 'Presente', tone: 'warn' },
  { value: 2, label: 'Elevata', tone: 'bad' },
];

export const label = (options, value) => options.find((o) => o.value === value)?.label ?? '—';

export function visitsOf(visits, hiveId) {
  return sortByDateDesc(visits.filter((v) => v.hiveId === hiveId));
}

export function emptyVisit(hiveId, date, previous) {
  return {
    hiveId,
    date,
    queen: 'si',
    queenYear: previous?.queenYear ?? null,
    frames: previous?.frames ?? 6,
    broodCapped: true,
    broodFresh: true,
    droneBrood: false,
    honeyFrames: previous?.honeyFrames ?? 2,
    pollen: 2,
    grip: 3,
    varroa: 0,
    note: '',
  };
}

export function queenTone(queen) {
  return queen === 'si' ? 'ok' : queen === 'no' ? 'bad' : 'warn';
}

export function varroaTone(v) {
  return v === 0 ? 'ok' : v === 1 ? 'warn' : 'bad';
}

// Ultimo anno regina noto per l'arnia (anche da visite precedenti).
export function lastQueenYear(list) {
  const hit = list.find((v) => v.queenYear);
  return hit ? hit.queenYear : null;
}

export function visitAge(visit) {
  if (!visit) return null;
  return daysSince(visit.date);
}

export function ageLabel(days) {
  if (days === null) return 'Mai visitata';
  if (days <= 0) return 'Oggi';
  if (days === 1) return 'Ieri';
  return `${days} giorni fa`;
}
