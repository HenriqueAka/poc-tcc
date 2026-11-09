import { useEffect, useState } from 'react';
import type { Sessao } from '../lib/servidor';

export type EstadoConexao = 'conectando' | 'conectado' | 'reconectando' | 'expirada';

export type Amostra = {
  rpm: number;
  vss: number;
  ect: number;
  invalidos?: string[];
  gravando?: boolean;
};

export type Leitor = { estado: string; detalhe: string };

export type Telemetria = {
  estado: EstadoConexao;
  amostra: Amostra | null;
  leitor: Leitor | null;
  chegouEm: number | null;
  tentativas: number;
};

const SEM_LOGIN = 1008;
const ESPERA_MIN_MS = 1000;
const ESPERA_MAX_MS = 10000;

// O runtime do React Native aceita um 3º argumento com headers, mas o
// tsconfig do Expo carrega o lib DOM, cujo WebSocket só tem 2.
type WebSocketRN = new (
  url: string,
  protocolos: string | string[] | null,
  opcoes: { headers: Record<string, string> },
) => WebSocket;
const WebSocketComHeaders = WebSocket as unknown as WebSocketRN;

export function useTelemetria(sessao: Sessao): Telemetria {
  const [estado, setEstado] = useState<EstadoConexao>('conectando');
  const [amostra, setAmostra] = useState<Amostra | null>(null);
  const [leitor, setLeitor] = useState<Leitor | null>(null);
  const [chegouEm, setChegouEm] = useState<number | null>(null);
  const [tentativas, setTentativas] = useState(0);

  useEffect(() => {
    let vivo = true;
    let socket: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let falhas = 0;

    function conectar() {
      const headers: Record<string, string> = sessao.token
        ? { Authorization: `Bearer ${sessao.token}` }
        : {};
      socket = new WebSocketComHeaders(sessao.wsUrl, null, { headers });

      socket.onopen = () => {
        falhas = 0;
        setTentativas(0);
        setEstado('conectado');
      };

      socket.onmessage = (ev) => {
        const { tipo, dados } = JSON.parse(String(ev.data));
        if (tipo === 'amostra') {
          setAmostra(dados);
          setChegouEm(Date.now());
        } else if (tipo === 'leitor') {
          setLeitor(dados);
        }
      };

      socket.onclose = (ev) => {
        if (!vivo) return;
        if (ev.code === SEM_LOGIN) {
          setEstado('expirada');
          return;
        }
        falhas += 1;
        setTentativas(falhas);
        setEstado('reconectando');
        const espera = Math.min(ESPERA_MAX_MS, ESPERA_MIN_MS * 2 ** (falhas - 1));
        timer = setTimeout(conectar, espera);
      };

      socket.onerror = () => {
        socket?.close();
      };
    }

    conectar();
    return () => {
      vivo = false;
      clearTimeout(timer);
      socket?.close();
    };
  }, [sessao]);

  return { estado, amostra, leitor, chegouEm, tentativas };
}
