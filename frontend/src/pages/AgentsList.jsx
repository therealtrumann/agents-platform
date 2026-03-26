import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function AgentsList() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newAgent, setNewAgent] = useState({ name: '', avatar: '🤖', system_prompt: '' })

  useEffect(() => {
    fetch('/api/agents')
      .then(r => r.json())
      .then(data => {
        setAgents(data)
        setLoading(false)
      })
      .catch(err => console.error(err))
  }, [])

  const handleCreateAgent = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAgent)
    })
    const created = await res.json()
    setAgents([created, ...agents])
    setShowNew(false)
    setNewAgent({ name: '', avatar: '🤖', system_prompt: '' })
  }

  if (loading) {
    return <div className="container" style={{textAlign: 'center', padding: '4rem'}}><p>Carregando...</p></div>
  }

  return (
    <div className="container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h1>Agentes WhatsApp</h1>
        <button className="btn" onClick={() => setShowNew(!showNew)}>
          {showNew ? '✕ Cancelar' : '+ Novo Agente'}
        </button>
      </div>

      {showNew && (
        <div style={{background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem'}}>
          <h3>Criar Novo Agente</h3>
          <form onSubmit={handleCreateAgent}>
            <div className="form-group">
              <label className="form-label">Nome</label>
              <input
                type="text"
                className="form-control"
                value={newAgent.name}
                onChange={e => setNewAgent({...newAgent, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Avatar</label>
              <input
                type="text"
                className="form-control"
                value={newAgent.avatar}
                onChange={e => setNewAgent({...newAgent, avatar: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Prompt (resumido)</label>
              <textarea
                className="form-control"
                value={newAgent.system_prompt}
                onChange={e => setNewAgent({...newAgent, system_prompt: e.target.value})}
                rows="5"
              />
            </div>
            <button type="submit" className="btn">Criar</button>
          </form>
        </div>
      )}

      <div className="agents-grid">
        {agents.map(agent => (
          <Link
            key={agent.id}
            to={`/agents/${agent.id}`}
            className="agent-card"
          >
            <div className="agent-avatar">{agent.avatar}</div>
            <div className="agent-name">{agent.name}</div>
            <div style={{fontSize: '0.9rem', color: '#666', marginBottom: '1rem'}}>
              {agent.description || 'Sem descrição'}
            </div>
            <div style={{
              padding: '0.75rem',
              background: agent.is_active ? '#e8f5e9' : '#ffebee',
              borderRadius: '4px',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              {agent.is_active ? '🟢 Ativo' : '🔴 Inativo'}
            </div>
            <div className="agent-stats">
              <div className="stat">
                <span className="stat-value">{agent.totalLeads}</span>
                <span>Leads</span>
              </div>
              <div className="stat">
                <span className="stat-value">{agent.leadScoreAvg}</span>
                <span>Score médio</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default AgentsList
