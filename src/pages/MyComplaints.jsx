import React, { useState, useEffect } from 'react'
import { ArrowLeft, MoreVertical, Lock, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { complaintService } from '../services/api'

const MyComplaints = () => {
    const navigate = useNavigate()
    const [complaints, setComplaints] = useState([])
    const [loading, setLoading] = useState(true)

    const getStatusStyles = (status) => {
        switch (status) {
            case 'RESOLVED': return { bg: '#e6fff3', color: '#10b981', icon: <CheckCircle size={14} /> };
            case 'ESCALATED': return { bg: '#fef2f2', color: '#ef4444', icon: <AlertCircle size={14} /> };
            case 'NEW': return { bg: '#eff6ff', color: '#3b82f6', icon: <Clock size={14} /> };
            default: return { bg: '#f5f5f5', color: '#666', icon: <Clock size={14} /> };
        }
    }

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const response = await complaintService.getMe()
                setComplaints(response.data)
            } catch (err) {
                console.error('Error fetching complaints', err)
            } finally {
                setLoading(false)
            }
        }
        fetchComplaints()
    }, [])

    return (
        <div className="container fade-in" style={{ paddingBottom: '6rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'var(--accent)', padding: '0.4rem', borderRadius: '8px' }}><ArrowLeft size={20} color="var(--primary)" /></button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.025em' }}>My Complaints</h1>
                <div style={{ width: 40 }}></div>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <p style={{ fontWeight: '500' }}>Loading your complaints...</p>
                    </div>
                ) : (
                    <>
                        {complaints.map((c, i) => {
                            const statusClass = c.status === 'RESOLVED' ? 'status-resolved' :
                                c.status === 'NEW' ? 'status-new' :
                                    c.status === 'ESCALATED' ? 'status-escalated' : 'status-default';
                            return (
                                <Link
                                    key={i}
                                    to={`/status/${c.complaintId}`}
                                    className="card"
                                    style={{
                                        cursor: 'pointer',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        padding: '1.25rem'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>#{c.complaintId}</span>
                                            {c.isAnonymous && <Lock size={14} color="var(--text-muted)" title="Anonymous Submission" />}
                                        </div>
                                        <span className={`status-badge ${statusClass}`}>
                                            {c.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text)' }}>{c.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                                        <span style={{ background: 'var(--accent)', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>{c.category}</span>
                                        <span>•</span>
                                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </Link>
                            );
                        })}
                        {complaints.length === 0 && (
                            <div className="card card-neutral" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                                <AlertCircle size={40} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>No complaints found yet.</p>
                                <button
                                    onClick={() => navigate('/submit')}
                                    className="btn btn-primary"
                                    style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}
                                >
                                    Submit First Complaint
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )

}

export default MyComplaints
