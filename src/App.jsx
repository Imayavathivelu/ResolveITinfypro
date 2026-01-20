import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import SubmitComplaint from './pages/SubmitComplaint'
import ComplaintStatus from './pages/ComplaintStatus'
import MyComplaints from './pages/MyComplaints'
import Profile from './pages/Profile'
import StudentList from './pages/StudentList'
import StudentForm from './pages/StudentForm'
import Navigation from './components/Navigation'
import ProtectedRoute from './components/ProtectedRoute'
import Reports from './pages/Reports'


function App() {
    return (
        <Router>
            <div className="app-container">
                <main style={{ flex: 1 }}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/submit" element={<ProtectedRoute><SubmitComplaint /></ProtectedRoute>} />
                        <Route path="/status/:id" element={<ProtectedRoute><ComplaintStatus /></ProtectedRoute>} />
                        <Route path="/my-complaints" element={<ProtectedRoute><MyComplaints /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/students" element={<ProtectedRoute><StudentList /></ProtectedRoute>} />
                        <Route path="/students/add" element={<ProtectedRoute><StudentForm /></ProtectedRoute>} />
                        <Route path="/students/edit/:id" element={<ProtectedRoute><StudentForm /></ProtectedRoute>} />
                        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />

                        <Route path="/" element={<Navigate to="/login" />} />
                    </Routes>
                </main>
                <Navigation />
            </div>
        </Router>
    )
}

export default App
