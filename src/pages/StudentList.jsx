import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, ArrowLeft, UserCircle } from 'lucide-react'
import { studentService } from '../services/api'

const StudentList = () => {
    const navigate = useNavigate()
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchStudents = async () => {
        try {
            const res = await studentService.getAll()
            setStudents(res.data)
        } catch (err) {
            console.error('Error fetching students', err)
            // Mock data for demo
            setStudents([
                { id: 1, name: 'Imaya', email: 'imaya@example.com', department: 'IT' },
                { id: 2, name: 'Arun', email: 'arun@example.com', department: 'CS' },
            ])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStudents()
    }, [])

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await studentService.delete(id)
                fetchStudents()
            } catch (err) {
                console.error('Error deleting student', err)
            }
        }
    }

    return (
        <div className="container fade-in" style={{ paddingBottom: '6rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none' }}><ArrowLeft size={24} /></button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Student Directory</h1>
                <button onClick={() => navigate('/students/add')} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                    <Plus size={20} />
                </button>
            </header>

            {loading ? (
                <p>Loading students...</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {students.map((s) => (
                        <div key={s.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <UserCircle size={40} color="#ccc" />
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{s.name}</h3>
                                    <p style={{ fontSize: '0.8rem', color: '#666' }}>{s.department}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => navigate(`/students/edit/${s.id}`)} style={{ padding: '0.5rem', background: '#f5f5f5', borderRadius: '8px' }}>
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(s.id)} style={{ padding: '0.5rem', background: '#fff5f5', color: '#ef4444', borderRadius: '8px' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {students.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>No students found.</p>}
                </div>
            )}
        </div>
    )
}

export default StudentList
