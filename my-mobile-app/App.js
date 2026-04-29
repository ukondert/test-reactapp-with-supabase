import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StatusMessage } from '@shared/ui';
import { getHealthStatus } from './src/api/healthApi';

export default function App() {
  const [statusText, setStatusText] = useState('Verbindung wird geprueft...');
  const [statusTone, setStatusTone] = useState('info');

  useEffect(() => {
    const runHealthCheck = async () => {
      try {
        const result = await getHealthStatus();
        setStatusText(`API erreichbar (HTTP ${result.statusCode})`);
        setStatusTone('success');
      } catch (error) {
        setStatusText(`Fehler: ${error.message}`);
        setStatusTone('error');
      }
    };

    runHealthCheck();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Text style={styles.title}>Digital School Library Mobile</Text>
        <StatusMessage text={statusText} tone={statusTone} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
});
