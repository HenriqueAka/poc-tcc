# Diário de pesquisa

## Contexto do TCC
O ODB2 + MS41 Telemetry é um sistema embarcado de baixo custo que lê parâmetros do motor (ESP32 conectado por BLE à central) e os transmite em tempo real. Um backend em FastAPI, com login e PostgreSQL, grava as sessões e empurra as leituras para a interface por WebSocket.

## Pergunta de pesquisa
Como o `WebSocket` nativo do React Native, usado num app Expo, consome a telemetria do backend do TCC, que exige login, e mostra RPM, velocidade e temperatura em tempo real, mesmo quando a conexão com o servidor cai?

**Trilha:** consumo de API (o TCC não tem app móvel; a prova de conceito é um cliente mínimo para o sistema).

## Alternativas consideradas
| Opção | Serve para | Funciona no Expo Go | Decisão |
|---|---|---|---|
| `WebSocket` nativo do React Native | Fluxo contínuo do servidor para o app | Sim, já vem no React Native | **Sim.** O backend já fala WebSocket puro em `/ws`, e o runtime aceita headers no 3º argumento, o que resolve o login. |
| `fetch` repetido em intervalo (polling) | Buscar dados de tempos em tempos | Sim | Não. O backend não expõe a amostra atual por REST, e polling a cada segundo gasta bateria e chega atrasado. |
| `socket.io-client` | Socket.IO | Sim (JS puro) | Não. O backend não usa o protocolo Socket.IO; não conversaria com `/ws`. |
| `@tanstack/react-query` | Cache de requisições REST | Sim (JS puro) | Não para o ao vivo. Serve para as telas de histórico do TCC 2, não para streaming. |
| `expo-secure-store` | Guardar o token no aparelho | Sim | Fora do escopo agora; entra nos próximos passos para não pedir login a cada abertura. |

## Como funciona
1. O app manda `POST /api/auth/login` com e-mail e senha.
2. O backend responde com o cookie `telemetria_sessao` (httpOnly). O app lê o token do cabeçalho `Set-Cookie`.
3. O app abre `ws://IP:8000/ws` passando `Authorization: Bearer <token>` no 3º argumento do `WebSocket`. Se o token não puder ser lido, o app conta com o cookie que o sistema guardou (Android e iOS mandam o cookie no WebSocket).
4. O backend manda o estado do leitor e depois uma `amostra` por segundo, aproximadamente.
5. Se a conexão cai, o hook `useTelemetria` tenta de novo com espera crescente (1 s, 2 s, 4 s... até 10 s). Se o backend fecha com **1008** (token inválido), o app não insiste e volta ao login.

## Fontes oficiais lidas
- React Native, *Networking* (https://reactnative.dev/docs/network): mostra `new WebSocket(url)` sem headers; avisa que autenticação por cookie "é instável" no `fetch`; Android bloqueia HTTP sem TLS a partir da API 28 e iOS exige ATS.
- Código-fonte do `react-native@0.88.1` (instalado pelo SDK 58):
  - `Libraries/WebSocket/WebSocket.js`: o construtor é `(url, protocols, options)` e lê `options.headers`.
  - `ReactAndroid/.../websocket/WebSocketModule.kt`: no Android, adiciona o cookie guardado e os headers passados.
  - `React/CoreModules/RCTWebSocketModule.mm`: no iOS, carrega os cookies do `NSHTTPCookieStorage`, o mesmo do `fetch`.
- Expo, *expo-build-properties* SDK 58 (https://docs.expo.dev/versions/v58.0.0/sdk/build-properties): `android.usesCleartextTraffic` vem `false` a partir do Android 9; é como liberar HTTP numa development build.
- Expo, *Development builds FAQ* (https://docs.expo.dev/develop/development-builds/faq/): o Expo Go só tem os módulos nativos que já vêm nele.
- Expo, *Using MCP with Expo* (https://docs.expo.dev/eas/ai/mcp): servidor em `https://mcp.expo.dev/mcp`.
- Código do backend do TCC: `telemetria-desktop/backend/telemetria/rotas/websocket.py` e `rotas/auth.py` (formato das mensagens, cookie, Bearer e 1008).

## Onde a IA errou

### 1. Tirar uma conversão de tipo que era necessária
- Pedido: escrever o hook que abre o WebSocket com o header `Authorization`.
- O que veio: a IA leu a declaração de tipos do React Native (`src/types/globals.d.ts`), viu que o construtor aceita `options.headers` e removeu a conversão de tipo do código, dizendo que ela era desnecessária.
- Como percebi: `npx tsc --noEmit` falhou com *Expected 1-2 arguments, but got 3*.
- O certo: o runtime aceita o 3º argumento, mas o `tsconfig` base do Expo carrega `"lib": ["DOM", "ESNext"]`, e o `WebSocket` do DOM só tem 2. A conversão de tipo precisa ficar, com um comentário explicando o porquê.

### 2. Documentação não oficial tratada como se fosse a oficial
- Pedido: confirmar se o `WebSocket` do React Native aceita headers.
- O que veio: a busca trouxe uma página de um site de documentação gerada automaticamente (mintlify.com) afirmando que o construtor aceita `options.headers`, como se fosse a documentação do React Native.
- Como percebi: a página oficial (reactnative.dev/docs/network) só mostra `new WebSocket(url)`, sem headers.
- O certo: a informação estava correta, mas só ficou confirmada lendo o código-fonte do `react-native` instalado no projeto. Recurso que só existe no código e não na documentação pode mudar sem aviso.

### 3. Divergência entre a apostila e a documentação do Expo
- Pedido: configurar o servidor MCP do Expo seguindo a apostila.
- O que veio: a apostila diz que o MCP "exige apenas uma conta Expo gratuita".
- Como percebi: a página oficial diz duas vezes que o Expo MCP Server exige um plano pago do EAS.
- O certo: vale a documentação oficial: o Expo MCP Server exige plano pago do EAS. Não deu para conectar o MCP no PC da faculdade, porque nem o login do Expo pelo CLI funcionou lá (ver "No aparelho").

### 4. [Erro do Copilot no meu teste]
- Pedido: [o que pedi ao Copilot em modo Agent]
- O que veio: [a resposta errada]
- Como percebi: [erro de compilação, documentação, teste no aparelho]
- O certo: [o que a documentação confirma]

## Resultado e próximos passos no TCC

**Testado contra o backend real do TCC** (`executar.py --sim`, PostgreSQL 16), usando o mesmo `lib/servidor.ts` do app, num script Node:

| Teste | Resultado |
|---|---|
| Login devolve o token lido do `Set-Cookie` | passou (modo Bearer) |
| WebSocket com Bearer recebe o estado do leitor e as amostras | passou (CONECTADO, cerca de 1 amostra/s) |
| Amostra traz `rpm`, `vss`, `ect` e `invalidos` | passou |
| Senha errada mostra "e-mail ou senha incorretos" | passou |
| Servidor inacessível dá erro em até 10 s | passou |
| Token inválido no handshake fecha com 1008 | passou |
| Trocar a senha por outro login fecha o socket aberto com 1008 | passou, em 30 s (o intervalo da vigia do backend) |
| Backend reiniciado aceita o mesmo token | passou (os tokens ficam no banco, então reconectar funciona) |

**No aparelho:** [preencher com o resultado do `CRITERIOS.md`]

**O que muda no TCC:**
- O backend já serve para um app móvel sem nenhuma mudança: o `Bearer` aceito no `/ws` resolve o login fora do navegador.
- Para rodar no celular, o backend precisa subir com `--host 0.0.0.0` (o padrão `127.0.0.1` só aceita a própria máquina).
- Uma development build vai exigir `usesCleartextTraffic` (ou HTTPS) no Android, já que o backend roda em HTTP na rede local.
- Próximos passos: guardar o token com `expo-secure-store`, descobrir o IP do backend sem digitar e levar as telas de histórico para o app no TCC 2.
