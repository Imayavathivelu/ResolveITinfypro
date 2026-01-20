import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, FileText, User, Users, PieChart } from 'lucide-react'

const Navigation = () => {
    const location = useLocation()
    const user = JSON.parse(localStorage.getItem('user')) || {}

    // Don't show navigation on login or register pages
    if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/') {
        return null
    }

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'white',
            borderTop: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-around',
            padding: '0.75rem 0',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
            zIndex: 1000
        }}>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-active' : 'nav-link'}>
                <LayoutDashboard size={24} />
                <span>Dashboard</span>
            </NavLink>
            <NavLink to="/submit" className={({ isActive }) => isActive ? 'nav-active' : 'nav-link'}>
                <PlusCircle size={24} />
                <span>Submit</span>
            </NavLink>
            <NavLink to="/my-complaints" className={({ isActive }) => isActive ? 'nav-active' : 'nav-link'}>
                <FileText size={24} />
                <span>My List</span>
            </NavLink>

            {user.role === 'ADMIN' && (
                <NavLink to="/reports" className={({ isActive }) => isActive ? 'nav-active' : 'nav-link'}>
                    <PieChart size={24} />
                    <span>Reports</span>
                </NavLink>
            )}

            <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-active' : 'nav-link'}>
                <User size={24} />
                <span>Profile</span>
            </NavLink>
            <NavLink to="/students" className={({ isActive }) => isActive ? 'nav-active' : 'nav-link'}>
                <Users size={24} />
                <span>Students</span>
            </NavLink>

            <style>{`
        .nav-link, .nav-active {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 600;
          transition: var(--transition);
        }
        .nav-active {
          color: var(--primary);
        }
        .nav-link:hover {
          color: var(--secondary);
          transform: translateY(-2px);
        }
      `}</style>
        </nav>
    )
}

export default Navigation
