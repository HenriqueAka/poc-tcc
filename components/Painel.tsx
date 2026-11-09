import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTelemetria } from '../hooks/useTelemetria';
import type { Sessao } from '../lib/servidor';
import IndicadorConexao from './IndicadorConexao';
import Leitura from './Leitura';

type Props = {
  sessao: Sessao;
  aoSair: () => void;
  aoExpirar: () => void;
};

const MODO_TEXTO = { bearer: 'Bearer (token lido do Set-Cookie)', cookie: 'cookie nativo do sistema' };

export default function Painel({ sessao, aoSair, aoExpirar }: Props) {
  const { estado, amostra, leitor, chegouEm, tentativas } = useTelemetria(sessao);
  const [agora, setAgora] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (estado === 'expirada') aoExpirar();
  }, [estado, aoExpirar]);

  const esmaecido = estado !== 'conectado';
  const invalidos = amostra?.invalidos ?? [];
  const idadeS = chegouEm ? Math.max(0, Math.round((agora - chegouEm) / 1000)) : null;

  return (
    <View>
      <View style={styles.topo}>
        <IndicadorConexao estado={estado} tentativas={tentativas} />
        <Pressable onPress={aoSair} hitSlop={12}>
          <Text style={styles.sair}>Sair</Text>
        </Pressable>
      </View>

      <Text style={styles.info}>Olá, {sessao.nome}</Text>
      <Text style={styles.info}>Autenticação do WebSocket: {MODO_TEXTO[sessao.modo]}</Text>
      <Text style={styles.info}>
        Leitor: {leitor ? `${leitor.estado}${leitor.detalhe ? ` (${leitor.detalhe})` : ''}` : 'aguardando'}
      </Text>
      <Text style={[styles.info, styles.ultimaInfo]}>
        Última amostra: {idadeS === null ? 'nenhuma ainda' : `há ${idadeS} s`}
      </Text>

      <Leitura rotulo="Rotação" valor={amostra?.rpm ?? null} unidade="rpm" esmaecido={esmaecido} semResposta={invalidos.includes('rpm')} destaque />
      <Leitura rotulo="Velocidade" valor={amostra?.vss ?? null} unidade="km/h" esmaecido={esmaecido} semResposta={invalidos.includes('vss')} />
      <Leitura rotulo="Temperatura do motor" valor={amostra?.ect ?? null} unidade="°C" esmaecido={esmaecido} semResposta={invalidos.includes('ect')} />
    </View>
  );
}

const styles = StyleSheet.create({
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sair: { color: '#ffb547', fontSize: 16, fontWeight: '600' },
  info: { color: '#9aa3ad', fontSize: 13, marginBottom: 2 },
  ultimaInfo: { marginBottom: 16 },
});
