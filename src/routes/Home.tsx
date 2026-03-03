import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../app/supabaseClient'

type Unit = {
  id: string
  owner_id: string
  type: string
  bedrooms: number
  bathrooms: number
  rent_price: number
  unit_photos?: { url: string }[]
}

export default function Home() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
  const [appName, setAppName] = useState('')
  const [appEmail, setAppEmail] = useState('')
  const [appPhone, setAppPhone] = useState('')
  const [appMessage, setAppMessage] = useState('')
  const [appMsg, setAppMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadUnits() {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('units')
        .select('id, owner_id, type, bedrooms, bathrooms, rent_price, unit_photos (url)')
        .eq('is_listed', true)
        .eq('is_available', true)

      if (error) {
        setError(`Error cargando units: ${error.message}`)
        setLoading(false)
        return
      }

      setUnits((data || []) as Unit[])
      setLoading(false)
    }

    loadUnits()
  }, [])

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUnitId) return

    setSubmitting(true)
    setAppMsg('')

    const unit = units.find((u) => u.id === selectedUnitId)
    if (!unit) {
      setAppMsg('No se encontró la unidad seleccionada.')
      setSubmitting(false)
      return
    }

    const { error } = await supabase.from('applications').insert({
      unit_id: unit.id,
      owner_id: unit.owner_id,
      name: appName || null,
      email: appEmail || null,
      phone: appPhone || null,
      message: appMessage || null,
    })

    if (error) {
      setAppMsg(`Error creando aplicación: ${error.message}`)
      setSubmitting(false)
      return
    }

    setAppName('')
    setAppEmail('')
    setAppPhone('')
    setAppMessage('')
    setSelectedUnitId(null)
    setSubmitting(false)
    setAppMsg('✅ Aplicación enviada. El owner la verá en su dashboard.')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Property Manager</h1>
            <p className="text-sm text-gray-700">
              Landing pública · Unidades disponibles para rentar.
            </p>
          </div>
          <div className="flex gap-3 text-sm">
            <Link
              className="px-3 py-1.5 rounded-full border border-slate-300 bg-white hover:border-indigo-500 hover:text-indigo-600 transition"
              to="/login"
            >
              Owner login
            </Link>
            <Link
              className="px-3 py-1.5 rounded-full border border-slate-300 bg-white hover:border-indigo-500 hover:text-indigo-600 transition"
              to="/tenant/login"
            >
              Tenant login
            </Link>
            <Link
              className="px-3 py-1.5 rounded-full border border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-600 transition"
              to="/tenant/register"
            >
              Tenant register
            </Link>
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Unidades disponibles</h2>

          {loading && <p className="text-sm">Cargando unidades...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="grid gap-5 md:grid-cols-3">
            {!loading && units.length === 0 && (
              <p className="text-sm text-gray-600">
                No hay unidades disponibles por ahora.
              </p>
            )}

            {units.map((unit) => {
              const firstPhoto =
                unit.unit_photos && unit.unit_photos.length > 0
                  ? unit.unit_photos[0].url
                  : null

              return (
                <div
                  key={unit.id}
                  className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 text-sm shadow-sm hover:shadow-md transition"
                >
                  {firstPhoto && (
                    <img
                      src={firstPhoto}
                      alt={unit.type}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  )}
                  <div className="font-medium capitalize">{unit.type}</div>
                  <div className="text-xs text-gray-700">
                    {unit.bedrooms} beds · {unit.bathrooms} baths
                  </div>
                  <div className="font-semibold text-indigo-600">${unit.rent_price}</div>
                  <button
                    className="mt-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs hover:bg-indigo-700 transition"
                    onClick={() => setSelectedUnitId(unit.id)}
                  >
                    Apply
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        {selectedUnitId && (
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3 max-w-xl">
            <h2 className="text-lg font-semibold">Application</h2>
            <form className="space-y-2" onSubmit={handleApply}>
              <div className="space-y-1">
                <label className="text-xs">Nombre</label>
                <input
                  className="border border-slate-300 rounded-lg w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs">Email</label>
                <input
                  className="border border-slate-300 rounded-lg w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  type="email"
                  value={appEmail}
                  onChange={(e) => setAppEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs">Teléfono</label>
                <input
                  className="border border-slate-300 rounded-lg w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={appPhone}
                  onChange={(e) => setAppPhone(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs">Mensaje</label>
                <textarea
                  className="border border-slate-300 rounded-lg w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={appMessage}
                  onChange={(e) => setAppMessage(e.target.value)}
                  placeholder="Cuéntanos un poco de ti..."
                />
              </div>

              <div className="flex items-center gap-3 text-sm">
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm disabled:opacity-50 hover:bg-indigo-700 transition"
                  disabled={submitting}
                >
                  {submitting ? 'Enviando...' : 'Enviar aplicación'}
                </button>
                <button
                  type="button"
                  className="text-xs underline"
                  onClick={() => setSelectedUnitId(null)}
                >
                  Cancelar
                </button>
              </div>

              {appMsg && <p className="text-sm">{appMsg}</p>}
            </form>
          </section>
        )}
      </div>
    </div>
  )
}
