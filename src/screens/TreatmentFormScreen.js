import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { C, R, T } from '../theme';
import { Button, DateField, Section, Segmented, TopBar } from '../ui';
import { deleteReceiptPhoto, newId, receiptUri, saveReceiptPhoto, toISODate } from '../storage';
import { ReceiptViewer } from './TreatmentsScreen';

const SUGGESTIONS = ['Apivar', 'Api-Bioxal', 'Apiguard', 'Thymovar', 'MAQS', 'Acido formico'];

export default function TreatmentFormScreen({ state, treatmentId, bottomInset, onBack, onSave, onDelete }) {
  const existing = treatmentId ? state.treatments.find((t) => t.id === treatmentId) : null;
  const [t, setT] = useState(() =>
    existing
      ? { ...existing, hiveIds: [...(existing.hiveIds || [])] }
      : {
          date: toISODate(new Date()),
          product: '',
          allHives: true,
          hiveIds: [],
          note: '',
          receipt: null,
        }
  );
  const set = (patch) => setT((cur) => ({ ...cur, ...patch }));
  const [busy, setBusy] = useState(false);
  const [zoom, setZoom] = useState(null);

  // Foto scattate in questa sessione: se si esce senza salvare vengono cancellate.
  const fresh = useRef([]);
  const saved = useRef(false);
  useEffect(
    () => () => {
      if (!saved.current) fresh.current.forEach(deleteReceiptPhoto);
    },
    []
  );

  const pick = async (fromCamera) => {
    try {
      if (fromCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permesso necessario', 'Consenti l\'accesso alla fotocamera per fotografare lo scontrino.');
          return;
        }
      }
      const res = fromCamera
        ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
      if (res.canceled || !res.assets?.length) return;
      setBusy(true);
      const name = await saveReceiptPhoto(res.assets[0].uri);
      fresh.current.push(name);
      set({ receipt: name });
    } catch (e) {
      Alert.alert('Foto non salvata', 'Non è stato possibile salvare la foto. Riprova.');
    } finally {
      setBusy(false);
    }
  };

  const toggleHive = (id) =>
    set({ hiveIds: t.hiveIds.includes(id) ? t.hiveIds.filter((x) => x !== id) : [...t.hiveIds, id] });

  const canSave = t.product.trim().length > 0 && (t.allHives || t.hiveIds.length > 0);

  const save = () => {
    if (!canSave) return;
    fresh.current.filter((n) => n !== t.receipt).forEach(deleteReceiptPhoto);
    if (existing && existing.receipt && existing.receipt !== t.receipt) deleteReceiptPhoto(existing.receipt);
    saved.current = true;
    onSave({ ...t, product: t.product.trim(), id: existing ? existing.id : newId() });
  };

  const askDelete = () =>
    Alert.alert('Eliminare il trattamento?', 'Verrà eliminata anche la foto dello scontrino.', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Elimina',
        style: 'destructive',
        onPress: () => {
          saved.current = true;
          fresh.current.forEach(deleteReceiptPhoto);
          onDelete(existing.id);
        },
      },
    ]);

  const uri = receiptUri(t.receipt);

  return (
    <View style={{ flex: 1 }}>
      <TopBar title={existing ? 'Modifica trattamento' : 'Nuovo trattamento'} onBack={onBack} />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 + bottomInset }}
        keyboardShouldPersistTaps="handled"
      >
        <Section label="Data del trattamento">
          <DateField value={t.date} onChange={(date) => set({ date })} />
        </Section>

        <Section label="Prodotto utilizzato">
          <TextInput
            value={t.product}
            onChangeText={(product) => set({ product })}
            placeholder="Nome del prodotto"
            placeholderTextColor={C.inkSoft}
            style={s.input}
          />
          <View style={s.chips}>
            {SUGGESTIONS.map((p) => (
              <Pressable key={p} onPress={() => set({ product: p })} style={s.suggest}>
                <Text style={s.suggestText}>{p}</Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section label="Arnie trattate">
          <Segmented
            options={[
              { value: true, label: "Tutto l'apiario" },
              { value: false, label: 'Solo alcune arnie' },
            ]}
            value={t.allHives}
            onChange={(allHives) => set({ allHives })}
          />
          {!t.allHives ? (
            <View style={s.hiveGrid}>
              {state.hives.map((h) => {
                const on = t.hiveIds.includes(h.id);
                return (
                  <Pressable
                    key={h.id}
                    onPress={() => toggleHive(h.id)}
                    style={[s.hiveBtn, { backgroundColor: on ? C.honey : C.surface, borderColor: on ? C.honey : C.line }]}
                  >
                    <Text style={[s.hiveNum, { color: C.ink }]}>{h.id}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </Section>

        <Section label="Scontrino del prodotto" hint="Fotografalo o scegli una foto dalla galleria">
          {uri ? (
            <View style={s.receiptBox}>
              <Pressable onPress={() => setZoom(t.receipt)}>
                <Image source={{ uri }} style={s.receiptImg} resizeMode="cover" />
              </Pressable>
              <View style={{ flex: 1, gap: 10 }}>
                <Button title="Ingrandisci" kind="ghost" onPress={() => setZoom(t.receipt)} />
                <Button title="Rimuovi foto" kind="danger" onPress={() => set({ receipt: null })} />
              </View>
            </View>
          ) : null}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button
              title={busy ? 'Salvo…' : uri ? 'Rifai foto' : 'Scatta foto'}
              kind="dark"
              style={{ flex: 1 }}
              disabled={busy}
              onPress={() => pick(true)}
            />
            <Button title="Galleria" kind="ghost" style={{ flex: 1 }} disabled={busy} onPress={() => pick(false)} />
          </View>
        </Section>

        <Section label="Note" hint="Dose, durata, data di rimozione delle strisce…">
          <TextInput
            value={t.note}
            onChangeText={(note) => set({ note })}
            placeholder="Facoltativo"
            placeholderTextColor={C.inkSoft}
            multiline
            style={[s.input, { minHeight: 96, textAlignVertical: 'top', paddingTop: 14 }]}
          />
        </Section>

        {existing ? <Button title="Elimina trattamento" kind="danger" onPress={askDelete} /> : null}
      </ScrollView>

      <View style={[s.bar, { paddingBottom: 12 + bottomInset }]}>
        {!canSave ? (
          <Text style={[T.soft, { marginBottom: 8, textAlign: 'center' }]}>
            {t.product.trim() ? 'Scegli almeno un\'arnia trattata' : 'Scrivi il nome del prodotto per salvare'}
          </Text>
        ) : null}
        <Button title="Salva trattamento" onPress={save} disabled={!canSave} />
      </View>
      <ReceiptViewer name={zoom} onClose={() => setZoom(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  input: {
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: R.md,
    backgroundColor: C.surface,
    paddingHorizontal: 14,
    fontSize: 16,
    color: C.ink,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggest: { borderRadius: 999, borderWidth: 1.5, borderColor: C.line, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: C.surface },
  suggestText: { fontWeight: '700', color: C.ink },
  hiveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hiveBtn: {
    width: '14.6%',
    height: 52,
    borderRadius: R.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiveNum: { fontSize: 16, fontWeight: '800' },
  receiptBox: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  receiptImg: { width: 120, height: 160, borderRadius: R.sm, backgroundColor: C.empty },
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
