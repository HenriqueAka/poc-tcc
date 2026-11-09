# Critérios de aceitação

Escritos antes da implementação. Backend do TCC rodando com
`python executar.py --sim --host 0.0.0.0` e o celular na mesma rede.

- [ ] 1. Com endereço, e-mail e senha corretos, ao tocar em **Entrar** o app mostra RPM, velocidade e temperatura do motor mudando a cada segundo, mais ou menos, e o indicador de conexão fica verde com "Conectado".
- [ ] 2. A tela mostra como o WebSocket foi autenticado ("Bearer" ou "cookie nativo") e o estado do leitor que o backend manda (CONECTADO, PROCURANDO...).
- [ ] 3. Com senha errada, o app mostra "e-mail ou senha incorretos" e não abre o painel.
- [ ] 4. Com endereço inexistente ou backend desligado, o app mostra uma mensagem de servidor inacessível em até 10 segundos, sem travar a tela.
- [ ] 5. Com o painel aberto, ao parar o backend (Ctrl+C) o indicador fica amarelo com "Reconectando" e os últimos valores ficam esmaecidos; ao subir o backend de novo, os valores voltam a mudar sozinhos, sem tocar em nada.
- [ ] 6. Quando o backend fecha o socket com 1008 (por exemplo, trocando a senha da conta pelo navegador, o que derruba os outros logins), em até 30 segundos o app volta para a tela de login com "Sessão expirada" e não fica tentando reconectar.

**Verificado em:** ( ) aparelho físico ( ) emulador
**Resultado:** ( ) passou ( ) reprovou
