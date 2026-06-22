require('dotenv').config();

const express = require('express');
const apiRoutes = require('./routes/api.routes');
const apiKeyAuth = require('./middlewares/auth.middleware');
const whatsapp = require('./services/whatsapp.service');
const { notifyWebhook } = require('./utils/webhook');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares globais ────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log básico de requisições
app.use((req, _res, next) => {
  console.log(`[HTTP] ${req.method} ${req.path}`);
  next();
});

// ── Rota de saúde (sem auth) ──────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// ── Rotas protegidas ──────────────────────────────────────────────────────────
app.use('/api', apiKeyAuth, apiRoutes);

// ── Handler de erros ──────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Erro]', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// ── Inicia servidor e WhatsApp ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`   GET  /health          — verificar saúde da API`);
  console.log(`   GET  /api/status      — status do WhatsApp`);
  console.log(`   GET  /api/qr          — QR Code para login`);
  console.log(`   POST /api/send        — enviar mensagem`);
  console.log(`   POST /api/send-media  — enviar mídia\n`);
});

// Inicializa o cliente WhatsApp e registra o handler de mensagens recebidas
whatsapp.init();
whatsapp.onMessage(notifyWebhook);
