const router = require('express').Router();
const whatsapp = require('../services/whatsapp.service');

// GET /api/status — estado da conexão
router.get('/status', (req, res) => {
  res.json(whatsapp.getStatus());
});

// GET /api/qr — retorna o QR Code como imagem PNG
router.get('/qr', (req, res) => {
  const qr = whatsapp.getQr();

  if (!qr) {
    return res.status(404).json({
      error: 'QR Code não disponível. O cliente pode já estar conectado.',
    });
  }

  // Converte data URL (base64) em buffer e serve como PNG
  const base64Data = qr.replace(/^data:image\/png;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  res.set('Content-Type', 'image/png');
  res.send(buffer);
});

// POST /api/send — envia mensagem de texto
// Body: { "to": "5511999999999", "message": "Olá!" }
router.post('/send', async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: 'Campos obrigatórios: "to" e "message"' });
  }

  try {
    const result = await whatsapp.sendMessage(to, message);
    res.json({ success: true, messageId: result.id._serialized });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/send-media — envia mídia (imagem, vídeo, documento)
// Body: { "to": "5511999999999", "url": "https://...", "caption": "..." }
router.post('/send-media', async (req, res) => {
  const { to, url, caption } = req.body;

  if (!to || !url) {
    return res.status(400).json({ error: 'Campos obrigatórios: "to" e "url"' });
  }

  try {
    const result = await whatsapp.sendMedia(to, url, caption);
    res.json({ success: true, messageId: result.id._serialized });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
