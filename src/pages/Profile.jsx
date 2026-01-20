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
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none' }}><ArrowLeft size={24} /></button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Profile</h1>
                <div style={{ width: 24 }}></div>
            </header>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto'
                }}>
                    <User size={48} color="#ccc" />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{user.name || 'User'}</h2>
                <p style={{ color: '#666' }}>{user.email || 'No email provided'}</p>
            </div>

            <div className="card" style={{ padding: '0.5rem' }}>
                {[
                    { icon: <Mail size={20} />, label: 'Email', value: user.email || 'N/A' },
                    { icon: <Shield size={20} />, label: 'Role', value: user.role || 'Grievant' },
                ].map((item, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        borderBottom: i === 1 ? 'none' : '1px solid #f5f5f5'
                    }}>
                        <div style={{ color: '#666' }}>{item.icon}</div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: '#999', fontWeight: '600' }}>{item.label}</p>
                            <p style={{ fontWeight: '600' }}>{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleLogout}
                className="btn"
                style={{
                    width: '100%',
                    marginTop: '2rem',
                    background: '#fff',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}
            >
                <LogOut size={20} />
                Logout
            </button>
        </div>
    )
}

export default Profile
