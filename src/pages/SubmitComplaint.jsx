import React, { useState, useEffect } from 'react'
import { ArrowLeft, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { complaintService, categoryService } from '../services/api'

const SubmitComplaint = () => {
    const navigate = useNavigate()
    const [type, setType] = useState('Public')
    const [subject, setSubject] = useState('')
    const [description, setDescription] = useState('')
    const [email, setEmail] = useState('')
    const [category, setCategory] = useState('General')
    const [priority, setPriority] = useState('MEDIUM')
    const [categories, setCategories] = useState([])
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoryService.getAll()
                setCategories(res.data)
            } catch (err) {
                console.error('Error fetching categories', err)
            }
        }
        fetchCategories()
    }, [])

    const handleSubmit = async () => {
        if (!subject || !description) {
            alert('Please fill in both subject and description')
            return
        }

        setLoading(true)
        try {
            const userData = localStorage.getItem('user')
            const user = userData ? JSON.parse(userData) : null

            const complaintData = {
                title: subject,
                description: description,
                category: category,
                priority: priority,
                isAnonymous: type === 'Anonymous',
                anonymousEmail: type === 'Anonymous' ? email : null,
                user: user ? { id: user.id } : null
            }

            await complaintService.create(complaintData, file)
            alert('Complaint submitted successfully!')
            navigate('/dashboard')
        } catch (err) {
            console.error('Error submitting complaint', err)
            alert('Failed to submit complaint. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    return (
        <div className="container fade-in" style={{ paddingBottom: '6rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'var(--accent)', padding: '0.4rem', borderRadius: '8px' }}><ArrowLeft size={20} color="var(--primary)" /></button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.025em' }}>Submit Complaint</h1>
                <div style={{ width: 40 }}></div>
            </header>

            <div style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submission Type</h2>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {['Public', 'Anonymous'].map(t => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: 'var(--radius)',
                                border: type === t ? '2px solid var(--primary)' : '1px solid var(--border)',
                                background: type === t ? 'white' : 'var(--surface)',
                                color: type === t ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: '700',
                                boxShadow: type === t ? 'var(--shadow)' : 'none',
                                transition: 'var(--transition)'
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text)' }}>Complaint Details</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="input-group">
                        <label>Category</label>
                        <select
                            className="input-field"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="General">General</option>
                            {categories.map(cat => (
                                <option key={cat.categoryId} value={cat.categoryName}>{cat.categoryName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Priority</label>
                        <select
                            className="input-field"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="CRITICAL">Critical</option>
                        </select>
                    </div>
                </div>

                <div className="input-group">
                    <label>Subject</label>
                    <input
                        className="input-field"
                        placeholder="What's the issue about?"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label>Description</label>
                    <textarea
                        className="input-field"
                        placeholder="Provide as much detail as possible..."
                        rows="6"
                        style={{ resize: 'none' }}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
            </div>

            {type === 'Anonymous' && (
                <div className="card card-warning" style={{ marginBottom: '2rem', borderLeftWidth: '5px' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>Anonymous Contact</h2>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label style={{ color: 'inherit' }}>Email (Optional - for tracking updates)</label>
                        <input
                            className="input-field"
                            style={{ background: 'rgba(255,255,255,0.5)', borderColor: 'rgba(0,0,0,0.1)' }}
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <div className="card" style={{ marginBottom: '3rem', borderStyle: 'dashed', background: 'var(--background)' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--primary)' }}>Attachments</h2>
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    <Upload size={32} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.6 }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem' }}>{file ? 'File Selected' : 'Add Media'}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        {file ? file.name : 'Attach documents, images or videos to support your claim.'}
                    </p>
                    <label className="btn" style={{ background: 'var(--surface)', padding: '0.75rem 1.5rem', cursor: 'pointer', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', fontWeight: '700', color: 'var(--primary)' }}>
                        {file ? 'Change File' : 'Browse Files'}
                        <input type="file" style={{ display: 'none' }} onChange={handleFileChange} />
                    </label>
                </div>
            </div>

            <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', borderRadius: 'var(--radius)' }}
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? 'Processing...' : 'Submit Grievance'}
            </button>

        </div>
    )
}

export default SubmitComplaint
