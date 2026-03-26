# 🚀 Guia de Deployment

Este guia explica como fazer deploy do seu projeto no Vercel (Frontend) e Railway (Backend).

## 📋 Pré-requisitos

- Conta no GitHub: https://github.com/therealtrumann/agents-platform
- Conta no Vercel: https://vercel.com
- Conta no Railway: https://railway.app
- Variável de ambiente: `ANTHROPIC_API_KEY`

---

## 1️⃣ Deploy Frontend no Vercel

### Passo 1: Conectar GitHub ao Vercel
1. Acesse https://vercel.com/dashboard
2. Clique em **"New Project"**
3. Selecione **"Import Git Repository"**
4. Busque por `agents-platform`
5. Clique em **"Import"**

### Passo 2: Configurar Projeto
- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Passo 3: Variáveis de Ambiente (Opcional)
Se usar backend em Railway, adicione:
```
VITE_API_URL=https://seu-railway-url.railway.app
```

### Passo 4: Deploy
Clique em **"Deploy"** e aguarde (~2-3 minutos)

**Resultado:** URL como `https://agents-platform-xxxxx.vercel.app`

---

## 2️⃣ Deploy Backend no Railway

### Passo 1: Conectar GitHub ao Railway
1. Acesse https://railway.app/dashboard
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Busque por `agents-platform`
5. Clique em **"Deploy"**

### Passo 2: Configurar Variáveis de Ambiente
1. No painel do Railway, vá para **"Variables"**
2. Adicione:
   ```
   ANTHROPIC_API_KEY=sk-ant-... (sua chave)
   PORT=3001
   NODE_ENV=production
   ```

### Passo 3: Configurar Build & Deploy
1. Vá para **"Settings"**
2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. **Port:** `3001`

### Passo 4: Deploy
Railway faz deploy automaticamente após detectar mudanças no GitHub.

**Resultado:** URL como `https://seu-railway-project.railway.app`

---

## 3️⃣ Conectar Frontend ao Backend

### Se Backend está em Railway:
1. Vá para Vercel Project Settings
2. Environment Variables
3. Adicione: `VITE_API_URL=https://seu-railway-url.railway.app`
4. Redeploy

### Verificar Conexão:
```bash
curl https://seu-railway-url.railway.app/health
```

---

## 📊 Checklist Final

- [ ] Frontend deploy no Vercel
- [ ] Backend deploy no Railway
- [ ] ANTHROPIC_API_KEY configurada no Railway
- [ ] Health check retorna status ok
- [ ] Frontend consegue listar agentes
- [ ] Webhook funciona com n8n/Twilio

---

## 🔧 Troubleshooting

### Erro 404 no Frontend
- Vercel ainda está fazendo build
- Aguarde 3-5 minutos

### Erro 500 no Backend
- Verifique ANTHROPIC_API_KEY no Railway
- Verifique logs: `railway logs`

### CORS Error
- Atualize CORS_ORIGIN no backend para sua URL Vercel

---

## 📚 Links Úteis

- Vercel Dashboard: https://vercel.com/dashboard
- Railway Dashboard: https://railway.app/dashboard
- GitHub Repo: https://github.com/therealtrumann/agents-platform
- Documentação Vercel: https://vercel.com/docs
- Documentação Railway: https://docs.railway.app
