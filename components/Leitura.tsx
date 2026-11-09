import { StyleSheet, Text, View } from 'react-native';

type Props = {
  rotulo: string;
  valor: number | null;
  unidade: string;
  esmaecido: boolean;
  semResposta?: boolean;
  destaque?: boolean;
};

export default function Leitura({ rotulo, valor, unidade, esmaecido, semResposta, destaque }: Props) {
  const texto = valor === null || semResposta ? '--' : String(Math.round(valor));
  return (
    <View style={[styles.card, esmaecido && styles.esmaecido]}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={[styles.valor, destaque && styles.valorDestaque]}>
        {texto}
        {unidade ? <Text style={styles.unidade}> {unidade}</Text> : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1d23',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  esmaecido: { opacity: 0.35 },
  rotulo: { color: '#9aa3ad', fontSize: 14, marginBottom: 4 },
  valor: { color: '#f2f4f7', fontSize: 36, fontWeight: '700', fontVariant: ['tabular-nums'] },
  valorDestaque: { color: '#ffb547', fontSize: 64 },
  unidade: { color: '#9aa3ad', fontSize: 18, fontWeight: '400' },
});
