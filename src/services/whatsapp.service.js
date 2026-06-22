const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.status = 'disconnected'; // disconnected | qr_ready | connected
    this.qrDataUrl = null;
    this.messageHandlers = [];
  }

  init() {
    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: './sessions' }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      },
    });

    this.client.on('qr', async (qr) => {
      console.log('[WhatsApp] QR Code gerado — acesse GET /api/qr para escanear');
      this.status = 'qr_ready';
      this.qrDataUrl = await qrcode.toDataURL(qr);
    });

    this.client.on('ready', () => {
      console.log('[WhatsApp] Cliente conectado!');
      this.status = 'connected';
      this.qrDataUrl = null;
    });

    this.client.on('authenticated', () => {
      console.log('[WhatsApp] Autenticado com sucesso');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('[WhatsApp] Falha na autenticação:', msg);
      this.status = 'disconnected';
    });

    this.client.on('disconnected', (reason) => {
      console.warn('[WhatsApp] Desconectado:', reason);
      this.status = 'disconnected';
    });

    this.client.on('message', (msg) => {
      // Notifica todos os handlers registrados (ex: webhook)
      this.messageHandlers.forEach((handler) => handler(msg));
    });

    this.client.initialize();
  }

  // Registra um handler para mensagens recebidas
  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  // Envia mensagem de texto
  async sendMessage(to, body) {
    if (this.status !== 'connected') {
      throw new Error('Cliente WhatsApp não está conectado');
    }

    // Garante o formato correto: 5511999999999@c.us
    const chatId = to.includes('@c.us') ? to : `${to}@c.us`;
    const result = await this.client.sendMessage(chatId, body);
    return result;
  }

  // Envia mensagem com mídia (imagem, vídeo, documento)
  async sendMedia(to, mediaUrl, caption = '') {
    if (this.status !== 'connected') {
      throw new Error('Cliente WhatsApp não está conectado');
    }

    const { MessageMedia } = require('whatsapp-web.js');
    const media = await MessageMedia.fromUrl(mediaUrl);
    const chatId = to.includes('@c.us') ? to : `${to}@c.us`;
    const result = await this.client.sendMessage(chatId, media, { caption });
    return result;
  }

  getStatus() {
    return {
      status: this.status,
      info: this.client?.info ?? null,
    };
  }

  getQr() {
    return this.qrDataUrl;
  }
}

// Singleton — uma única instância para toda a aplicação
module.exports = new WhatsAppService();
