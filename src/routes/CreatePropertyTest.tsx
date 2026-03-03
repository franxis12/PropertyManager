import { useState } from 'react'
import { supabase } from '../app/supabaseClient'

export default function CreatePropertyTest() {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [msg, setMsg] = useState<string>('')

  const handleCreate = async () => {
    setMsg('')

    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
      setMsg('No hay usuario autenticado. Inicia sesión primero.')
      return
    }

    const ownerId = authData.user.id

    const { error } = await supabase.from('properties').insert({
      owner_id: ownerId,
      name,
      address,
    })

    if (error) {
      setMsg(`Error: ${error.message}`)
      return
    }

    setName('')
    setAddress('')
    setMsg('✅ Property creada correctamente.')
  }

  return (
    <div className="p-6 max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Create Property (Test)</h1>

      <input
        className="border rounded w-full p-2"
        placeholder="Property name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="border rounded w-full p-2"
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <button
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        onClick={handleCreate}
        disabled={!name.trim()}
      >
        Create
      </button>

      {msg && <p className="text-sm">{msg}</p>}
    </div>
  )
}