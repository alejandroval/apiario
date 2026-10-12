import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from './src/theme';
import { deleteReceiptPhoto, loadState, saveState } from './src/storage';
import HomeScreen from './src/screens/HomeScreen';
import HiveScreen from './src/screens/HiveScreen';
import VisitFormScreen from './src/screens/VisitFormScreen';
import TreatmentsScreen from './src/screens/TreatmentsScreen';
import TreatmentFormScreen from './src/screens/TreatmentFormScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Root />
    </SafeAreaProvider>
  );
}

function Root() {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState(null);
  const [tab, setTab] = useState('home');
  const [stack, setStack] = useState([]); // schermate sopra la tab corrente
  const stackRef = useRef(stack);
  stackRef.current = stack;

  useEffect(() => {
    loadState().then(setState);
  }, []);

  const commit = useCallback((next) => {
    setState(next);
    saveState(next).catch(() =>
      Alert.alert('Salvataggio non riuscito', 'I dati non sono stati salvati. Controlla lo spazio sul telefono.')
    );
  }, []);

  const push = (screen) => setStack((s) => [...s, screen]);
  const pop = useCallback(() => setStack((s) => s.slice(0, -1)), []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stackRef.current.length > 0) {
        pop();
        return true;
      }
      if (tab !== 'home') {
        setTab('home');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [tab, pop]);

  if (!state) {
    return (
      <View style={[s.center, { backgroundColor: C.bg }]}>
        <ActivityIndicator size="large" color={C.honey} />
      </View>
    );
  }

  const top = stack[stack.length - 1];
  const bottomInset = insets.bottom;

  const saveVisit = (visit) => {
    const exists = state.visits.some((v) => v.id === visit.id);
    commit({
      ...state,
      visits: exists ? state.visits.map((v) => (v.id === visit.id ? visit : v)) : [...state.visits, visit],
    });
    pop();
  };
  const deleteVisit = (id) => {
    commit({ ...state, visits: state.visits.filter((v) => v.id !== id) });
    pop();
  };
  const saveTreatment = (t) => {
    const exists = state.treatments.some((x) => x.id === t.id);
    commit({
      ...state,
      treatments: exists ? state.treatments.map((x) => (x.id === t.id ? t : x)) : [...state.treatments, t],
    });
    pop();
  };
  const deleteTreatment = (id) => {
    const gone = state.treatments.find((x) => x.id === id);
    if (gone?.receipt) deleteReceiptPhoto(gone.receipt);
    commit({ ...state, treatments: state.treatments.filter((x) => x.id !== id) });
    pop();
  };
  const renameHive = (id, name) =>
    commit({ ...state, hives: state.hives.map((h) => (h.id === id ? { ...h, name } : h)) });

  let body;
  let showTabs = false;
  if (top?.name === 'hive') {
    body = (
      <HiveScreen
        state={state}
        hiveId={top.hiveId}
        bottomInset={bottomInset}
        onBack={pop}
        onNewVisit={() => push({ name: 'visit', hiveId: top.hiveId })}
        onEditVisit={(visitId) => push({ name: 'visit', hiveId: top.hiveId, visitId })}
        onRename={renameHive}
      />
    );
  } else if (top?.name === 'visit') {
    body = (
      <VisitFormScreen
        key={top.visitId || 'new'}
        state={state}
        hiveId={top.hiveId}
        visitId={top.visitId}
        bottomInset={bottomInset}
        onBack={pop}
        onSave={saveVisit}
        onDelete={deleteVisit}
      />
    );
  } else if (top?.name === 'treatment') {
    body = (
      <TreatmentFormScreen
        key={top.treatmentId || 'new'}
        state={state}
        treatmentId={top.treatmentId}
        bottomInset={bottomInset}
        onBack={pop}
        onSave={saveTreatment}
        onDelete={deleteTreatment}
      />
    );
  } else {
    showTabs = true;
    body =
      tab === 'home' ? (
        <HomeScreen state={state} onOpenHive={(hiveId) => push({ name: 'hive', hiveId })} />
      ) : (
        <TreatmentsScreen
          state={state}
          bottomInset={bottomInset + TAB_HEIGHT}
          onAdd={() => push({ name: 'treatment' })}
          onEdit={(treatmentId) => push({ name: 'treatment', treatmentId })}
        />
      );
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={{ flex: 1 }}>{body}</View>
      {showTabs ? (
        <View style={[s.tabs, { paddingBottom: bottomInset }]}>
          <Tab label="Arnie" active={tab === 'home'} onPress={() => setTab('home')} />
          <Tab label="Trattamenti" active={tab === 'treat'} onPress={() => setTab('treat')} />
        </View>
      ) : null}
    </View>
  );
}

const TAB_HEIGHT = 58;

function Tab({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={s.tab}>
      <View style={[s.tabBar, { backgroundColor: active ? C.honey : 'transparent' }]} />
      <Text style={[s.tabText, { color: active ? C.ink : C.inkSoft }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.line },
  tab: { flex: 1, height: TAB_HEIGHT, alignItems: 'center', justifyContent: 'center', gap: 6 },
  tabBar: { width: 36, height: 4, borderRadius: 2 },
  tabText: { fontSize: 15, fontWeight: '800' },
});
