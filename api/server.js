import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEADS_FILE = path.join(__dirname, 'leads.json');
const PORT = 3999;

// Webhook URL do n8n (configure depois via .env se quiser)
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || '';
// Número WhatsApp para notificação (ex: 5511999999999)
const NOTIFY_WHATSAPP = process.env.NOTIFY_WHATSAPP || '';
const WAHA_SESSION = process.env.WAHA_SESSION || 'default';

if (!existsSync(LEADS_FILE)) writeFileSync(LEADS_FILE, '[]');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function saveLead(data) {
  const leads = JSON.parse(readFileSync(LEADS_FILE, 'utf-8'));
  const lead = { ...data, _timestamp: new Date().toISOString(), _id: Date.now() };
  leads.unshift(lead);
  writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
  return lead;
}

async function notifyWhatsApp(lead) {
  if (!NOTIFY_WHATSAPP) return;
  const msg = `🔔 *Novo Lead - Cont.Tool*\n\n` +
    `*Nome:* ${lead.nome_completo || lead.nome || '-'}\n` +
    `*Empresa:* ${lead.empresa || '-'}\n` +
    `*E-mail:* ${lead.email_corporativo || lead.email || '-'}\n` +
    `*Telefone:* ${lead.telefone_whatsapp || lead.telefone || '-'}\n` +
    `*Cargo:* ${lead.cargo_funcao || '-'}\n` +
    `*Interesse:* ${lead.principal_interesse || '-'}\n` +
    `*Mensagem:* ${lead.mensagem || '-'}`;
  try {
    const res = await fetch(`http://localhost:33000/api/sendText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': 'waha-local-key' },
      body: JSON.stringify({ session: WAHA_SESSION, chatId: `${NOTIFY_WHATSAPP}@c.us`, text: msg }),
    });
    const json = await res.json();
    console.log('[WhatsApp]', json.id ? 'enviado' : 'falhou', JSON.stringify(json));
  } catch (e) {
    console.error('[WhatsApp] erro:', e.message);
  }
}

async function notifyN8N(lead) {
  if (!N8N_WEBHOOK_URL) return;
  try {
    await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
    console.log('[n8n] webhook disparado');
  } catch (e) {
    console.error('[n8n] erro:', e.message);
  }
}

app.post('/api/contact', async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.nome_completo && !body.nome) {
      return res.status(400).json({ success: false, message: 'Dados incompletos.' });
    }

    const lead = saveLead(body);
    console.log(`[Lead] ${lead.nome_completo || lead.nome} | ${lead.empresa} | ${lead._timestamp}`);

    // Notificações em paralelo (não bloqueiam a resposta)
    notifyWhatsApp(lead).catch(() => {});
    notifyN8N(lead).catch(() => {});

    res.json({ success: true, message: 'Formulário recebido com sucesso.' });
  } catch (err) {
    console.error('[Erro]', err.message);
    res.status(500).json({ success: false, message: 'Erro interno.' });
  }
});

app.get('/api/leads', (req, res) => {
  try {
    const leads = JSON.parse(readFileSync(LEADS_FILE, 'utf-8'));
    res.json({ total: leads.length, leads });
  } catch {
    res.json({ total: 0, leads: [] });
  }
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', port: PORT }));

app.listen(PORT, () => console.log(`Conttool Form API rodando na porta ${PORT}`));
