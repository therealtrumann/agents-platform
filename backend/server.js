/**
 * 🚀 Servidor Backend Multi-Agente WhatsApp
 * Express + Claude API + SQLite
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuid } from 'uuid';
import { agents, products, knowledge, leads, db } from './db.js';

dotenv.config();

const app = express();
const client = new Anthropic();

// =====================
// MIDDLEWARE
// =====================

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://agents-platform-*.vercel.app',
    process.env.CORS_ORIGIN || '*'
  ],
  credentials: true
}));
app.use(express.json());

// =====================
// HELPERS
// =====================

const calculateLeadScore = (metadata) => {
  let score = 50;
  if (metadata.perguntouPreco) score += 15;
  if (metadata.perguntouDuracao) score += 10;
  if (metadata.perguntouPayment) score += 20;
  if (metadata.mensagensEnviadas > 3) score += 10;
  if (metadata.recusouCompleto && metadata.recusouFonetica) score -= 20;
  if (metadata.naoResponde > 2) score -= 15;
  return Math.min(100, Math.max(0, score));
};

const detectarEstagio = (metadata) => {
  if (metadata.comprou) return 'convertido';
  if (metadata.recusouCompleto && !metadata.recusouFonetica) return 'downsell';
  if (metadata.objecoes.length > 2) return 'objecao_complexa';
  if (metadata.primeiroContato) return 'frio';
  return 'interessado';
};

// =====================
// ROTAS: AGENTES (CRUD)
// =====================

app.get('/api/agents', (req, res) => {
  try {
    const allAgents = agents.getAll();
    const agentsWithStats = allAgents.map(agent => {
      const leadCount = leads.getCount(agent.id);
      const stageStats = leads.getStageStats(agent.id);
      const topLeads = leads.getTopByScore(agent.id, 5);
      const scoreAvg = topLeads.length ?
        Math.round(topLeads.reduce((s, l) => s + l.lead_score, 0) / topLeads.length) : 0;

      return {
        ...agent,
        totalLeads: leadCount,
        leadScoreAvg: scoreAvg,
        stageStats
      };
    });
    res.json(agentsWithStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agents/:id', (req, res) => {
  try {
    const agent = agents.getById.get(req.params.id);
    if (!agent) return res.status(404).json({ error: 'Agente não encontrado' });

    const agentProducts = products.getByAgentId.all(agent.id);
    const agentKnowledge = knowledge.getByAgentId.all(agent.id);
    const leadCount = leads.getCount.get(agent.id).count;

    res.json({
      ...agent,
      products: agentProducts.map(p => ({ ...p, prices: JSON.parse(p.prices), checkouts: JSON.parse(p.checkouts) })),
      knowledge: agentKnowledge,
      totalLeads: leadCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agents', (req, res) => {
  try {
    const { name, avatar, description, system_prompt } = req.body;
    const id = uuid();
    const webhook_path = name.toLowerCase().replace(/\s+/g, '-').substring(0, 30);

    agents.create.run(
      id,
      name,
      avatar || '🤖',
      description || '',
      system_prompt || '',
      webhook_path,
      'claude-opus-4-6',
      500
    );

    res.json({ id, name, webhook_path });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/agents/:id', (req, res) => {
  try {
    const { name, avatar, description, system_prompt, model, max_tokens, whatsapp_number, support_phone } = req.body;
    agents.update.run(
      name,
      avatar,
      description,
      system_prompt,
      model,
      max_tokens,
      whatsapp_number,
      support_phone,
      req.params.id
    );

    const updated = agents.getById.get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/agents/:id', (req, res) => {
  try {
    agents.delete.run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// ROTAS: PRODUTOS
// =====================

app.get('/api/agents/:id/products', (req, res) => {
  try {
    const prods = products.getByAgentId.all(req.params.id);
    res.json(prods.map(p => ({
      ...p,
      prices: JSON.parse(p.prices),
      checkouts: JSON.parse(p.checkouts)
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agents/:id/products', (req, res) => {
  try {
    const { name, description, objective, prices, checkouts, priority } = req.body;
    const id = uuid();
    products.create.run(
      id,
      req.params.id,
      name,
      description,
      objective,
      JSON.stringify(prices || {}),
      JSON.stringify(checkouts || {}),
      priority || 1
    );
    res.json({ id, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/agents/:agentId/products/:productId', (req, res) => {
  try {
    const { name, description, objective, prices, checkouts, priority } = req.body;
    products.update.run(
      name,
      description,
      objective,
      JSON.stringify(prices),
      JSON.stringify(checkouts),
      priority,
      req.params.productId
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/agents/:agentId/products/:productId', (req, res) => {
  try {
    products.delete.run(req.params.productId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// ROTAS: CONHECIMENTO
// =====================

app.get('/api/agents/:id/knowledge', (req, res) => {
  try {
    const knowledgeList = knowledge.getByAgentId.all(req.params.id);
    res.json(knowledgeList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agents/:id/knowledge', (req, res) => {
  try {
    const { title, content, type } = req.body;
    const id = uuid();
    knowledge.create.run(id, req.params.id, title, content, type || 'text');
    res.json({ id, title });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/agents/:agentId/knowledge/:knowledgeId', (req, res) => {
  try {
    const { title, content, type, is_active } = req.body;
    if (is_active !== undefined) {
      knowledge.toggleActive.run(is_active ? 1 : 0, req.params.knowledgeId);
    } else {
      knowledge.update.run(title, content, type, req.params.knowledgeId);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/agents/:agentId/knowledge/:knowledgeId', (req, res) => {
  try {
    knowledge.delete.run(req.params.knowledgeId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// ROTAS: CONVERSAS
// =====================

app.get('/api/agents/:id/conversations', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const leadsData = leads.getByAgentId.all(req.params.id, limit, offset);
    const totalCount = leads.getCount.get(req.params.id).count;

    const leadsFormatted = leadsData.map(l => ({
      ...l,
      messages: JSON.parse(l.messages),
      metadata: JSON.parse(l.metadata)
    }));

    res.json({
      leads: leadsFormatted,
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agents/:agentId/conversations/:leadId', (req, res) => {
  try {
    const lead = leads.getById.get(req.params.agentId, req.params.leadId);
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado' });

    res.json({
      ...lead,
      messages: JSON.parse(lead.messages),
      metadata: JSON.parse(lead.metadata)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/agents/:agentId/conversations/:leadId', (req, res) => {
  try {
    leads.delete.run(req.params.leadId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// ROTAS: DASHBOARD
// =====================

app.get('/api/agents/:id/stats', (req, res) => {
  try {
    const allLeads = leads.getByAgentId.all(req.params.id, 999, 0);
    const stageStats = leads.getStageStats.all(req.params.id);
    const topLeads = leads.getTopByScore.all(req.params.id, 5);

    const totalLeads = allLeads.length;
    const totalMsgs = allLeads.reduce((sum, l) => sum + JSON.parse(l.messages).length, 0);
    const converted = allLeads.filter(l => l.stage === 'convertido').length;
    const conversionRate = totalLeads ? ((converted / totalLeads) * 100).toFixed(1) : 0;
    const scoreAvg = totalLeads ? Math.round(allLeads.reduce((s, l) => s + l.lead_score, 0) / totalLeads) : 0;

    res.json({
      totalLeads,
      totalMsgs,
      conversionRate: parseFloat(conversionRate),
      leadScoreAvg: scoreAvg,
      stageStats: Object.fromEntries(stageStats.map(s => [s.stage, s.count])),
      topLeads: topLeads.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// WEBHOOK: WHATSAPP (Multi-agente)
// =====================

app.post('/webhook/:agentId/whatsapp', async (req, res) => {
  try {
    const { userId, userName, userPhone, mensagem } = req.body;
    const agentId = req.params.agentId;

    if (!userId || !mensagem) {
      return res.status(400).json({ error: 'userId e mensagem obrigatórios' });
    }

    // Buscar agente
    const agent = agents.getById.get(agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agente não encontrado' });
    }

    // Buscar base de conhecimento ativa
    const knowledgeItems = knowledge.getByAgentId.all(agentId);
    const knowledgeText = knowledgeItems.length
      ? '\n\n=== BASE DE CONHECIMENTO ===\n' + knowledgeItems.map(k => `[${k.type}] ${k.title}: ${k.content}`).join('\n')
      : '';

    // Montar system prompt final = prompt do agente + conhecimento
    const finalSystemPrompt = agent.system_prompt + knowledgeText;

    // Buscar ou criar lead
    let lead = leads.getByUserIdAndAgent.get(agentId, userId);
    const isNewLead = !lead;

    if (!lead) {
      const leadId = uuid();
      leads.create.run(
        leadId,
        agentId,
        userId,
        userName || `User_${userId}`,
        userPhone || '',
        JSON.stringify([]),
        50,
        'frio',
        JSON.stringify({
          primeiroContato: true,
          comprou: false,
          recusouCompleto: false,
          recusouFonetica: false,
          perguntouPreco: false,
          perguntouDuracao: false,
          perguntouPayment: false,
          objecoes: [],
          naoResponde: 0,
          mensagensEnviadas: 0
        })
      );
      lead = leads.getByUserIdAndAgent.get(agentId, userId);
    }

    // Preparar mensagens para Claude
    const messages = JSON.parse(lead.messages);
    const metadata = JSON.parse(lead.metadata);

    // Atualizar metadados baseado na mensagem
    const msgLower = mensagem.toLowerCase();
    if (msgLower.includes('preço') || msgLower.includes('custa')) metadata.perguntouPreco = true;
    if (msgLower.includes('tempo') || msgLower.includes('horário')) metadata.perguntouDuracao = true;
    if (msgLower.includes('pagar') || msgLower.includes('parcel')) metadata.perguntouPayment = true;
    if (msgLower.includes('não') || msgLower.includes('não topo')) metadata.objecoes.push(mensagem);
    metadata.mensagensEnviadas++;

    // Adicionar mensagem do usuário
    messages.push({ role: 'user', content: mensagem });

    // Chamar Claude
    const response = await client.messages.create({
      model: agent.model || 'claude-opus-4-6',
      max_tokens: agent.max_tokens || 500,
      system: finalSystemPrompt,
      messages
    });

    const respuestaTexto = response.content[0].text;

    // Adicionar resposta ao histórico
    messages.push({ role: 'assistant', content: respuestaTexto });

    // Calcular novo score e estágio
    const newScore = calculateLeadScore(metadata);
    const newStage = detectarEstagio(metadata);

    // Salvar lead atualizado
    leads.update.run(
      JSON.stringify(messages),
      newScore,
      newStage,
      JSON.stringify(metadata),
      lead.id
    );

    res.json({
      success: true,
      respuesta: respuestaTexto,
      metadata: {
        leadScore: newScore,
        stage: newStage,
        totalMensajes: messages.length,
        userId
      }
    });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================
// HEALTH CHECK
// =====================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    totalAgents: agents.getAll().length,
    totalLeads: db.leads.length
  });
});

// =====================
// START SERVER
// =====================

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  🤖 AGENTES WhatsApp - BACKEND MULTI-AGENTE              ║
╚════════════════════════════════════════════════════════════╝

✅ Servidor rodando em http://localhost:${PORT}
📊 Database: agents.db
🔗 Frontend: http://localhost:5174 (quando iniciar)

Endpoints disponíveis:
  GET  /api/agents
  GET  /api/agents/:id
  POST /api/agents
  PUT  /api/agents/:id

  GET  /api/agents/:id/products
  POST /api/agents/:id/products

  GET  /api/agents/:id/knowledge
  POST /api/agents/:id/knowledge

  GET  /api/agents/:id/conversations
  GET  /api/agents/:id/stats

  POST /webhook/:agentId/whatsapp

📌 Teste: curl http://localhost:${PORT}/api/agents
  `);
});

export default app;
