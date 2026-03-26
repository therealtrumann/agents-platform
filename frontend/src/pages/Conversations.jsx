import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

function Conversations() {
  const { id } = useParams()
  const [leads, setLeads] = useState([])
  const [selectedLead, setSelectedLead] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/agents/${id}/conversations`)
      .then(r => r.json())
      .then(data => {
        setLeads(data.leads || [])
        setLoading(false)
      })
  }, [id])

  const getScoreColor = (score) => {
    if (score > 70) return 'score-hot'
    if (score > 50) return 'score-warm'
    return 'score-cold'
  }

  if (loading) return <div className="container"><p>Carregando...</p></div>

  return (
    <div className="container">
      <Link to={`/agents/${id}`} className="btn btn-secondary" style={{marginBottom: '1rem'}}>← Voltar</Link>

      <h1>Conversas ({leads.length})</h1>

      <div style={{overflowX: 'auto', marginTop: '1rem'}}>
        <table className="conversations-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Score</th>
              <th>Estágio</th>
              <th>Mensagens</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead.id}>
                <td><strong>{lead.user_name}</strong></td>
                <td>{lead.user_phone}</td>
                <td>
                  <span className={`score-badge ${getScoreColor(lead.lead_score)}`}>
                    {lead.lead_score}
                  </span>
                </td>
                <td>{lead.stage}</td>
                <td>{JSON.parse(lead.messages).length}</td>
                <td>
                  <button
                    className="btn"
                    style={{fontSize: '0.85rem', padding: '0.5rem 1rem'}}
                    onClick={() => setSelectedLead(lead)}
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedLead && (
        <div className="modal-overlay" onClick={() => setSelectedLead(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Conversa de {selectedLead.user_name}</h2>
              <button className="modal-close" onClick={() => setSelectedLead(null)}>×</button>
            </div>

            <div style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '4px',
              maxHeight: '400px',
              overflowY: 'auto',
              marginBottom: '1rem'
            }}>
              {JSON.parse(selectedLead.messages).map((msg, idx) => (
                <div key={idx} style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  background: msg.role === 'user' ? '#fff' : '#e8f5e9',
                  borderRadius: '4px'
                }}>
                  <strong>{msg.role === 'user' ? '👤 Cliente' : '🤖 Agente'}:</strong>
                  <p style={{marginTop: '0.25rem', fontSize: '0.9rem'}}>{msg.content}</p>
                </div>
              ))}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              fontSize: '0.9rem'
            }}>
              <div>
                <strong>Score:</strong> {selectedLead.lead_score}
              </div>
              <div>
                <strong>Estágio:</strong> {selectedLead.stage}
              </div>
              <div>
                <strong>Mensagens:</strong> {JSON.parse(selectedLead.messages).length}
              </div>
              <div>
                <strong>Última atividade:</strong> {new Date(selectedLead.updated_at).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Conversations
