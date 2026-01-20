import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../services/api'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await authService.login({ email, password })
            if (response.data.status === 'success') {
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('user', JSON.stringify(response.data.user))
                navigate('/dashboard')
            } else {
                setError(response.data.message || 'Login failed')
            }
        } catch (err) {
            console.error('Login error:', err)
            setError('An error occurred during login. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container fade-in">
            <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '4rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '500', color: '#666', marginBottom: '1rem' }}>Complaint Portal</h2>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '700' }}>Welcome Back</h1>
            </div>

            <form onSubmit={handleLogin} className="card">
                {error && <div style={{ color: '#ef4444', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

                <div className="input-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="input-field"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="input-group">
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        className="input-field"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div style={{ textAlign: 'right', marginBottom: '2rem' }}>
                    <a href="#" style={{ color: '#999', fontSize: '0.9rem' }}>Forgot Password?</a>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.2rem' }} disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                        Don't have an account? <Link to="/register" style={{ color: '#000', fontWeight: '600' }}>Register here</Link>
                    </p>
                </div>
            </form>
        </div>
    )
}

export default Login
