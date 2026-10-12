import React, { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { C, T } from '../theme';
import { Button, Card, Chip } from '../ui';
import { formatDate, receiptUri, sortByDateDesc } from '../storage';

export function ReceiptViewer({ name, onClose }) {
  const uri = receiptUri(name);
  return (
    <Modal visible={!!name} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.viewer}>
        {uri ? <Image source={{ uri }} style={s.viewerImg} resizeMode="contain" /> : null}
        <Pressable onPress={onClose} style={s.close}>
          <Text style={s.closeText}>Chiudi</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

export function hivesLabel(t, total) {
  if (t.allHives) return `Tutto l'apiario (${total} arnie)`;
  const ids = [...(t.hiveIds || [])].sort((a, b) => a - b);
  return `Arnie ${ids.join(', ')}`;
}

export default function TreatmentsScreen({ state, bottomInset, onAdd, onEdit }) {
  const [viewing, setViewing] = useState(null);
  const list = sortByDateDesc(state.treatments);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 + bottomInset, gap: 12 }}>
        <Text style={T.title}>Trattamenti varroa</Text>
        <Text style={[T.soft, { marginBottom: 4 }]}>
          Registro dei trattamenti con data, prodotto e scontrino.
        </Text>

        {list.length === 0 ? (
          <Card style={{ gap: 6 }}>
            <Text style={T.h2}>Nessun trattamento registrato</Text>
            <Text style={T.soft}>
              Aggiungi il primo con il pulsante in basso: puoi fotografare lo scontrino del prodotto.
            </Text>
          </Card>
        ) : null}

        {list.map((t) => {
          const uri = receiptUri(t.receipt);
          return (
            <Card key={t.id} onPress={() => onEdit(t.id)} style={s.row}>
              <View style={{ flex: 1, gap: 6, minWidth: 0 }}>
                <Text style={T.label}>{formatDate(t.date)}</Text>
                <Text style={T.h2} numberOfLines={2}>
                  {t.product}
                </Text>
                <View style={s.chips}>
                  <Chip label={hivesLabel(t, state.hives.length)} tone="honey" />
                  {!t.receipt ? <Chip label="Senza scontrino" tone="warn" /> : null}
                </View>
                {t.note ? (
                  <Text style={T.soft} numberOfLines={3}>
                    {t.note}
                  </Text>
                ) : null}
              </View>
              {uri ? (
                <Pressable onPress={() => setViewing(t.receipt)} style={s.thumbWrap}>
                  <Image source={{ uri }} style={s.thumb} />
                  <Text style={s.thumbCaption}>Scontrino</Text>
                </Pressable>
              ) : null}
            </Card>
          );
        })}
      </ScrollView>

      <View style={[s.bar, { paddingBottom: 12 + bottomInset }]}>
        <Button title="Registra trattamento" onPress={onAdd} />
      </View>
      <ReceiptViewer name={viewing} onClose={() => setViewing(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  thumbWrap: { alignItems: 'center', gap: 4 },
  thumb: { width: 76, height: 96, borderRadius: 8, backgroundColor: C.empty },
  thumbCaption: { fontSize: 11, fontWeight: '700', color: C.honeyDark },
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
  viewer: { flex: 1, backgroundColor: '#000000EE', justifyContent: 'center' },
  viewerImg: { width: '100%', height: '82%' },
  close: {
    position: 'absolute',
    top: 48,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  closeText: { fontWeight: '800', color: C.ink },
});
