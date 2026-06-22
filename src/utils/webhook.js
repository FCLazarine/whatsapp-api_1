/**
 * Envia os dados de uma mensagem recebida para a WEBHOOK_URL configurada no .env.
 * Se a URL não estiver configurada, apenas loga no console.
 */
async function notifyWebhook(msg) {
  const webhookUrl = process.env.WEBHOOK_URL;

  const payload = {
    from: msg.from,
    to: msg.to,
    body: msg.body,
    type: msg.type,
    timestamp: msg.timestamp,
    hasMedia: msg.hasMedia,
  };

  console.log('[Webhook] Mensagem recebida:', payload);

  if (!webhookUrl) return;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log(`[Webhook] Notificado: ${response.status}`);
  } catch (err) {
    console.error('[Webhook] Erro ao notificar:', err.message);
  }
}

module.exports = { notifyWebhook };
