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
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none' }}><ArrowLeft size={24} /></button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '700' }}>My Complaints</h1>
                <div style={{ width: 24 }}></div>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#999' }}>Loading your complaints...</p>
                ) : (
                    <>
                        {complaints.map((c, i) => {
                            const styles = getStatusStyles(c.status);
                            return (
                                <Link
                                    key={i}
                                    to={`/status/${c.complaintId}`}
                                    className="card"
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s',
                                        textDecoration: 'none',
                                        color: 'inherit'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#999', fontWeight: '600' }}>#{c.complaintId}</span>
                                            {c.isAnonymous && <Lock size={14} color="#999" title="Anonymous Submission" />}
                                        </div>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            padding: '0.25rem 0.6rem',
                                            borderRadius: '100px',
                                            background: styles.bg,
                                            color: styles.color,
                                            fontWeight: '800',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.3rem',
                                            textTransform: 'uppercase'
                                        }}>
                                            {styles.icon}
                                            {c.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.4rem' }}>{c.title}</h3>
                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                        {c.category} • {new Date(c.createdAt).toLocaleDateString()}
                                    </p>
                                </Link>
                            );
                        })}
                        {complaints.length === 0 && <p style={{ textAlign: 'center', color: '#999', marginTop: '2rem' }}>No complaints found.</p>}
                    </>
                )}
            </div>
        </div>
    )
}

export default MyComplaints
