import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { C, T } from '../theme';
import { Card, Chip } from '../ui';
import { daysSince, formatDate, sortByDateDesc } from '../storage';
import { ageLabel, label, queenTone, varroaTone, visitsOf, VARROA_OPTIONS } from '../domain';

export default function HomeScreen({ state, onOpenHive }) {
  const lastByHive = state.hives.map((h) => visitsOf(state.visits, h.id)[0] || null);
  const recent = lastByHive.filter((v) => v && ageOf(v) <= 14).length;
  const lastTreatment = sortByDateDesc(state.treatments)[0];

  return (
    <ScrollView contentContainerStyle={s.content}>
      <Text style={T.title}>Il mio apiario</Text>
      <Text style={[T.soft, { marginTop: 4, marginBottom: 16 }]}>
        {state.hives.length} arnie · {recent} visitate negli ultimi 14 giorni
        {lastTreatment ? ` · ultimo trattamento ${formatDate(lastTreatment.date)}` : ''}
      </Text>

      <View style={s.grid}>
        {state.hives.map((hive, i) => {
          const v = lastByHive[i];
          const age = v ? ageOf(v) : null;
          return (
            <Card key={hive.id} onPress={() => onOpenHive(hive.id)} style={s.cell}>
              <View style={s.cellTop}>
                <Text style={s.num}>{hive.id}</Text>
                <View style={[s.dot, { backgroundColor: !v ? C.line : age > 21 ? C.warn : C.ok }]} />
              </View>
              <Text style={s.name} numberOfLines={1}>
                {hive.name}
              </Text>
              <Text style={T.soft}>{ageLabel(age)}</Text>
              <View style={s.chips}>
                {v ? (
                  <>
                    <Chip
                      label={v.queen === 'si' ? 'Regina' : v.queen === 'no' ? 'Senza regina' : 'Regina n.v.'}
                      tone={queenTone(v.queen)}
                    />
                    <Chip label={`${v.frames}/10 telaini`} tone="honey" />
                    {v.varroa > 0 ? (
                      <Chip label={`Varroa ${label(VARROA_OPTIONS, v.varroa).toLowerCase()}`} tone={varroaTone(v.varroa)} />
                    ) : null}
                  </>
                ) : (
                  <Chip label="Nessuna visita" />
                )}
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

function ageOf(v) {
  return daysSince(v.date);
}

const s = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { width: '48.4%', gap: 4, minHeight: 150 },
  cellTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  num: { fontSize: 34, fontWeight: '900', color: C.honeyDark, letterSpacing: -1 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  name: { fontSize: 16, fontWeight: '700', color: C.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
});
