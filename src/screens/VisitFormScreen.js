import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { C, R, T } from '../theme';
import { Button, DateField, FrameBoxes, Section, Segmented, TopBar } from '../ui';
import { newId, toISODate } from '../storage';
import {
  emptyVisit,
  GRIP_OPTIONS,
  lastQueenYear,
  POLLEN_OPTIONS,
  QUEEN_OPTIONS,
  VARROA_OPTIONS,
  visitsOf,
  YESNO,
} from '../domain';

export default function VisitFormScreen({ state, hiveId, visitId, bottomInset, onBack, onSave, onDelete }) {
  const hive = state.hives.find((h) => h.id === hiveId);
  const existing = visitId ? state.visits.find((v) => v.id === visitId) : null;
  const history = visitsOf(state.visits, hiveId);

  const [v, setV] = useState(() => {
    if (existing) return { ...existing };
    const base = emptyVisit(hiveId, toISODate(new Date()), history[0]);
    base.queenYear = lastQueenYear(history);
    return base;
  });
  const set = (patch) => setV((cur) => ({ ...cur, ...patch }));

  const thisYear = new Date().getFullYear();
  const years = [thisYear, thisYear - 1, thisYear - 2, thisYear - 3];

  const save = () => onSave({ ...v, id: existing ? existing.id : newId() });

  const askDelete = () =>
    Alert.alert('Eliminare la visita?', 'Questa operazione non si può annullare.', [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Elimina', style: 'destructive', onPress: () => onDelete(existing.id) },
    ]);

  return (
    <View style={{ flex: 1 }}>
      <TopBar title={existing ? 'Modifica visita' : 'Nuova visita'} onBack={onBack} />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 + bottomInset }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[T.h2, { marginBottom: 14 }]}>{hive.name}</Text>

        <Section label="Data della visita">
          <DateField value={v.date} onChange={(date) => set({ date })} />
        </Section>

        <Section label="Regina">
          <Segmented options={QUEEN_OPTIONS} value={v.queen} onChange={(queen) => set({ queen })} />
        </Section>

        <Section label="Anno della regina" hint="Tocca l'anno, oppure usa − e + per un anno diverso">
          <View style={s.yearRow}>
            <Pressable onPress={() => set({ queenYear: (v.queenYear || thisYear) - 1 })} style={s.step}>
              <Text style={s.stepText}>−</Text>
            </Pressable>
            <Text style={s.year}>{v.queenYear ?? '—'}</Text>
            <Pressable
              onPress={() => set({ queenYear: Math.min(thisYear, (v.queenYear || thisYear - 1) + 1) })}
              style={s.step}
            >
              <Text style={s.stepText}>+</Text>
            </Pressable>
          </View>
          <Segmented
            options={[...years.map((y) => ({ value: y, label: String(y) })), { value: null, label: 'Non nota' }]}
            value={v.queenYear}
            onChange={(queenYear) => set({ queenYear })}
          />
        </Section>

        <Section label="Telaini occupati dalla famiglia" hint="Massimo 10">
          <FrameBoxes value={v.frames} onChange={(frames) => set({ frames })} />
        </Section>

        <Section label="Covata opercolata">
          <Segmented options={YESNO} value={v.broodCapped} onChange={(broodCapped) => set({ broodCapped })} />
        </Section>

        <Section label="Covata fresca" hint="Uova e larve giovani">
          <Segmented options={YESNO} value={v.broodFresh} onChange={(broodFresh) => set({ broodFresh })} />
        </Section>

        <Section label="Covata a fuco">
          <Segmented
            options={[
              { value: true, label: 'Presente', tone: 'warn' },
              { value: false, label: 'Assente', tone: 'ok' },
            ]}
            value={v.droneBrood}
            onChange={(droneBrood) => set({ droneBrood })}
          />
        </Section>

        <Section label="Telaini di scorte di miele" hint="Massimo 10">
          <FrameBoxes value={v.honeyFrames} onChange={(honeyFrames) => set({ honeyFrames })} color="#F0B83A" />
        </Section>

        <Section label="Scorta di polline">
          <Segmented options={POLLEN_OPTIONS} value={v.pollen} onChange={(pollen) => set({ pollen })} />
        </Section>

        <Section label="Tenuta al favo" hint="Quanto restano attaccate le api quando alzi il telaino">
          <Segmented options={GRIP_OPTIONS} value={v.grip} onChange={(grip) => set({ grip })} />
        </Section>

        <Section label="Presenza di varroa">
          <Segmented options={VARROA_OPTIONS} value={v.varroa} onChange={(varroa) => set({ varroa })} />
        </Section>

        <Section label="Note">
          <TextInput
            value={v.note}
            onChangeText={(note) => set({ note })}
            placeholder="Es. famiglia nervosa, serve un melario…"
            placeholderTextColor={C.inkSoft}
            multiline
            style={s.note}
          />
        </Section>

        {existing ? <Button title="Elimina visita" kind="danger" onPress={askDelete} /> : null}
      </ScrollView>

      <View style={[s.bar, { paddingBottom: 12 + bottomInset }]}>
        <Button title="Salva visita" onPress={save} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  yearRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  step: {
    width: 56,
    height: 56,
    borderRadius: R.md,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 28, fontWeight: '700', color: C.ink, marginTop: -2 },
  year: { flex: 1, textAlign: 'center', fontSize: 32, fontWeight: '900', color: C.ink, letterSpacing: -0.5 },
  note: {
    minHeight: 96,
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: R.md,
    backgroundColor: C.surface,
    padding: 14,
    fontSize: 16,
    color: C.ink,
    textAlignVertical: 'top',
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
});
