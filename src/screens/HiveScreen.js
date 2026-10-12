import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { C, R, T } from '../theme';
import { Button, Card, Chip, TopBar } from '../ui';
import { formatDate } from '../storage';
import {
  ageLabel,
  GRIP_OPTIONS,
  label,
  lastQueenYear,
  POLLEN_OPTIONS,
  queenTone,
  varroaTone,
  VARROA_OPTIONS,
  visitAge,
  visitsOf,
} from '../domain';

export default function HiveScreen({ state, hiveId, bottomInset, onBack, onNewVisit, onEditVisit, onRename }) {
  const hive = state.hives.find((h) => h.id === hiveId);
  const visits = visitsOf(state.visits, hiveId);
  const last = visits[0] || null;
  const queenYear = lastQueenYear(visits);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(hive.name);

  const treated = state.treatments
    .filter((t) => t.allHives || (t.hiveIds || []).includes(hiveId))
    .sort((a, b) => (a.date < b.date ? 1 : -1))[0];

  return (
    <View style={{ flex: 1 }}>
      <TopBar
        title={hive.name}
        onBack={onBack}
        right={
          <Pressable
            onPress={() => {
              setDraft(hive.name);
              setRenaming(true);
            }}
            hitSlop={10}
          >
            <Text style={{ color: C.honeyDark, fontWeight: '800', fontSize: 15 }}>Rinomina</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 + bottomInset, gap: 14 }}>
        <Card style={{ gap: 10 }}>
          <Text style={T.label}>Stato attuale · {ageLabel(visitAge(last))}</Text>
          {last ? (
            <>
              <View style={s.rowWrap}>
                <Chip
                  label={last.queen === 'si' ? 'Regina presente' : last.queen === 'no' ? 'Regina assente' : 'Regina non vista'}
                  tone={queenTone(last.queen)}
                />
                <Chip label={queenYear ? `Regina del ${queenYear}` : 'Anno regina non noto'} tone="neutral" />
                <Chip label={`Varroa: ${label(VARROA_OPTIONS, last.varroa).toLowerCase()}`} tone={varroaTone(last.varroa)} />
              </View>
              <View style={s.stats}>
                <Stat value={`${last.frames}`} unit="/10" caption="telaini di api" />
                <Stat value={`${last.honeyFrames}`} unit="/10" caption="telaini di miele" />
                <Stat value={label(POLLEN_OPTIONS, last.pollen)} caption="polline" small />
              </View>
            </>
          ) : (
            <Text style={T.soft}>Ancora nessuna visita registrata per questa arnia.</Text>
          )}
          <Text style={T.soft}>
            {treated ? `Ultimo trattamento varroa: ${formatDate(treated.date)}` : 'Nessun trattamento varroa registrato'}
          </Text>
        </Card>

        <Text style={[T.label, { marginTop: 6 }]}>Storico visite ({visits.length})</Text>
        {visits.map((v) => (
          <Card key={v.id} onPress={() => onEditVisit(v.id)} style={{ gap: 8 }}>
            <View style={s.between}>
              <Text style={T.h2}>{formatDate(v.date)}</Text>
              <Text style={{ color: C.honeyDark, fontWeight: '700' }}>Modifica</Text>
            </View>
            <View style={s.rowWrap}>
              <Chip label={v.queen === 'si' ? 'Regina' : v.queen === 'no' ? 'Senza regina' : 'Regina n.v.'} tone={queenTone(v.queen)} />
              {v.queenYear ? <Chip label={`Anno ${v.queenYear}`} /> : null}
              <Chip label={`${v.frames}/10 telaini`} tone="honey" />
              <Chip label={`Miele ${v.honeyFrames}`} tone="honey" />
              <Chip label={`Polline ${label(POLLEN_OPTIONS, v.pollen).toLowerCase()}`} />
              <Chip label={`Favo ${label(GRIP_OPTIONS, v.grip).toLowerCase()}`} />
              <Chip label={v.broodCapped ? 'Covata opercolata' : 'No covata opercolata'} tone={v.broodCapped ? 'ok' : 'warn'} />
              <Chip label={v.broodFresh ? 'Covata fresca' : 'No covata fresca'} tone={v.broodFresh ? 'ok' : 'warn'} />
              {v.droneBrood ? <Chip label="Covata a fuco" tone="warn" /> : null}
              <Chip label={`Varroa ${label(VARROA_OPTIONS, v.varroa).toLowerCase()}`} tone={varroaTone(v.varroa)} />
            </View>
            {v.note ? <Text style={T.soft}>{v.note}</Text> : null}
          </Card>
        ))}
      </ScrollView>

      <View style={[s.bar, { paddingBottom: 12 + bottomInset }]}>
        <Button title="Nuova visita di controllo" onPress={onNewVisit} />
      </View>

      <Modal visible={renaming} transparent animationType="fade" onRequestClose={() => setRenaming(false)}>
        <View style={s.overlay}>
          <View style={s.dialog}>
            <Text style={T.h2}>Nome dell'arnia</Text>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              style={s.input}
              maxLength={30}
              autoFocus
              selectTextOnFocus
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button title="Annulla" kind="ghost" style={{ flex: 1 }} onPress={() => setRenaming(false)} />
              <Button
                title="Salva"
                style={{ flex: 1 }}
                onPress={() => {
                  const name = draft.trim();
                  if (name) onRename(hiveId, name);
                  setRenaming(false);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Stat({ value, unit, caption, small }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: small ? 20 : 30, fontWeight: '900', color: C.ink, letterSpacing: -0.5 }}>
        {value}
        {unit ? <Text style={{ fontSize: 15, color: C.inkSoft, fontWeight: '700' }}>{unit}</Text> : null}
      </Text>
      <Text style={T.soft}>{caption}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stats: { flexDirection: 'row', gap: 10, marginVertical: 4, alignItems: 'flex-end' },
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
  overlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'center', padding: 24 },
  dialog: { backgroundColor: C.surface, borderRadius: R.lg, padding: 18, gap: 14 },
  input: {
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: R.md,
    paddingHorizontal: 14,
    fontSize: 17,
    color: C.ink,
  },
});
