import { useState, useRef } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import imageCompression from 'browser-image-compression'

export default function AdminScanner() {
  const { user } = useAuth()
  const [scanResult, setScanResult] = useState(null)
  const [studentData, setStudentData] = useState(null)
  const [proofUrl, setProofUrl] = useState(null)
  
  // UTR State Logic
  const [utrNumber, setUtrNumber] = useState('')
  const [utrError, setUtrError] = useState(null)
  const [isCheckingUtr, setIsCheckingUtr] = useState(false)

  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const fileInputRef = useRef(null)

  // Handle QR Scan
  const handleScan = (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0 && !scanResult) {
      const rawValue = detectedCodes[0].rawValue;
      setScanResult(rawValue)
      fetchStudent(rawValue)
    }
  }

  // Fetch Student Details
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
        setScanResult(null)
      } else {
        setStudentData(data)
        setStatusMsg('')
      }
    } catch (err) {
      setStatusMsg('Scan Error')
      setScanResult(null)
    }
  }

  // Live UTR Validation 
  const handleUtrChange = async (e) => {
    const val = e.target.value.toUpperCase().trim();
    setUtrNumber(val);

    if (val.length === 12) {
      setIsCheckingUtr(true);
      setUtrError(null);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('utr_number')
        .eq('utr_number', val)
        .maybeSingle();

      if (data) {
        setUtrError("🚨 FRAUD: UTR already used!");
      } else {
        setUtrError(null); // Valid UTR
      }
      setIsCheckingUtr(false);
    } else if (val.length > 0) {
      setUtrError("UTR must be exactly 12 characters.");
    } else {
      setUtrError(null);
    }
  }

  // Handle Image Upload
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

  // Transaction Logic
  const handleAddMoney = async (amount) => {
    if (!proofUrl) {
      alert("⚠️ Security Alert: You MUST upload a proof photo first.")
      return
    }
    if (utrNumber.length !== 12 || utrError) {
      alert("⚠️ Security Alert: Valid 12-digit UTR is required.")
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
          proofUrl: proofUrl,
          utrNumber: utrNumber 
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
    setUtrNumber('')
    setUtrError(null)
    setStatusMsg('')
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto animate-fade-in">
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500 mb-6 drop-shadow-md text-center tracking-widest uppercase">
          Admin Terminal
        </h1>

        {/* STAGE 1: SCANNER */}
        {!studentData && (
          <div className="bg-black rounded-2xl overflow-hidden border-2 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)] relative aspect-square">
            <Scanner 
              onScan={handleScan}
              formats={['qr_code']}
              components={{ audio: true, torch: true }}
            />
            {/* Sci-Fi Reticle */}
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 border border-red-500/50 rounded-3xl shadow-[inset_0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center">
                 <div className="w-2 h-2 bg-red-500/80 rounded-full animate-ping"></div>
              </div>
            </div>
            
            {statusMsg && (
              <div className="absolute bottom-6 left-0 w-full flex justify-center">
                <span className="bg-red-500/20 backdrop-blur-md border border-red-500/50 text-red-100 font-bold px-4 py-2 rounded-full text-xs uppercase tracking-widest shadow-lg animate-pulse">
                  {statusMsg}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ACTION PANEL */}
        {studentData && (
          <div className="space-y-5 animate-fade-in pb-10">
            
            {/* Identity Card - Glass Panel */}
            <div className="bg-indigo-500/10 backdrop-blur-xl p-5 rounded-2xl border border-indigo-500/30 shadow-lg relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
              <h2 className="text-2xl font-black text-white">{studentData.full_name}</h2>
              <p className="text-sm font-mono text-indigo-300 tracking-wider mb-2">{studentData.registration_number}</p>
              
              <div className="bg-black/30 inline-block px-3 py-1 rounded-md border border-white/5">
                <p className="text-xs text-gray-400 uppercase tracking-widest">
                  Balance: <span className="font-bold text-white text-sm">{studentData.balance} T</span>
                </p>
              </div>
              
              <button onClick={resetScanner} className="block w-full text-center mt-4 text-red-400 text-xs font-bold tracking-widest uppercase hover:text-red-300 transition-colors">
                ✕ Cancel / Scan New
              </button>
            </div>

            {/* UTR Input Section */}
            <div className="bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-lg">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                UPI Reference No. (12 Digits)
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={utrNumber}
                  onChange={handleUtrChange}
                  placeholder="Enter UTR from GPay/PhonePe"
                  className={`w-full bg-white/5 border ${utrError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/50'} rounded-xl px-4 py-3 text-white font-mono tracking-widest outline-none transition-all`}
                  maxLength={12}
                />
                {isCheckingUtr && <div className="absolute right-4 top-3.5 text-xs text-cyan-400 animate-pulse font-bold">CHECKING...</div>}
                {!utrError && utrNumber.length === 12 && !isCheckingUtr && <div className="absolute right-4 top-3.5 text-xs text-green-400 font-bold">✓ VALID</div>}
              </div>
              {utrError && <p className="text-red-400 text-xs font-bold mt-2 ml-1 animate-shake">{utrError}</p>}
            </div>

            {/* Proof Upload */}
            <div className={`bg-black/40 backdrop-blur-xl p-4 rounded-2xl border-2 border-dashed ${proofUrl ? 'border-green-500/50' : 'border-white/20 hover:border-white/40'} text-center transition-colors cursor-pointer`} onClick={() => !proofUrl && fileInputRef.current.click()}>
              {proofUrl ? (
                <div className="relative">
                   <img src={proofUrl} alt="Proof" className="h-32 mx-auto rounded-xl shadow-lg border border-white/10 object-cover" />
                   <button 
                      onClick={(e) => { e.stopPropagation(); setProofUrl(null); }}
                      className="absolute -top-3 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:scale-110 transition-transform"
                   >✕</button>
                   <p className="text-green-400 text-xs font-bold tracking-widest uppercase mt-3 drop-shadow-sm">Proof Uploaded</p>
                </div>
              ) : (
                <div className="py-4">
                  <div className="mx-auto text-3xl mb-2 opacity-50">📷</div>
                  <p className="text-sm font-bold text-gray-300 uppercase tracking-wide">Capture Proof</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Cash or UPI Screen</p>
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
              {uploading && <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest animate-pulse mt-3">Compressing & Uploading...</p>}
            </div>

            {/* Quick Add Controls */}
            <div className="grid grid-cols-3 gap-3">
               {[100, 200, 500].map((amt) => {
                 const isDisabled = !proofUrl || utrNumber.length !== 12 || !!utrError || processing || isCheckingUtr;
                 
                 return (
                 <button
                   key={amt}
                   onClick={() => handleAddMoney(amt)}
                   disabled={isDisabled}
                   className={`py-4 rounded-2xl font-black text-xl shadow-lg transition-all duration-300
                     ${isDisabled 
                       ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed' 
                       : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] active:scale-95'
                     }`}
                 >
                   {processing ? '...' : `+${amt}`}
                 </button>
               )})}
            </div>
            
          </div>
        )}
      </div>
    </Layout>
  )
}