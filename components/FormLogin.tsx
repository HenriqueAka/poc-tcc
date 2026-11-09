import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { entrar, ErroLogin, type Sessao } from '../lib/servidor';

type Props = {
  aviso: string | null;
  aoEntrar: (sessao: Sessao) => void;
};

export default function FormLogin({ aviso, aoEntrar }: Props) {
  const [endereco, setEndereco] = useState('192.168.0.10:8000');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    setErro(null);
    setEnviando(true);
    try {
      aoEntrar(await entrar(endereco, email, senha));
    } catch (e) {
      setErro(e instanceof ErroLogin ? e.message : 'Erro inesperado ao entrar.');
    } finally {
      setEnviando(false);
    }
  }

  const mensagem = erro ?? aviso;

  return (
    <View>
      <Text style={styles.titulo}>ODB2 + MS41 Telemetry</Text>
      <Text style={styles.subtitulo}>Telemetria ao vivo no celular</Text>

      <Text style={styles.rotulo}>Servidor (IP:porta)</Text>
      <TextInput
        style={styles.campo}
        value={endereco}
        onChangeText={setEndereco}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />
      <Text style={styles.rotulo}>E-mail</Text>
      <TextInput
        style={styles.campo}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />
      <Text style={styles.rotulo}>Senha</Text>
      <TextInput style={styles.campo} value={senha} onChangeText={setSenha} secureTextEntry />

      {mensagem ? <Text style={styles.erro}>{mensagem}</Text> : null}

      <Pressable style={[styles.botao, enviando && styles.botaoOcupado]} onPress={enviar} disabled={enviando}>
        {enviando ? <ActivityIndicator color="#111" /> : <Text style={styles.botaoTexto}>Entrar</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  titulo: { color: '#ffb547', fontSize: 26, fontWeight: '800' },
  subtitulo: { color: '#9aa3ad', fontSize: 15, marginBottom: 28 },
  rotulo: { color: '#9aa3ad', fontSize: 14, marginBottom: 6 },
  campo: {
    backgroundColor: '#1a1d23',
    color: '#f2f4f7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  erro: { color: '#ef5350', fontSize: 15, marginBottom: 16 },
  botao: { backgroundColor: '#ffb547', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  botaoOcupado: { opacity: 0.6 },
  botaoTexto: { color: '#111', fontSize: 17, fontWeight: '700' },
});
