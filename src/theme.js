// Palette: verde-grigio da campo (leggibile al sole), miele come unico accento, propoli per il testo caldo.
export const C = {
  bg: '#EEF0E9',
  surface: '#FFFFFF',
  ink: '#1E2619',
  inkSoft: '#5B6553',
  line: '#D9DDD0',
  honey: '#E3A008',
  honeyDark: '#7A4E00',
  honeySoft: '#FBEFC9',
  ok: '#2F7D3A',
  okSoft: '#DCEEDD',
  warn: '#B8610B',
  warnSoft: '#F8E3CC',
  bad: '#B3261E',
  badSoft: '#F6D9D6',
  empty: '#E4E7DC',
};

export const R = { sm: 8, md: 12, lg: 16 };

export const T = {
  title: { fontSize: 26, fontWeight: '800', color: C.ink, letterSpacing: -0.3 },
  h2: { fontSize: 18, fontWeight: '700', color: C.ink },
  body: { fontSize: 16, color: C.ink },
  soft: { fontSize: 14, color: C.inkSoft },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: C.inkSoft,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
};
