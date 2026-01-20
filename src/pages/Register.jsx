import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../services/api'

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const { name, email, password, confirmPassword } = formData

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleRegister = async (e) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            return setError('Passwords do not match')
        }

        setLoading(true)

        try {
            const response = await authService.register({ name, email, password })
            if (response.data === 'Registered Successfully') {
                navigate('/login')
            } else {
                setError(response.data || 'Registration failed')
            }
        } catch (err) {
            console.error('Registration error:', err)
            setError('An error occurred during registration. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container fade-in">
            <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '500', color: 'var(--secondary)', marginBottom: '0.5rem' }}>Join ResolveIT</h2>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.05em' }}>Create Account</h1>
            </div>

            <form onSubmit={handleRegister} className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                {error && <div style={{ color: 'var(--error)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', padding: '0.75rem', background: 'var(--error-bg)', borderRadius: 'var(--radius-sm)' }}>{error}</div>}

                <div className="input-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        className="input-field"
                        value={name}
                        onChange={onChange}
                        required
                    />
                </div>

                <div className="input-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        className="input-field"
                        value={email}
                        onChange={onChange}
                        required
                    />
                </div>

                <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Create"
                            className="input-field"
                            value={password}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Confirm</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm"
                            className="input-field"
                            value={confirmPassword}
                            onChange={onChange}
                            required
                        />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.1rem', marginTop: '1.5rem' }} disabled={loading}>
                    {loading ? 'Creating Account...' : 'Register'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>Login here</Link>
                    </p>
                </div>
            </form>

        </div>
    )
}

export default Register
