import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

function Dashboard() {
  const { id } = useParams()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/agents/${id}/stats`)
      .then(r => r.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="container"><p>Carregando...</p></div>
  if (!stats) return <div className="container"><p>Sem dados</p></div>

  const stageEntries = Object.entries(stats.stageStats || {})

  return (
    <div className="container">
      <Link to={`/agents/${id}`} className="btn btn-secondary" style={{marginBottom: '1rem'}}>← Voltar</Link>

      <h1>Analytics & Dashboard</h1>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card-value">{stats.totalLeads}</div>
          <div className="stat-card-label">Total de Leads</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{stats.conversionRate}%</div>
          <div className="stat-card-label">Taxa de Conversão</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{stats.leadScoreAvg}</div>
          <div className="stat-card-label">Score Médio</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{stats.totalMsgs}</div>
          <div className="stat-card-label">Total Mensagens</div>
        </div>
      </div>

      <div style={{background: 'white', padding: '2rem', borderRadius: '8px', marginTop: '2rem'}}>
        <h3>Breakdown por Estágio</h3>
        <div style={{marginTop: '1.5rem'}}>
          {stageEntries.map(([stage, count]) => (
            <div key={stage} style={{marginBottom: '1.5rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                <strong>{stage}</strong>
                <span>{count} ({stats.totalLeads ? Math.round(count / stats.totalLeads * 100) : 0}%)</span>
              </div>
              <div style={{
                background: '#e0e0e0',
                height: '24px',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: stage === 'convertido' ? '#1dd1a1' :
                              stage === 'interessado' ? '#667eea' :
                              stage === 'downsell' ? '#ff9f43' : '#a0a0a0',
                  height: '100%',
                  width: `${stats.totalLeads ? (count / stats.totalLeads * 100) : 0}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {stats.topLeads && stats.topLeads.length > 0 && (
        <div style={{background: 'white', padding: '2rem', borderRadius: '8px', marginTop: '2rem'}}>
          <h3>Top Leads (Mais Quentes)</h3>
          <div style={{marginTop: '1rem'}}>
            {stats.topLeads.map((lead, idx) => (
              <div key={idx} style={{
                padding: '1rem',
                borderBottom: idx < stats.topLeads.length - 1 ? '1px solid #e0e0e0' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{lead.user_name}</strong>
                  <div style={{fontSize: '0.85rem', color: '#666'}}>
                    {lead.user_phone}
                  </div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    background: lead.lead_score > 70 ? '#ff6b6b' :
                                 lead.lead_score > 50 ? '#ff9f43' : '#a0a0a0',
                    color: 'white',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}>
                    {lead.lead_score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
