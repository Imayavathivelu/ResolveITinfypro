import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { studentService } from '../services/api'

const StudentForm = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [student, setStudent] = useState({
        name: '',
        email: '',
        department: '',
        phone: ''
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (id) {
            const fetchStudent = async () => {
                try {
                    const res = await studentService.getById(id)
                    setStudent(res.data)
                } catch (err) {
                    console.error('Error fetching student', err)
                }
            }
            fetchStudent()
        }
    }, [id])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (id) {
                await studentService.update(id, student)
            } else {
                await studentService.create(student)
            }
            navigate('/students')
        } catch (err) {
            console.error('Error saving student', err)
            alert('Failed to save student. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setStudent({ ...student, [e.target.name]: e.target.value })
    }

    return (
        <div className="container fade-in" style={{ paddingBottom: '6rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none' }}><ArrowLeft size={24} /></button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{id ? 'Edit Student' : 'Add Student'}</h1>
                <div style={{ width: 24 }}></div>
            </header>

            <form onSubmit={handleSubmit} className="card">
                <div className="input-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Student Name"
                        className="input-field"
                        value={student.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Student Email"
                        className="input-field"
                        value={student.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-group">
                    <label>Department</label>
                    <input
                        type="text"
                        name="department"
                        placeholder="e.g. Computer Science"
                        className="input-field"
                        value={student.department}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-group">
                    <label>Phone Number</label>
                    <input
                        type="text"
                        name="phone"
                        placeholder="Student Phone"
                        className="input-field"
                        value={student.phone}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.2rem' }} disabled={loading}>
                    <Save size={20} />
                    {loading ? 'Saving...' : (id ? 'Update Student' : 'Save Student')}
                </button>
            </form>
        </div>
    )
}

export default StudentForm
