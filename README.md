# 🤖 Plataforma de Agentes WhatsApp

Sistema completo para gerenciar múltiplos agentes de IA para WhatsApp com interface visual, banco de dados e sincronização em tempo real.

## ✨ Features

✅ **Gerenciamento de Agentes**
- Criar, editar, ativar/desativar agentes
- Editar prompt do agente em tempo real
- Configurar modelo Claude, tokens, webhook URL

✅ **Base de Conhecimento**
- Adicionar textos, FAQs, scripts por agente
- Injetar automaticamente no prompt
- Efeito imediato nas conversas

✅ **Histórico de Conversas**
- Ver todas as conversas por agente
- LeadScore automático (0-100)
- Estágio da conversa (frio, interessado, downsell, convertido)
- Modal com histórico completo de mensagens

✅ **Analytics & Dashboard**
- Total de leads, taxa de conversão, score médio
- Breakdown por estágio
- Top leads mais quentes
- Métricas em tempo real

✅ **Webhook Multi-Agente**
- Cada agente tem URL única: `/webhook/:agentId/whatsapp`
- Integração com n8n, Twilio, Meta
- Prompt dinâmico + base de conhecimento

## 🏗️ Arquitetura

```
agents-platform/
├── backend/              (Node.js + Express)
│   ├── server.js        (Servidor, rotas, webhook)
│   ├── db.js            (JSON em arquivo, simples)
│   ├── package.json
│   └── .env
│
└── frontend/             (React + Vite)
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   └── pages/
    │       ├── AgentsList.jsx
    │       ├── AgentDetail.jsx
    │       ├── Conversations.jsx
    │       └── Dashboard.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🚀 Como Rodar

### Backend (Node.js)

```bash
cd backend
npm install
npm start
```

Rodará em **http://localhost:3001**

Endpoints:
- `GET /api/agents` — lista todos agentes
- `GET /api/agents/:id` — detalhes agente
- `POST /api/agents` — criar agente
- `PUT /api/agents/:id` — atualizar agente
- `GET /api/agents/:id/products` — produtos
- `POST /api/agents/:id/knowledge` — adicionar conhecimento
- `GET /api/agents/:id/conversations` — histórico de leads
- `GET /api/agents/:id/stats` — analytics
- `POST /webhook/:agentId/whatsapp` — webhook multi-agente

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Rodará em **http://localhost:5174** com proxy `/api` → localhost:3001

## 📊 Banco de Dados

Usa **JSON em arquivo** (`data.json`) — simples, sem dependências nativas.

Schema:
```json
{
  "agents": [...],
  "products": [...],
  "knowledge": [...],
  "leads": [...]
}
```

## 🤖 Agente Pré-Seedado

Ao iniciar, cria automaticamente:
- **Agente:** Pilar de Espanhol (webhook: `pilar-espanhol`)
- **Prompt:** Sistema completo de vendas com método O.I.R
- **Produtos:** Curso Completo, Fonética, Express, Pilarita IA

## 🔗 Integração com n8n + Twilio/Meta

### URL do Webhook
```
POST http://SEU-SERVIDOR:3001/webhook/pilar-espanhol/whatsapp
```

### Payload n8n
```json
{
  "userId": "{{$json.From}}",
  "userName": "{{$json.ProfileName}}",
  "userPhone": "{{$json.From}}",
  "mensagem": "{{$json.Body}}"
}
```

## 🎯 Fluxo de Uso

### Editar Prompt (Efeito Imediato)
1. Frontend → Clique no agente
2. Tab "Prompt"
3. Edite o texto
4. Clique "Salvar"
5. ✅ Próxima conversa WhatsApp usa novo prompt

### Adicionar Base de Conhecimento
1. Frontend → Agente → Tab "Conhecimento"
2. Clique "+ Adicionar"
3. Título, tipo (text/faq/script), conteúdo
4. Salve
5. ✅ Automaticamente injetado no prompt

### Ver Conversas
1. Frontend → Agente → Tab "Conversas"
2. Tabela com todos leads
3. Clique na linha → modal com histórico
4. Score, estágio, timeline de mensagens

### Visualizar Analytics
1. Frontend → Agente → Tab "Dashboard"
2. Métricas em cards
3. Breakdown por estágio
4. Top leads mais quentes

## 💾 Armazenamento

- **Agentes:** Nome, avatar, prompt, modelo, tokens, webhook_path
- **Produtos:** Nome, preço, checkouts, objetivo (principal/downsell/entrada/extra)
- **Conhecimento:** Título, conteúdo, tipo (text/faq/script)
- **Leads:** user_id, phone, score, stage, messages[], metadata

## 🔒 Segurança

✅ CORS configurado para frontend (porta 5174)
✅ API Key Claude em `.env`
✅ Webhook autenticado por agentId
✅ Dados persistem em arquivo (backup recomendado)

## 📝 Próximas Melhorias

- [ ] Integração PostgreSQL para escala
- [ ] Autenticação de usuários
- [ ] Upload de PDFs para conhecimento
- [ ] A/B testing de prompts
- [ ] Exportar conversas
- [ ] Webhooks customizados por evento
- [ ] Integração com CRM (Pipedrive, HubSpot)
- [ ] Suporte múltiplos idiomas

## 📞 Suporte

**Backend não inicia:**
- Verifique porta 3001 disponível
- Confirme Node.js 18+
- Veja logs em `/tmp/server.log`

**Frontend não conecta ao backend:**
- Verifique proxy em `vite.config.js`
- Backend deve estar rodando em 3001
- Abra DevTools → Network para debugar

**Webhook retorna erro 404:**
- Verifique `agentId` na URL
- Deve corresponder a um agente existente
- Teste: `curl -X POST http://localhost:3001/webhook/pilar-espanhol/whatsapp -H "Content-Type: application/json" -d '{"userId":"test","userName":"João","userPhone":"+5514999999999","mensagem":"Oi"}'`

## 🎓 Licença

Uso exclusivo - Synkra AIOS

---

**Criado em:** 26/03/2025
**Stack:** React 18 + Vite + Node.js + Express + Claude API + JSON Storage
