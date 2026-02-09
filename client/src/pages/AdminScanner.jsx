import { useState, useRef } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner' // <--- NEW LIBRARY
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import imageCompression from 'browser-image-compression'

export default function AdminScanner() {
  const { user } = useAuth()
  const [scanResult, setScanResult] = useState(null)
  const [studentData, setStudentData] = useState(null)
  const [proofUrl, setProofUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const fileInputRef = useRef(null)

  // 1. Handle QR Scan (Updated for new library)
  const handleScan = (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0 && !scanResult) {
      const rawValue = detectedCodes[0].rawValue;
      setScanResult(rawValue)
      fetchStudent(rawValue)
    }
  }

  // 2. Fetch Student Details
  const fetchStudent = async (id) => {
    setStatusMsg('Verifying Student...')
    try {
        const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle()

        if (error || !data) {
        setStatusMsg('Invalid Student QR')
        setScanResult(null) // Reset to allow re-scanning
        } else {
        setStudentData(data)
        setStatusMsg('')
        }
    } catch (err) {
        setStatusMsg('Scan Error')
        setScanResult(null)
    }
  }

  // 3. Handle Image Upload (Compressed)
  const handleImageCapture = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1280,
        useWebWorker: true
      }

      const compressedFile = await imageCompression(file, options)
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random()}.${fileExt}`
      const filePath = `admin_${user.id}/${fileName}`
      
      //storing in supabase storage
      const { error: uploadError } = await supabase.storage
        .from('proofs')
        .upload(filePath, compressedFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('proofs')
        .getPublicUrl(filePath)

      setProofUrl(publicUrl)
    } catch (error) {
      alert('Upload failed: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  // 4. Transaction Logic
  const handleAddMoney = async (amount) => {
    if (!proofUrl) {
      alert("⚠️ Security Alert: You MUST upload a proof photo first.")
      return
    }

    setProcessing(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`${apiUrl}/api/admin/credit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          studentId: scanResult,
          amount: amount,
          proofUrl: proofUrl
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      alert(`✅ Success! Added ${amount} tokens.`)
      resetScanner()

    } catch (error) {
      alert('Transaction Failed: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const resetScanner = () => {
    setScanResult(null)
    setStudentData(null)
    setProofUrl(null)
    setStatusMsg('')
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold text-red-600 mb-4 text-center">Admin Terminal</h1>

      {/* STAGE 1: SCANNER */}
      {!studentData && (
        <div className="bg-black rounded-lg overflow-hidden border-4 border-gray-800 relative aspect-square">
            <Scanner 
                onScan={handleScan}
                formats={['qr_code']}
                components={{
                    audio: true, 
                    torch: true   // Add flashlight button if supported
                }}
            />
           <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
             <div className="w-64 h-64 border-2 border-red-500 opacity-50"></div>
           </div>
           {statusMsg && (
             <div className="absolute bottom-4 left-0 w-full text-center">
               <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">{statusMsg}</span>
             </div>
           )}
        </div>
      )}

      {/* STAGE 2: ACTION PANEL */}
      {studentData && (
        <div className="space-y-6 animate-fade-in">
          {/* Identity Card */}
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <h2 className="text-lg font-bold text-gray-800">{studentData.full_name}</h2>
            <p className="text-sm text-gray-600">{studentData.registration_number}</p>
            <p className="text-xs text-gray-500 mt-1">Current Balance: {studentData.balance}</p>
            <button onClick={resetScanner} className="text-red-500 text-xs underline mt-2">Cancel / Scan New</button>
          </div>

          {/* Proof Upload */}
          <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300 text-center">
            {proofUrl ? (
              <div className="relative">
                 <img src={proofUrl} alt="Proof" className="h-32 mx-auto rounded-md shadow-sm" />
                 <button 
                    onClick={() => setProofUrl(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                 >X</button>
                 <p className="text-green-600 text-xs font-bold mt-2">Proof Uploaded</p>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current.click()} className="cursor-pointer py-4">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-2">📷</div>
                <p className="text-sm font-medium text-gray-600">Tap to Capture Proof</p>
                <p className="text-xs text-gray-400">(Cash or UPI Screen)</p>
              </div>
            )}
            
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={fileInputRef} 
              className="hidden"
              onChange={handleImageCapture}
            />
            {uploading && <p className="text-xs text-indigo-600 animate-pulse mt-2">Compressing & Uploading...</p>}
          </div>

          {/* Controls */}
          <div className="grid grid-cols-3 gap-3">
             {[100, 200, 500].map((amt) => (
               <button
                 key={amt}
                 onClick={() => handleAddMoney(amt)}
                 disabled={!proofUrl || processing}
                 className={`py-4 rounded-xl font-black text-xl shadow-lg transition transform active:scale-95
                   ${!proofUrl 
                     ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                     : 'bg-green-500 text-white hover:bg-green-600'
                   }`}
               >
                 {processing ? '...' : `+${amt}`}
               </button>
             ))}
          </div>
        </div>
      )}
    </Layout>
  )
}