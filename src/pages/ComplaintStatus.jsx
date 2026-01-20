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
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none' }}><ArrowLeft size={24} /></button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Complaint Status</h1>
                <div style={{ width: 24 }}></div>
            </header>

            {loading ? (
                <p style={{ textAlign: 'center', color: '#999', marginTop: '5rem' }}>Loading details...</p>
            ) : !complaint ? (
                <div style={{ textAlign: 'center', marginTop: '5rem' }}>
                    <p style={{ color: '#ef4444', fontWeight: 'bold' }}>Error: Complaint not found or could not be loaded.</p>
                    <button onClick={fetchData} className="btn" style={{ marginTop: '1rem', background: '#eee' }}>Retry</button>
                </div>
            ) : (
                <>
                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>{complaint.title || 'No Title'}</h2>
                        <p style={{ fontSize: '1rem', color: '#666', marginBottom: '1.5rem' }}>ID: #{complaint.complaintId}</p>

                        <div className="card" style={{ background: '#f9f9f9', border: 'none', marginBottom: '2rem' }}>
                            <p style={{ fontSize: '0.9rem', color: '#666', fontWeight: '600', marginBottom: '0.5rem' }}>Current Status</p>
                            <p style={{
                                fontSize: '1.75rem',
                                fontWeight: '800',
                                color: complaint.status === 'RESOLVED' ? '#10b981' : '#000'
                            }}>{complaint.status.replace('_', ' ')}</p>
                        </div>

                        <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
                            {/* Vertical Line */}
                            <div style={{
                                position: 'absolute',
                                left: '11px',
                                top: '0',
                                bottom: '0',
                                width: '2px',
                                background: '#eee',
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
                        <section style={{ marginTop: '3rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Admin Actions</h2>

                            <div className="card" style={{ background: '#f5f5f5', border: 'none', marginBottom: '1.5rem', padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <UserPlus size={20} />
                                    <select
                                        className="input-field"
                                        style={{ margin: 0 }}
                                        value={selectedUser}
                                        onChange={(e) => setSelectedUser(e.target.value)}
                                    >
                                        <option value="">Assign to...</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                        ))}
                                    </select>
                                    <button
                                        className="btn btn-primary"
                                        style={{ padding: '0.6rem 1rem' }}
                                        onClick={handleAssign}
                                        disabled={!selectedUser || commentLoading}
                                    >
                                        Assign
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Add Update</label>
                                    <button
                                        onClick={() => setIsPublic(!isPublic)}
                                        style={{
                                            background: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            fontSize: '0.8rem',
                                            color: isPublic ? '#666' : '#ef4444',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {isPublic ? <Unlock size={14} /> : <Lock size={14} />}
                                        {isPublic ? 'Public Reply' : 'Internal Note'}
                                    </button>
                                </div>
                                <textarea
                                    className="input-field"
                                    placeholder={isPublic ? "Add a reply visible to the user..." : "Add a private note for staff..."}
                                    rows="4"
                                    style={{ resize: 'none' }}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    className="btn"
                                    style={{ flex: 1, background: '#eee' }}
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
                                    Mark as Resolved
                                </button>
                            </div>
                        </section>
                    )}

                    {user.role === 'USER' &&
                        complaint.user &&
                        user.email === complaint.user.email &&
                        complaint.status === 'RESOLVED' && (
                            <section style={{ marginTop: '3rem', padding: '1.5rem', background: '#e6fff3', borderRadius: 'var(--radius)' }}>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: '#065f46' }}>Resolution Provided</h2>
                                <p style={{ fontSize: '0.9rem', color: '#065f46', marginBottom: '1.5rem' }}>
                                    Our team has marked this issue as resolved. Please review the updates above and let us know if you are satisfied.
                                </p>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        className="btn"
                                        style={{ flex: 1, background: '#fff', border: '1px solid #059669', color: '#059669' }}
                                        onClick={handleClose}
                                    >
                                        Close Grievance
                                    </button>
                                    <button
                                        className="btn"
                                        style={{ flex: 1, background: '#ef4444', color: 'white' }}
                                        onClick={handleReopen}
                                    >
                                        Reopen
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
