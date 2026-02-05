import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import Button from '../components/Button'

export default function Register() {
  const { user, setProfile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user?.user_metadata?.full_name || '',
    phone: '',
    college_name: '',        // New Field
    registration_number: '', // New Field
    branch: '',
    year: '1'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const updates = {
      id: user.id,
      email: user.email,
      ...formData,
      balance: 0,
      role: 'student',
      is_active: false
    }

    const { error } = await supabase.from('profiles').upsert(updates)

    if (error) {
      alert(error.message)
    } else {
      setProfile(updates)
      navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Student Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input 
            type="text" 
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
          />
        </div>

        {/* College Name & Reg No */}
        <div>
          <label className="block text-sm font-medium text-gray-700">College Name</label>
          <input 
            type="text" 
            required
            placeholder="e.g. VIT Amaravati"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.college_name}
            onChange={(e) => setFormData({...formData, college_name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Registration Number</label>
          <input 
            type="text" 
            required
            placeholder="e.g. 21BCE1000"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500 uppercase"
            value={formData.registration_number}
            onChange={(e) => setFormData({...formData, registration_number: e.target.value.toUpperCase()})}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input 
            type="tel" 
            required
            pattern="[0-9]{10}"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>

        {/* Branch & Year */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Branch</label>
            <input 
              type="text" 
              required
              placeholder="CSE"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.branch}
              onChange={(e) => setFormData({...formData, branch: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <select 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.year}
              onChange={(e) => setFormData({...formData, year: e.target.value})}
            >
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="5">5th Year / Other</option>
            </select>
          </div>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Generating Pass...' : 'Get My Pass'}
        </Button>
      </form>
    </Layout>
  )
}