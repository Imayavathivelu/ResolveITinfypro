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
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Menu size={24} />
                <h1 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Hello, {user.name}</h1>
                <div style={{ width: 24 }}></div>
            </header>

            <section style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Overview</h2>
                    {user.role === 'ADMIN' && (
                        <button
                            onClick={() => navigate('/reports')}
                            style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', background: 'none' }}
                        >
                            View Reports
                        </button>
                    )}
                </div>
                {loading ? (
                    <p>Loading stats...</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="card" style={{ padding: '1.25rem', background: '#e0f2fe', borderColor: '#bae6fd' }}>
                            <p style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: '700', marginBottom: '0.5rem' }}>Open Cases</p>
                            <p style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0c4a6e' }}>{stats[0].value}</p>
                        </div>
                        <div className="card" style={{ padding: '1.25rem', background: '#dcfce7', borderColor: '#bbf7d0' }}>
                            <p style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: '700', marginBottom: '0.5rem' }}>Resolved</p>
                            <p style={{ fontSize: '1.75rem', fontWeight: '800', color: '#064e3b' }}>{stats[1].value}</p>
                        </div>
                        <div className="card" style={{ gridColumn: 'span 2', padding: '1.25rem', background: '#f8fafc' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '700', marginBottom: '0.5rem' }}>Total Managed</p>
                                    <p style={{ fontSize: '1.75rem', fontWeight: '800' }}>{stats[2].value}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>Success Rate</p>
                                    <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#10b981' }}>
                                        {stats[2].value > 0 ? Math.round((stats[1].value / stats[2].value) * 100) : 0}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Recent Complaints</h2>
                {loading ? (
                    <p>Loading complaints...</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recentComplaints.map((complaint, i) => (
                            <Link
                                key={i}
                                to={`/status/${complaint.complaintId}`}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem 0',
                                    borderBottom: '1px solid #f5f5f5',
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    color: 'inherit'
                                }}
                            >
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem' }}>ID: {complaint.complaintId}</h3>
                                    <p style={{ fontSize: '0.9rem', color: '#666' }}>{complaint.title}</p>
                                </div>
                                <span style={{
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    color: complaint.status === 'RESOLVED' ? '#10b981' : '#666'
                                }}>
                                    {complaint.status ? complaint.status.replace('_', ' ') : ''}
                                </span>
                            </Link>
                        ))}
                        {recentComplaints.length === 0 && <p style={{ color: '#999' }}>No recent complaints found.</p>}
                    </div>
                )}
            </section>
        </div>
    )
}

export default Dashboard
