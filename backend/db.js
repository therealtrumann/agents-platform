/**
 * 🗄️ Database Setup (JSON em Arquivo)
 * Simples, sem dependências nativas, perfeito para desenvolvimento
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data.json');

// =====================
// ESTRUTURA DE DADOS
// =====================

const DEFAULT_DB = {
  agents: [],
  products: [],
  knowledge: [],
  leads: []
};

// =====================
// LOAD / SAVE
// =====================

let db = DEFAULT_DB;

const loadDb = () => {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      db = JSON.parse(raw);
    } else {
      saveDb();
    }
  } catch (err) {
    console.error('Erro ao carregar DB:', err);
    db = DEFAULT_DB;
    saveDb();
  }
};

const saveDb = () => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Erro ao salvar DB:', err);
  }
};

// =====================
// INICIALIZAÇÃO
// =====================

const initDb = () => {
  console.log('📊 Inicializando banco de dados (JSON)...');
  loadDb();

  // Seed: Agente Pilar
  const existsPilar = db.agents.some(a => a.id === 'pilar-espanhol');

  if (!existsPilar) {
    const systemPrompt = `Você é um agente de vendas especializado em cursos de espanhol da marca "Pilar de Espanhol".

## IDENTIDADE
Nome: Pilar (ou representante)
Missão: Vender cursos de espanhol com método O.I.R (ouvir, imitar, repetir)

## PRODUTOS (em ordem de prioridade)
1. **Curso Completo** (Principal) - 12x R$99 ou 12x R$129 vitalício
   - +160 aulas, método O.I.R, acesso professora, garantia total
   - SEMPRE ofereça este primeiro

2. **Portunhol Nunca Mais** (Downsell) - 12x R$69 ou 12x R$99 vitalício
   - +33 aulas de fonética, foco na fala, mais flexível
   - Ofereça se cliente recusar o completo

3. **Espanhol Express** (Entrada) - R$9 ou R$27
   - NÃO venda proativamente no WhatsApp

4. **Pilarita IA** (Extra) - R$19-69/mês
   - SÓ ofereça se cliente perguntar

## FLUXO DE CONVERSAÇÃO

### FASE 1: BIENVENIDA E DIAGNÓSTICO
- Saudação cálida em português
- Pergunte por que quer aprender espanhol
- Identifique: urgência, orçamento, tempo disponível
- Escute mais que fale

### FASE 2: APRESENTAR CURSO COMPLETO
- Sempre comece com este produto
- Conecte benefícios aos problemas identificados
- Tom: confiante mas educado
- Máx 3-4 linhas por mensagem

### FASE 3: NEGOCIAÇÃO
- Se hesita: "Qual é a dificuldade? É financeiro ou tempo?"
- Ofereça parcelado (12x) ou PIX com 15% desconto
- Se recusa: "Entendo, deixa eu te mostrar uma alternativa"

### FASE 4: DOWNSELL (OPCIONAL)
- Apresente Portunhol Nunca Mais
- Enquadre como "mais enxuto mas eficaz"
- Mesma negociação (12x ou PIX)

### FASE 5: FECHAMENTO
- Se compra: gere link imediato
- Se recusa: ofereça Espanhol Express R$9 ou "volte quando quiser"
- Sempre deixe porta aberta

## REGRAS DE OURO

✅ FAÇA:
- Sempre ofereça Completo PRIMEIRO
- Ouça antes de vender
- Seja firme mas educado
- Use emojis ocasionalmente (máx 2 por msg)
- Respeite "não"

❌ NUNCA:
- Invente benefícios inexistentes
- Ofereça condições impossíveis
- Seja agressivo
- Ofereça Pilarita proativamente
- Venda Express proativamente

## TOM
- Amigável mas profissional
- Confiante no produto
- Honesto sobre limitações
- Persuasivo sem ser agressivo
- Rápido (máx 4 linhas)
- Personalizado`;

    // Agent
    db.agents.push({
      id: 'pilar-espanhol',
      name: 'Pilar de Espanhol',
      avatar: '🇪🇸',
      description: 'Agente de vendas de cursos de espanhol',
      system_prompt: systemPrompt,
      webhook_path: 'pilar-espanhol',
      model: 'claude-opus-4-6',
      max_tokens: 500,
      is_active: 1,
      whatsapp_number: '',
      support_phone: '+55 14 99688-2505',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Products
    const agentId = 'pilar-espanhol';
    db.products.push(
      {
        id: uuid(),
        agent_id: agentId,
        name: 'Curso Completo: Aprenda Espanhol Falando',
        description: '+160 aulas, método O.I.R, acesso professora',
        objective: 'principal',
        prices: { anual: 99, vitalicio: 129 },
        checkouts: {
          anual: 'https://pay.hotmart.com/A101742178Y?off=h2goy9l0',
          vitalicio: 'https://pay.hotmart.com/A101742178Y?off=agc1opq1'
        },
        priority: 1,
        is_active: 1,
        created_at: new Date().toISOString()
      },
      {
        id: uuid(),
        agent_id: agentId,
        name: 'Portunhol Nunca Mais',
        description: '+33 aulas de fonética, foco na fala',
        objective: 'downsell',
        prices: { anual: 69, vitalicio: 99 },
        checkouts: {
          anual: 'https://pay.hotmart.com/H100648331T?off=308z46xz&checkoutMode=10',
          vitalicio: 'https://pay.hotmart.com/H100648331T?off=bemsm2py'
        },
        priority: 2,
        is_active: 1,
        created_at: new Date().toISOString()
      },
      {
        id: uuid(),
        agent_id: agentId,
        name: 'Espanhol Express',
        description: 'Fale 500 frases em 1 hora',
        objective: 'entrada',
        prices: { r9: 9, r27: 27 },
        checkouts: {
          r9: 'https://pay.hotmart.com/A101916909K?off=mpjiaj20&checkoutMode=10',
          r27: 'https://pay.hotmart.com/A101916909K?off=4v47nrty&checkoutMode=10&bid=1774543713614'
        },
        priority: 3,
        is_active: 1,
        created_at: new Date().toISOString()
      },
      {
        id: uuid(),
        agent_id: agentId,
        name: 'Pilarita IA',
        description: 'IA para praticar espanhol',
        objective: 'extra',
        prices: { mensal: 69, trimestral: 59, anual: 19 },
        checkouts: {
          mensal: 'https://pay.hotmart.com/W99956304V?off=dq1m9m7l&checkoutMode=10&bid=1774545475615',
          trimestral: 'https://pay.hotmart.com/W99956304V?off=v3q1b7gx&checkoutMode=10&bid=1774545487597',
          anual: 'https://pay.hotmart.com/W99956304V?off=0bib42lm&checkoutMode=10&bid=1764599457219'
        },
        priority: 4,
        is_active: 1,
        created_at: new Date().toISOString()
      }
    );

    saveDb();
    console.log('✅ Agente Pilar seedado');
  } else {
    console.log('✓ Agente Pilar já existente');
  }

  console.log(`\n📁 Database: ${DB_PATH}\n`);
};

// =====================
// CRUD HELPERS
// =====================

export const agents = {
  getAll: () => db.agents.filter(a => a.is_active),
  getById: (id) => db.agents.find(a => a.id === id),
  create: (agent) => { db.agents.push(agent); saveDb(); },
  update: (id, data) => {
    const idx = db.agents.findIndex(a => a.id === id);
    if (idx >= 0) {
      db.agents[idx] = { ...db.agents[idx], ...data, updated_at: new Date().toISOString() };
      saveDb();
    }
  },
  delete: (id) => {
    const idx = db.agents.findIndex(a => a.id === id);
    if (idx >= 0) {
      db.agents[idx].is_active = 0;
      saveDb();
    }
  }
};

export const products = {
  getByAgentId: (agentId) => db.products.filter(p => p.agent_id === agentId && p.is_active),
  create: (product) => { db.products.push(product); saveDb(); },
  update: (id, data) => {
    const idx = db.products.findIndex(p => p.id === id);
    if (idx >= 0) {
      db.products[idx] = { ...db.products[idx], ...data };
      saveDb();
    }
  },
  delete: (id) => {
    const idx = db.products.findIndex(p => p.id === id);
    if (idx >= 0) {
      db.products[idx].is_active = 0;
      saveDb();
    }
  }
};

export const knowledge = {
  getByAgentId: (agentId) => db.knowledge.filter(k => k.agent_id === agentId && k.is_active),
  getById: (id) => db.knowledge.find(k => k.id === id),
  create: (item) => { db.knowledge.push(item); saveDb(); },
  update: (id, data) => {
    const idx = db.knowledge.findIndex(k => k.id === id);
    if (idx >= 0) {
      db.knowledge[idx] = { ...db.knowledge[idx], ...data, updated_at: new Date().toISOString() };
      saveDb();
    }
  },
  delete: (id) => {
    const idx = db.knowledge.findIndex(k => k.id === id);
    if (idx >= 0) {
      db.knowledge[idx].is_active = 0;
      saveDb();
    }
  }
};

export const leads = {
  getByAgentId: (agentId, limit = 20, offset = 0) =>
    db.leads.filter(l => l.agent_id === agentId).slice(offset, offset + limit),
  getCount: (agentId) => db.leads.filter(l => l.agent_id === agentId).length,
  getById: (agentId, id) => db.leads.find(l => l.agent_id === agentId && l.id === id),
  getByUserIdAndAgent: (agentId, userId) =>
    db.leads.find(l => l.agent_id === agentId && l.user_id === userId),
  create: (lead) => { db.leads.push(lead); saveDb(); },
  update: (id, data) => {
    const idx = db.leads.findIndex(l => l.id === id);
    if (idx >= 0) {
      db.leads[idx] = { ...db.leads[idx], ...data, updated_at: new Date().toISOString() };
      saveDb();
    }
  },
  delete: (id) => {
    const idx = db.leads.findIndex(l => l.id === id);
    if (idx >= 0) {
      db.leads.splice(idx, 1);
      saveDb();
    }
  },
  getTopByScore: (agentId, limit = 5) =>
    db.leads.filter(l => l.agent_id === agentId)
      .sort((a, b) => b.lead_score - a.lead_score)
      .slice(0, limit),
  getStageStats: (agentId) => {
    const stats = {};
    db.leads.filter(l => l.agent_id === agentId).forEach(l => {
      stats[l.stage] = (stats[l.stage] || 0) + 1;
    });
    return Object.entries(stats).map(([stage, count]) => ({ stage, count }));
  }
};

// Inicializar ao importar
initDb();

export default { db, loadDb, saveDb };
