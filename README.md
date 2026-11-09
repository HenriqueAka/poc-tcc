# Telemetria PoC

Prova de conceito: cliente móvel em Expo para a telemetria ao vivo do TCC **ODB2 + MS41 Telemetry**. Faz login no backend do TCC e mostra RPM, velocidade e temperatura do motor em tempo real por WebSocket, reconectando sozinho quando o servidor cai.

- Pergunta, alternativas, fontes e erros da IA: [`PESQUISA.md`](PESQUISA.md)
- Critérios de aceitação: [`CRITERIOS.md`](CRITERIOS.md)
- Roteiro da apresentação: [`APRESENTACAO.md`](APRESENTACAO.md)

## Como rodar

1. Suba o backend do TCC com o simulador, aceitando conexões da rede (no repositório do TCC, pasta `telemetria-desktop`):

   ```bash
   docker compose up -d
   cd backend && alembic upgrade head
   python executar.py --sim --host 0.0.0.0
   ```

2. Descubra o IP do computador na rede (`ipconfig` no Windows) e crie uma conta pela interface web, se ainda não tiver.
3. Rode o app e leia o QR Code com o Expo Go:

   ```bash
   npm install
   npx expo start
   ```

4. No app, informe `IP:8000`, o e-mail e a senha.

Celular e computador precisam estar na mesma rede Wi-Fi. Se o firewall do Windows perguntar, libere o Python na rede privada.

## Estrutura

```
App.tsx                      alterna entre login e painel
lib/servidor.ts              login e leitura do token
hooks/useTelemetria.ts       WebSocket, reconexão e 1008
components/                  FormLogin, Painel, Leitura, IndicadorConexao
```
