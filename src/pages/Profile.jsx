import React from 'react'
import { ArrowLeft, User, Mail, Phone, Shield, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('user')) || {}

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
    }

    return (
        <div className="container fade-in" style={{ paddingBottom: '6rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'var(--accent)', padding: '0.4rem', borderRadius: '8px' }}><ArrowLeft size={20} color="var(--primary)" /></button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.025em' }}>My Profile</h1>
                <div style={{ width: 40 }}></div>
            </header>

            <div className="card" style={{ textAlign: 'center', marginBottom: '2.5rem', padding: '3rem 2rem' }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto',
                    border: '4px solid var(--surface)',
                    boxShadow: 'var(--shadow)'
                }}>
                    <User size={60} color="var(--primary)" />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.25rem' }}>{user.name || 'User'}</h2>
                <div className="status-badge status-new" style={{ textTransform: 'none', padding: '0.5rem 1rem' }}>{user.role || 'Grievant'}</div>
            </div>

            <div className="card" style={{ padding: '0.75rem' }}>
                {[
                    { icon: <Mail size={20} />, label: 'Email Address', value: user.email || 'N/A' },
                    { icon: <Shield size={20} />, label: 'Account Authority', value: user.role || 'Grievant' },
                ].map((item, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.25rem',
                        padding: '1.25rem',
                        borderBottom: i === 1 ? 'none' : '1px solid var(--border)'
                    }}>
                        <div style={{ color: 'var(--primary)', opacity: 0.8 }}>{item.icon}</div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '0.25rem' }}>{item.label}</p>
                            <p style={{ fontWeight: '700', color: 'var(--text)' }}>{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleLogout}
                className="btn"
                style={{
                    width: '100%',
                    marginTop: '2.5rem',
                    background: 'var(--error-bg)',
                    border: '1px solid var(--error)',
                    color: 'var(--error)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.625rem',
                    padding: '1rem',
                    borderRadius: 'var(--radius)',
                    fontWeight: '700'
                }}
            >
                <LogOut size={20} />
                Sign Out
            </button>

        </div>
    )
}

export default Profile
