# WhatsApp API

API REST para envio e recebimento de mensagens no WhatsApp usando [whatsapp-web.js](https://wwebjs.dev/).

## Pré-requisitos

- Node.js 18+
- Google Chrome ou Chromium instalado (usado pelo Puppeteer)

## Instalação

```bash
git clone <seu-repositorio>
cd whatsapp-api
npm install

# Copie e edite as variáveis de ambiente
cp .env.example .env
```

Edite `.env` com sua chave de API e, opcionalmente, a URL do seu webhook.

## Uso

```bash
# Produção
npm start

# Desenvolvimento (hot-reload)
npm run dev
```

Acesse `http://localhost:3000/api/qr` no navegador para escanear o QR Code com seu WhatsApp.
Após escanear, a sessão fica salva na pasta `sessions/` — você não precisará escanear novamente.

---

## Endpoints

Todos os endpoints `/api/*` exigem o header:

```
x-api-key: <valor definido no .env>
```

### `GET /health`
Verifica se o servidor está no ar. Não exige autenticação.

**Resposta:**
```json
{ "ok": true, "uptime": 42.5 }
```

---

### `GET /api/status`
Retorna o estado atual da conexão com o WhatsApp.

**Resposta:**
```json
{
  "status": "connected",
  "info": { "wid": { "user": "5511999999999" }, "pushname": "Seu Nome" }
}
```

Valores possíveis de `status`: `disconnected` | `qr_ready` | `connected`

---

### `GET /api/qr`
Retorna o QR Code como imagem PNG para ser escaneado.

- Disponível somente quando `status === "qr_ready"`.
- Abra direto no navegador ou use em uma tag `<img>`.

---

### `POST /api/send`
Envia uma mensagem de texto.

**Body:**
```json
{
  "to": "5511999999999",
  "message": "Olá, tudo bem?"
}
```

O campo `to` aceita o número com ou sem `@c.us`.

**Resposta:**
```json
{ "success": true, "messageId": "true_5511...@c.us_3EB0..." }
```

---

### `POST /api/send-media`
Envia uma mídia (imagem, vídeo, PDF etc.) a partir de uma URL pública.

**Body:**
```json
{
  "to": "5511999999999",
  "url": "https://exemplo.com/imagem.jpg",
  "caption": "Veja essa imagem!"
}
```

---

## Webhook (mensagens recebidas)

Configure `WEBHOOK_URL` no `.env`. Toda mensagem recebida será enviada via `POST` para essa URL com o payload:

```json
{
  "from": "5511999999999@c.us",
  "to": "5511988888888@c.us",
  "body": "Texto recebido",
  "type": "chat",
  "timestamp": 1718000000,
  "hasMedia": false
}
```

---

## Estrutura do projeto

```
whatsapp-api/
├── src/
│   ├── index.js                    # Ponto de entrada
│   ├── routes/
│   │   └── api.routes.js           # Definição dos endpoints
│   ├── middlewares/
│   │   └── auth.middleware.js      # Autenticação por API Key
│   ├── services/
│   │   └── whatsapp.service.js     # Cliente WhatsApp (singleton)
│   └── utils/
│       └── webhook.js              # Notificação de mensagens recebidas
├── sessions/                       # Sessão salva pelo LocalAuth (gerado em runtime)
├── .env.example
├── .gitignore
└── package.json
```

## Segurança

- Nunca exponha o servidor diretamente na internet sem HTTPS e firewall.
- Use um proxy reverso como Nginx com certificado SSL.
- Troque o valor de `API_KEY` por uma string aleatória longa.
- Adicione rate limiting em produção (ex: pacote `express-rate-limit`).
