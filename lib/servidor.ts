export type ModoAuth = 'bearer' | 'cookie';

export type Sessao = {
  base: string;
  wsUrl: string;
  token: string | null;
  modo: ModoAuth;
  nome: string;
};

export class ErroLogin extends Error {}

const COOKIE = 'telemetria_sessao';
const TEMPO_LIMITE_MS = 8000;

export function normalizarEndereco(texto: string): string {
  let base = texto.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(base)) base = `http://${base}`;
  return base;
}

export function paraWs(base: string): string {
  return `${base.replace(/^http/i, 'ws')}/ws`;
}

function tokenDoSetCookie(cabecalho: string | null): string | null {
  if (!cabecalho) return null;
  const achado = cabecalho.match(new RegExp(`${COOKIE}=([^;,\\s]+)`));
  return achado ? achado[1] : null;
}

export async function entrar(endereco: string, email: string, senha: string): Promise<Sessao> {
  const base = normalizarEndereco(endereco);
  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

  let resposta: Response;
  try {
    resposta = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), senha }),
      signal: controle.signal,
    });
  } catch {
    throw new ErroLogin(`Servidor inacessível em ${base}. Confira o IP, a porta e se o backend subiu com --host 0.0.0.0.`);
  } finally {
    clearTimeout(limite);
  }

  if (resposta.status === 401 || resposta.status === 422) {
    throw new ErroLogin('e-mail ou senha incorretos');
  }
  if (!resposta.ok) {
    throw new ErroLogin(`O servidor respondeu ${resposta.status}.`);
  }

  const usuario = await resposta.json();
  const token = tokenDoSetCookie(resposta.headers.get('set-cookie'));

  return {
    base,
    wsUrl: paraWs(base),
    token,
    modo: token ? 'bearer' : 'cookie',
    nome: usuario?.nome ?? email,
  };
}

export async function sair(sessao: Sessao): Promise<void> {
  try {
    await fetch(`${sessao.base}/api/auth/logout`, {
      method: 'POST',
      headers: sessao.token ? { Authorization: `Bearer ${sessao.token}` } : undefined,
    });
  } catch {
    // sair localmente já basta
  }
}
