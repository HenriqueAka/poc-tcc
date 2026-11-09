import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import FormLogin from './components/FormLogin';
import Painel from './components/Painel';
import { sair, type Sessao } from './lib/servidor';

export default function App() {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const entrar = useCallback((nova: Sessao) => {
    setAviso(null);
    setSessao(nova);
  }, []);

  const expirar = useCallback(() => {
    setSessao(null);
    setAviso('Sessão expirada. Entre de novo.');
  }, []);

  const deslogar = useCallback(() => {
    if (sessao) sair(sessao);
    setSessao(null);
  }, [sessao]);

  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        {sessao ? (
          <Painel sessao={sessao} aoSair={deslogar} aoExpirar={expirar} />
        ) : (
          <FormLogin aviso={aviso} aoEntrar={entrar} />
        )}
      </ScrollView>
      <StatusBar style="light" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#0f1115' },
  conteudo: { padding: 20, paddingTop: 64 },
});
