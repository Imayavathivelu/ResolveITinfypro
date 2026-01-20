import React, { useState, useEffect } from 'react'
import { ArrowLeft, FileText, Search, CheckCircle, Lock, Unlock, UserPlus } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { complaintService, userService } from '../services/api'

const ComplaintStatus = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [complaint, setComplaint] = useState(null)
    const [timeline, setTimeline] = useState([])
    const [loading, setLoading] = useState(true)
    const [newComment, setNewComment] = useState('')
    const [isPublic, setIsPublic] = useState(true)
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState('')
    const [commentLoading, setCommentLoading] = useState(false)
    const user = JSON.parse(localStorage.getItem('user')) || {}

    const fetchData = async () => {
        try {
            const [compRes, timeRes] = await Promise.all([
                complaintService.getById(id),
                complaintService.getTimeline(id)
            ])
            setComplaint(compRes.data)
            if (compRes.data.assignedTo) {
                setSelectedUser(compRes.data.assignedTo.id)
            }

            if (user.role === 'ADMIN') {
                const usersRes = await userService.getAll()
                setUsers(usersRes.data)
            }

            // Map backend timeline to frontend structure
            const mappedTimeline = timeRes.data.map(item => ({
                title: item.status.replace('_', ' '),
                date: new Date(item.timestamp).toLocaleString(),
                icon: getIcon(item.status),
                completed: true,
                content: item.comment,
                isPublic: item.isPublic,
                author: item.updatedBy ? item.updatedBy.fullName : 'System'
            }))
            setTimeline(mappedTimeline)
        } catch (err) {
            console.error('Error fetching complaint status:', err)
            console.error('Error response:', err.response)
            console.error('Error status:', err.response?.status)
            console.error('Error data:', err.response?.data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        console.log('ComplaintStatus mounted with ID:', id);
        fetchData()
    }, [id])

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return
        setCommentLoading(true)
        try {
            await complaintService.addComment(id, newComment, isPublic)
            setNewComment('')
            await fetchData()
        } catch (err) {
            console.error('Error adding comment', err)
            alert('Failed to add comment')
        } finally {
            setCommentLoading(false)
        }
    }

    const handleAssign = async () => {
        if (!selectedUser) return
        setCommentLoading(true)
        try {
            await complaintService.assign(id, selectedUser)
            await fetchData()
            alert('Assigned successfully')
        } catch (err) {
            console.error('Error assigning complaint', err)
            alert('Failed to assign complaint')
        } finally {
            setCommentLoading(false)
        }
    }

    const handleResolve = async () => {
        if (!newComment.trim()) {
            alert('Please provide a resolution comment')
            return
        }
        setCommentLoading(true)
        try {
            await complaintService.resolve(id, newComment)
            setNewComment('')
            await fetchData()
        } catch (err) {
            console.error('Error resolving complaint', err)
            alert('Failed to resolve complaint')
        } finally {
            setCommentLoading(false)
        }
    }

    const handleClose = async () => {
        if (!window.confirm('Are you sure you want to close this complaint?')) return
        try {
            await complaintService.close(id, 'Closed by user.')
            await fetchData()
        } catch (err) {
            console.error('Error closing complaint', err)
            alert('Failed to close complaint')
        }
    }

    const handleReopen = async () => {
        const reason = window.prompt('Please provide a reason for reopening:')
        if (!reason) return
        try {
            await complaintService.reopen(id, reason)
            await fetchData()
        } catch (err) {
            console.error('Error reopening complaint', err)
            alert('Failed to reopen complaint')
        }
    }

    const getIcon = (status) => {
        if (!status) return <Search size={20} />
        if (status === 'NEW') return <FileText size={20} />
        if (status === 'RESOLVED') return <CheckCircle size={20} />
        return <Search size={20} />
    }

    return (
        <div className="container fade-in" style={{ paddingBottom: '6rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'var(--accent)', padding: '0.4rem', borderRadius: '8px' }}><ArrowLeft size={20} color="var(--primary)" /></button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.025em' }}>Complaint Status</h1>
                <div style={{ width: 40 }}></div>
            </header>

            {loading ? (
                <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p style={{ fontWeight: '500' }}>Loading details...</p>
                </div>
            ) : !complaint ? (
                <div className="card" style={{ textAlign: 'center', marginTop: '5rem', padding: '3rem' }}>
                    <p style={{ color: 'var(--error)', fontWeight: '700', marginBottom: '1.5rem' }}>Complaint not found or could not be loaded.</p>
                    <button onClick={fetchData} className="btn btn-primary">Retry Now</button>
                </div>
            ) : (
                <>
                    <section style={{ marginBottom: '3rem' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>{complaint.title || 'No Title'}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '700' }}>ID: #{complaint.complaintId}</span>
                                <span className="status-badge status-default" style={{ fontSize: '0.7rem' }}>{complaint.category}</span>
                            </div>
                        </div>

                        <div className="card" style={{ background: 'var(--surface)', borderLeft: '4px solid var(--primary)', marginBottom: '2.5rem', padding: '1.5rem 2rem' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Current Status</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <p style={{
                                    fontSize: '2.25rem',
                                    fontWeight: '900',
                                    color: complaint.status === 'RESOLVED' ? 'var(--success)' :
                                        complaint.status === 'ESCALATED' ? 'var(--error)' : 'var(--primary)',
                                    letterSpacing: '-0.05em'
                                }}>{complaint.status.replace('_', ' ')}</p>
                                {complaint.isAnonymous && <Lock size={20} color="var(--text-muted)" />}
                            </div>
                        </div>

                        <div style={{ position: 'relative', paddingLeft: '3rem' }}>
                            {/* Vertical Line */}
                            <div style={{
                                position: 'absolute',
                                left: '14px',
                                top: '0',
                                bottom: '0',
                                width: '2px',
                                background: 'var(--border)',
                                zIndex: 0
                            }}></div>


                            {timeline.map((item, i) => (
                                <div key={i} style={{ position: 'relative', marginBottom: '2rem', zIndex: 1 }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: '-37px',
                                        background: 'white',
                                        borderRadius: '50%',
                                        padding: '5px',
                                        border: '1px solid #eee'
                                    }}>
                                        {item.icon}
                                    </div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {item.title}
                                        {!item.isPublic && <Lock size={14} color="#ef4444" title="Internal Note" />}
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.5rem' }}>{item.date} • {item.author}</p>
                                    {item.content && (
                                        <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.5' }}>{item.content}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {user.role === 'ADMIN' && complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED' && (
                        <section style={{ marginTop: '4rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text)' }}>Admin Controls</h2>

                            <div className="card" style={{ background: 'var(--accent)', border: 'none', marginBottom: '2rem', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ background: 'var(--surface)', padding: '0.5rem', borderRadius: '8px', color: 'var(--primary)' }}>
                                        <UserPlus size={20} />
                                    </div>
                                    <select
                                        className="input-field"
                                        style={{ margin: 0, flex: 1 }}
                                        value={selectedUser}
                                        onChange={(e) => setSelectedUser(e.target.value)}
                                    >
                                        <option value="">Assign to staff...</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                        ))}
                                    </select>
                                    <button
                                        className="btn btn-primary"
                                        style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}
                                        onClick={handleAssign}
                                        disabled={!selectedUser || commentLoading}
                                    >
                                        Assign
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)' }}>Response Message</label>
                                    <button
                                        onClick={() => setIsPublic(!isPublic)}
                                        style={{
                                            background: isPublic ? 'var(--success-bg)' : 'var(--error-bg)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            fontSize: '0.75rem',
                                            color: isPublic ? 'var(--success)' : 'var(--error)',
                                            fontWeight: '800',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '99px',
                                            border: `1px solid ${isPublic ? 'var(--success)' : 'var(--error)'}`
                                        }}
                                    >
                                        {isPublic ? <Unlock size={12} /> : <Lock size={12} />}
                                        {isPublic ? 'Public Reply' : 'Internal Note'}
                                    </button>
                                </div>
                                <textarea
                                    className="input-field"
                                    placeholder={isPublic ? "Write a message to the user..." : "Internal notes only visible to staff..."}
                                    rows="4"
                                    style={{ resize: 'none', background: 'var(--surface)' }}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1.25rem' }}>
                                <button
                                    className="btn"
                                    style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', fontWeight: '700' }}
                                    onClick={handleCommentSubmit}
                                    disabled={commentLoading || !newComment.trim()}
                                >
                                    Post Update
                                </button>
                                <button
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                    onClick={handleResolve}
                                    disabled={commentLoading || !newComment.trim()}
                                >
                                    Resolve Case
                                </button>
                            </div>
                        </section>
                    )}

                    {user.role === 'USER' &&
                        complaint.user &&
                        user.email === complaint.user.email &&
                        complaint.status === 'RESOLVED' && (
                            <section className="card card-success" style={{ marginTop: '4rem', padding: '2rem', borderLeft: '6px solid var(--success)' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.75rem', color: 'inherit' }}>Solution Provided</h2>
                                <p style={{ fontSize: '0.9375rem', color: 'inherit', marginBottom: '2rem', opacity: 0.9 }}>
                                    The administration has provided a resolution for your concern. Please review the timeline above and confirm if the issue is satisfied.
                                </p>
                                <div style={{ display: 'flex', gap: '1.25rem' }}>
                                    <button
                                        className="btn"
                                        style={{ flex: 1, background: 'var(--surface)', border: '2px solid var(--success)', color: 'var(--success)', fontWeight: '800' }}
                                        onClick={handleClose}
                                    >
                                        Close Grievance
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        style={{ flex: 1, background: 'var(--error)', border: 'none' }}
                                        onClick={handleReopen}
                                    >
                                        I've Problem (Reopen)
                                    </button>
                                </div>
                            </section>
                        )}

                </>
            )}
        </div>
    )
}

export default ComplaintStatus
