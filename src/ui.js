import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { C, R, T } from './theme';
import { formatDate, fromISODate, toISODate } from './storage';

export function Button({ title, onPress, kind = 'primary', style, disabled }) {
  const palette = {
    primary: { bg: C.honey, fg: C.ink, border: C.honey },
    dark: { bg: C.ink, fg: '#FFFFFF', border: C.ink },
    ghost: { bg: C.surface, fg: C.ink, border: C.line },
    danger: { bg: C.surface, fg: C.bad, border: C.badSoft },
  }[kind];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: '#00000022' }}
      style={({ pressed }) => [
        s.button,
        { backgroundColor: palette.bg, borderColor: palette.border, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <Text style={[s.buttonText, { color: palette.fg }]}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, tone = 'neutral' }) {
  const palette = {
    neutral: { bg: C.empty, fg: C.inkSoft },
    ok: { bg: C.okSoft, fg: C.ok },
    warn: { bg: C.warnSoft, fg: C.warn },
    bad: { bg: C.badSoft, fg: C.bad },
    honey: { bg: C.honeySoft, fg: C.honeyDark },
  }[tone];
  return (
    <View style={[s.chip, { backgroundColor: palette.bg }]}>
      <Text style={[s.chipText, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

export function Section({ label, hint, children }) {
  return (
    <View style={s.section}>
      <View style={s.sectionHead}>
        <Text style={T.label}>{label}</Text>
        {hint ? <Text style={T.soft}>{hint}</Text> : null}
      </View>
      {children}
    </View>
  );
}

// Scelta singola in una riga di pulsanti grandi (pensata per l'uso con i guanti).
export function Segmented({ options, value, onChange }) {
  return (
    <View style={s.segRow}>
      {options.map((o) => {
        const active = value === o.value;
        const tone = o.tone || 'honey';
        const bg = active ? { honey: C.honey, ok: C.ok, warn: C.warn, bad: C.bad }[tone] : C.surface;
        const fg = active ? (tone === 'honey' ? C.ink : '#FFFFFF') : C.ink;
        return (
          <Pressable
            key={String(o.value)}
            onPress={() => onChange(o.value)}
            style={[s.seg, { backgroundColor: bg, borderColor: active ? bg : C.line }]}
          >
            <Text style={[s.segText, { color: fg }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Fino a 10 riquadri, uno per telaino. Si tocca l'ultimo telaino occupato.
export function FrameBoxes({ value, onChange, max = 10, color = C.honey }) {
  return (
    <View>
      <View style={s.frames}>
        {Array.from({ length: max }, (_, i) => {
          const filled = i < value;
          return (
            <Pressable
              key={i}
              onPress={() => onChange(value === i + 1 ? i : i + 1)}
              style={[
                s.frame,
                { backgroundColor: filled ? color : C.empty, borderColor: filled ? color : C.line },
              ]}
            >
              <Text style={[s.frameNum, { color: filled ? C.ink : C.inkSoft }]}>{i + 1}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[T.soft, { marginTop: 8 }]}>
        <Text style={{ fontWeight: '800', color: C.ink, fontSize: 18 }}>{value}</Text> su {max} telaini
      </Text>
    </View>
  );
}

export function DateField({ value, onChange }) {
  const open = () => {
    DateTimePickerAndroid.open({
      value: fromISODate(value),
      mode: 'date',
      maximumDate: new Date(),
      onChange: (event, date) => {
        if (event.type === 'set' && date) onChange(toISODate(date));
      },
    });
  };
  return (
    <Pressable onPress={open} style={s.dateField}>
      <Text style={s.dateText}>{formatDate(value)}</Text>
      <Text style={[T.soft, { color: C.honeyDark, fontWeight: '700' }]}>Cambia</Text>
    </Pressable>
  );
}

export function Card({ children, style, onPress }) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} android_ripple={{ color: '#00000011' }} style={[s.card, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[s.card, style]}>{children}</View>;
}

export function TopBar({ title, onBack, right }) {
  return (
    <View style={s.topBar}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={12} style={s.back}>
          <Text style={s.backText}>‹</Text>
        </Pressable>
      ) : null}
      <Text style={[T.title, { flex: 1 }]} numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}

const s = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: R.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  buttonText: { fontSize: 16, fontWeight: '800' },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { fontSize: 12, fontWeight: '700' },
  section: { gap: 10, marginBottom: 22 },
  sectionHead: { gap: 2 },
  segRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  seg: {
    flexGrow: 1,
    minWidth: 90,
    minHeight: 52,
    borderRadius: R.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  segText: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  frames: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  frame: {
    width: '17.6%',
    height: 52,
    borderRadius: R.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameNum: { fontSize: 16, fontWeight: '800' },
  dateField: {
    minHeight: 52,
    borderRadius: R.md,
    borderWidth: 1.5,
    borderColor: C.line,
    backgroundColor: C.surface,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: { fontSize: 17, fontWeight: '700', color: C.ink },
  card: {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.line,
    padding: 14,
  },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.line },
  backText: { fontSize: 26, fontWeight: '700', color: C.ink, marginTop: -3 },
});
