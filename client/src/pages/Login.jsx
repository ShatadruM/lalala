import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import Button from '../components/Button'

export default function Login() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' }
    })
  }

  return (
    <Layout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Infinitus 2026</h1>
        <p className="text-gray-500 mt-2">Student Verification Portal</p>
      </div>
      
      <Button onClick={handleLogin} variant="google">
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="G" />
        Sign in with College Email
      </Button>
      
      <p className="mt-6 text-xs text-center text-gray-400">
        By continuing, you agree to the Terms of Service.
      </p>
    </Layout>
  )
}