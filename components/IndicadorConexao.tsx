import { StyleSheet, Text, View } from 'react-native';
import type { EstadoConexao } from '../hooks/useTelemetria';

const VISUAL: Record<EstadoConexao, { cor: string; texto: string }> = {
  conectando: { cor: '#9aa3ad', texto: 'Conectando' },
  conectado: { cor: '#3ecf6e', texto: 'Conectado' },
  reconectando: { cor: '#f5c542', texto: 'Reconectando' },
  expirada: { cor: '#ef5350', texto: 'Sessão expirada' },
};

type Props = { estado: EstadoConexao; tentativas: number };

export default function IndicadorConexao({ estado, tentativas }: Props) {
  const { cor, texto } = VISUAL[estado];
  return (
    <View style={styles.linha}>
      <View style={[styles.bolinha, { backgroundColor: cor }]} />
      <Text style={styles.texto}>
        {texto}
        {estado === 'reconectando' ? ` (tentativa ${tentativas})` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center' },
  bolinha: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  texto: { color: '#f2f4f7', fontSize: 16, fontWeight: '600' },
});
