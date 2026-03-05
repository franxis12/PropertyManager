import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../app/supabaseClient'

export default function TenantRegister() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setLoading(false)
      setMsg(`Error: ${error.message}`)
      return
    }

    const user = data.user

    if (!user) {
      setLoading(false)
      setMsg('Could not get user after sign up.')
      return
    }

    await supabase.from('profiles').upsert(
      {
        id: user.id,
        full_name: fullName || null,
        phone: phone || null,
        role: 'tenant',
      },
      { onConflict: 'id' },
    )

    await supabase
      .from('tenants')
      .update({ user_id: user.id })
      .eq('email', email)

    setLoading(false)
    setMsg('Sign up successful. Redirecting to your portal...')

    navigate('/tenant/portal')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-sm space-y-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-md"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Tenant Sign Up</h1>
          <p className="text-xs text-gray-600">
            Use the same email your owner used when creating your record.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm">Full name (optional)</label>
          <input
            className="border border-slate-300 rounded-lg w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Email</label>
          <input
            className="border border-slate-300 rounded-lg w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Phone (text)</label>
          <input
            className="border border-slate-300 rounded-lg w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 000 000"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Password</label>
          <input
            className="border border-slate-300 rounded-lg w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button
          className="w-full px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:opacity-50 hover:bg-indigo-700 transition"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>

        {msg && <p className="text-sm">{msg}</p>}
      </form>
    </div>
  )
}
