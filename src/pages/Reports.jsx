import React, { useState, useEffect } from 'react'
import { ArrowLeft, Download, BarChart2, PieChart, Activity } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { complaintService } from '../services/api'

const Reports = () => {
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await complaintService.getStats()
                setStats(res.data)
            } catch (err) {
                console.error('Error fetching stats', err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const handleExport = async () => {
        try {
            const res = await complaintService.export()
            const url = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'complaints_report.csv')
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (err) {
            console.error('Export failed', err)
            alert('Failed to export data')
        }
    }

    if (loading) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Loading Reports...</div>

    const categoryData = stats.categories || {}

    return (
        <div className="container fade-in" style={{ paddingBottom: '6rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'var(--accent)', padding: '0.4rem', borderRadius: '8px' }}><ArrowLeft size={20} color="var(--primary)" /></button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.025em' }}>Reports & Analytics</h1>
                <button onClick={handleExport} style={{ background: 'var(--accent)', padding: '0.4rem', borderRadius: '8px' }}><Download size={20} color="var(--primary)" /></button>
            </header>

            <section style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                    <div className="card card-info" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <Activity size={20} />
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.4)', borderRadius: '4px' }}>Live</span>
                        </div>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600', opacity: 0.8, marginBottom: '0.25rem' }}>Resolution Rate</p>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>
                            {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                        </h2>
                    </div>
                    <div className="card card-warning" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <BarChart2 size={20} />
                        </div>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600', opacity: 0.8, marginBottom: '0.25rem' }}>Open Cases</p>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.open}</h2>
                    </div>
                </div>

                <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PieChart size={18} color="var(--primary)" /> By Status
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {[
                            { key: 'open', color: 'var(--info)', label: 'Open' },
                            { key: 'resolved', color: 'var(--success)', label: 'Resolved' },
                            { key: 'closed', color: 'var(--secondary)', label: 'Closed' }
                        ].map(item => (
                            <div key={item.key}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.875rem' }}>
                                    <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{item.label}</span>
                                    <span style={{ fontWeight: '800', color: 'var(--text)' }}>{stats[item.key]}</span>
                                </div>
                                <div style={{ height: '10px', background: 'var(--accent)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${stats.total > 0 ? (stats[item.key] / stats.total) * 100 : 0}%`,
                                        background: item.color,
                                        transition: 'width 1s ease-out',
                                        borderRadius: '10px'
                                    }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ padding: '1.75rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1.5rem' }}>By Category</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {Object.entries(categoryData).map(([cat, count]) => (
                            <div key={cat}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.875rem' }}>
                                    <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{cat}</span>
                                    <span style={{ fontWeight: '800', color: 'var(--text)' }}>{count}</span>
                                </div>
                                <div style={{ height: '10px', background: 'var(--accent)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`,
                                        background: 'var(--primary)',
                                        transition: 'width 1s ease-out',
                                        borderRadius: '10px'
                                    }}></div>
                                </div>
                            </div>
                        ))}
                        {Object.keys(categoryData).length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>No category data yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )

}

export default Reports
