import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

function AgentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [agent, setAgent] = useState(null)
  const [products, setProducts] = useState([])
  const [knowledge, setKnowledge] = useState([])
  const [tab, setTab] = useState('prompt')
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    fetch(`/api/agents/${id}`)
      .then(r => r.json())
      .then(data => {
        setAgent(data)
        setFormData(data)
        setProducts(data.products || [])
        setKnowledge(data.knowledge || [])
        setLoading(false)
      })
  }, [id])

  const handleSaveAgent = async () => {
    await fetch(`/api/agents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const copyWebhook = () => {
    const url = `http://localhost:3001/webhook/${agent.webhook_path}/whatsapp`
    navigator.clipboard.writeText(url)
    alert('URL copiada!')
  }

  if (loading) return <div className="container"><p>Carregando...</p></div>
  if (!agent) return <div className="container"><p>Agente não encontrado</p></div>

  return (
    <div className="container">
      <div className="detail-header">
        <div>
          <h1>{agent.avatar} {agent.name}</h1>
          <p className="text-muted">{agent.webhook_path}</p>
        </div>
        <div>
          <Link to="/" className="btn btn-secondary">← Voltar</Link>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'prompt' ? 'active' : ''}`} onClick={() => setTab('prompt')}>
          Prompt
        </button>
        <button className={`tab-btn ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>
          Produtos
        </button>
        <button className={`tab-btn ${tab === 'knowledge' ? 'active' : ''}`} onClick={() => setTab('knowledge')}>
          Conhecimento
        </button>
        <button className={`tab-btn ${tab === 'config' ? 'active' : ''}`} onClick={() => setTab('config')}>
          Config
        </button>
        <button className={`tab-btn ${tab === 'conversations' ? 'active' : ''}`} onClick={() => setTab('conversations')}>
          Conversas
        </button>
        <button className={`tab-btn ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>
          Dashboard
        </button>
      </div>

      <div className="tab-content">
        {/* Prompt Tab */}
        {tab === 'prompt' && (
          <>
            <label className="form-label">System Prompt</label>
            <textarea
              className="form-control"
              value={formData.system_prompt || ''}
              onChange={e => setFormData({...formData, system_prompt: e.target.value})}
              style={{minHeight: '400px'}}
            />
            <button className="btn" style={{marginTop: '1rem'}} onClick={handleSaveAgent}>
              Salvar
            </button>
            {saved && <p style={{color: 'green', marginTop: '0.5rem'}}>✓ Salvo!</p>}
          </>
        )}

        {/* Products Tab */}
        {tab === 'products' && (
          <>
            <h3>Produtos ({products.length})</h3>
            <div className="products-list" style={{marginTop: '1rem'}}>
              {products.map(p => (
                <div key={p.id} className="product-card">
                  <div className="product-info">
                    <div className="product-name">{p.name}</div>
                    <div className="product-objective">
                      <span className={`badge ${p.objective}`}>{p.objective}</span>
                    </div>
                  </div>
                  <div>
                    <small>{JSON.stringify(p.prices).substring(0, 30)}...</small>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Knowledge Tab */}
        {tab === 'knowledge' && (
          <>
            <h3>Base de Conhecimento ({knowledge.length})</h3>
            <div style={{marginTop: '1rem'}}>
              {knowledge.map(k => (
                <div key={k.id} style={{
                  background: '#f9f9f9',
                  padding: '1rem',
                  borderRadius: '4px',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{fontWeight: 'bold'}}>
                    {k.title}
                    <span className="badge" style={{marginLeft: '0.5rem'}}>{k.type}</span>
                  </div>
                  <div style={{fontSize: '0.85rem', color: '#666', marginTop: '0.25rem'}}>
                    {k.content.substring(0, 100)}...
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Config Tab */}
        {tab === 'config' && (
          <>
            <div className="form-group">
              <label className="form-label">Nome</label>
              <input
                type="text"
                className="form-control"
                value={formData.name || ''}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Modelo Claude</label>
              <select
                className="form-control"
                value={formData.model || 'claude-opus-4-6'}
                onChange={e => setFormData({...formData, model: e.target.value})}
              >
                <option>claude-opus-4-6</option>
                <option>claude-sonnet-4-6</option>
                <option>claude-haiku-4-5</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Max Tokens</label>
              <input
                type="number"
                className="form-control"
                value={formData.max_tokens || 500}
                onChange={e => setFormData({...formData, max_tokens: parseInt(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Webhook URL (copiar)</label>
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <input
                  type="text"
                  className="form-control"
                  value={`http://localhost:3001/webhook/${agent.webhook_path}/whatsapp`}
                  readOnly
                />
                <button className="btn" onClick={copyWebhook}>Copiar</button>
              </div>
            </div>
            <button className="btn" onClick={handleSaveAgent}>Salvar</button>
          </>
        )}

        {/* Conversations Tab */}
        {tab === 'conversations' && (
          <div>
            <h3>Conversas Recentes</h3>
            <Link to={`/agents/${id}/conversations`} className="btn" style={{marginTop: '1rem'}}>
              Ver Todas →
            </Link>
          </div>
        )}

        {/* Dashboard Tab */}
        {tab === 'dashboard' && (
          <div>
            <h3>Analytics</h3>
            <Link to={`/agents/${id}/dashboard`} className="btn" style={{marginTop: '1rem'}}>
              Ver Dashboard →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default AgentDetail
