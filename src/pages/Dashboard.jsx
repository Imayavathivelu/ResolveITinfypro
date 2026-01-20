import React, { useState, useEffect } from 'react'
import { Menu, MoreVertical } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { complaintService } from '../services/api'

const Dashboard = () => {
    const navigate = useNavigate()
    const [stats, setStats] = useState([
        { label: 'Open Complaints', value: '0', key: 'open' },
        { label: 'Resolved Complaints', value: '0', key: 'resolved' },
        { label: 'Total Complaints', value: '0', key: 'total' },
    ])
    const [recentComplaints, setRecentComplaints] = useState([])
    const [loading, setLoading] = useState(true)
    const user = JSON.parse(localStorage.getItem('user')) || {}

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, complaintsRes] = await Promise.all([
                    complaintService.getStats(),
                    user.role === 'ADMIN' ? complaintService.getAll() : complaintService.getMe()
                ])

                const data = statsRes.data
                setStats([
                    { label: 'Open Complaints', value: data.open || 0 },
                    { label: 'Resolved Complaints', value: data.resolved || 0 },
                    { label: 'Total Complaints', value: data.total || 0 },
                ])

                // Show only last 5 complaints
                setRecentComplaints(complaintsRes.data.slice(-5).reverse())
            } catch (err) {
                console.error('Error fetching dashboard data', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="container fade-in" style={{ paddingBottom: '5rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--accent)', padding: '0.5rem', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
                        <Menu size={20} color="var(--primary)" />
                    </div>
                </div>
                <h1 style={{ fontSize: '1.125rem', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.025em' }}>Hello, {user.name}</h1>
                <div style={{ width: 40 }}></div>
            </header>


            <section style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.025em' }}>Overview</h2>
                    {user.role === 'ADMIN' && (
                        <button
                            onClick={() => navigate('/reports')}
                            className="btn"
                            style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.8rem',
                                background: 'var(--accent)',
                                color: 'var(--primary)',
                                borderRadius: '8px'
                            }}
                        >
                            View Reports
                        </button>
                    )}
                </div>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading stats...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div className="card card-info">
                            <p className="stat-label">Open Cases</p>
                            <p className="stat-value">{stats[0].value}</p>
                        </div>
                        <div className="card card-success">
                            <p className="stat-label">Resolved</p>
                            <p className="stat-value">{stats[1].value}</p>
                        </div>
                        <div className="card card-neutral" style={{ gridColumn: 'span 2' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p className="stat-label">Total Managed</p>
                                    <p className="stat-value" style={{ color: 'var(--text)' }}>{stats[2].value}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Success Rate</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--success)' }}>
                                        {stats[2].value > 0 ? Math.round((stats[1].value / stats[2].value) * 100) : 0}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', letterSpacing: '-0.025em' }}>Recent Complaints</h2>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading complaints...</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {recentComplaints.map((complaint, i) => (
                            <Link
                                key={i}
                                to={`/status/${complaint.complaintId}`}
                                className="card"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1.25rem',
                                    textDecoration: 'none',
                                    color: 'inherit'
                                }}
                            >
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem' }}>#{complaint.complaintId}</h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500' }}>{complaint.title}</p>
                                </div>
                                <span className={`status-badge ${complaint.status === 'RESOLVED' ? 'status-resolved' :
                                    complaint.status === 'NEW' ? 'status-new' :
                                        complaint.status === 'ESCALATED' ? 'status-escalated' : 'status-default'
                                    }`}>
                                    {complaint.status ? complaint.status.replace('_', ' ') : ''}
                                </span>
                            </Link>
                        ))}
                        {recentComplaints.length === 0 && (
                            <div className="card card-neutral" style={{ textAlign: 'center', padding: '3rem' }}>
                                <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>No recent complaints found.</p>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    )

}

export default Dashboard
