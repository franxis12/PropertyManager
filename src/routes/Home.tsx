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
        setError(`Error loading units: ${error.message}`)
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
      setAppMsg('Selected unit was not found.')
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
      setAppMsg(`Error creating application: ${error.message}`)
      setSubmitting(false)
      return
    }

    setAppName('')
    setAppEmail('')
    setAppPhone('')
    setAppMessage('')
    setSelectedUnitId(null)
    setSubmitting(false)
    setAppMsg('Application sent. The owner will see it in the dashboard.')
  }

  const totalUnits = units.length
  const minRent =
    units.length > 0 ? Math.min(...units.map((u) => Number(u.rent_price) || 0)) : 0
  const maxRent =
    units.length > 0 ? Math.max(...units.map((u) => Number(u.rent_price) || 0)) : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {/* Hero */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 text-white">
            <p className="inline-flex items-center gap-2 text-xs rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Simple property management for real humans
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Manage your rentals without the chaos.
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Owners keep track of units, tenants, payments and maintenance. Tenants get
              a clean portal to mark rent as paid and report issues.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <Link
                to="/tenant/register"
                className="px-4 py-2 rounded-full bg-emerald-500 text-slate-950 font-medium hover:bg-emerald-400 transition"
              >
                I am a tenant
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-full border border-slate-600 text-slate-100 hover:border-indigo-400 hover:text-indigo-200 transition"
              >
                I am an owner
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-xs text-slate-200">
            <div className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 space-y-2 shadow-lg shadow-black/40">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                Snapshot
              </p>
              <div className="flex gap-6">
                <div>
                  <p className="text-2xl font-semibold">{totalUnits}</p>
                  <p className="text-[11px] text-slate-400">units available</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">
                    {minRent && maxRent ? `$${minRent} - $${maxRent}` : '--'}
                  </p>
                  <p className="text-[11px] text-slate-400">monthly range</p>
                </div>
              </div>
            </div>

            <nav className="flex flex-wrap gap-3 justify-end text-[11px] text-slate-300">
              <Link to="/info" className="hover:text-indigo-200 underline-offset-4">
                Terms & Privacy
              </Link>
              <Link to="/info#faqs" className="hover:text-indigo-200 underline-offset-4">
                FAQs
              </Link>
              <Link to="/info#contact" className="hover:text-indigo-200 underline-offset-4">
                Contact
              </Link>
            </nav>
          </div>
        </header>

        {/* Units */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Available units</h2>
            <p className="text-xs text-slate-500">
              Listed by owners · Apply directly from here.
            </p>
          </div>

          {loading && <p className="text-sm text-slate-700">Loading units...</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="grid gap-5 md:grid-cols-3">
            {!loading && units.length === 0 && (
              <p className="text-sm text-slate-600">No units available right now.</p>
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
                  <div className="text-xs text-slate-700">
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

        {/* Application drawer */}
        {selectedUnitId && (
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3 max-w-xl">
            <h2 className="text-lg font-semibold">Application</h2>
            <form className="space-y-2" onSubmit={handleApply}>
              <div className="space-y-1">
                <label className="text-xs">Name</label>
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
                <label className="text-xs">Phone</label>
                <input
                  className="border border-slate-300 rounded-lg w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={appPhone}
                  onChange={(e) => setAppPhone(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs">Message</label>
                <textarea
                  className="border border-slate-300 rounded-lg w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={appMessage}
                  onChange={(e) => setAppMessage(e.target.value)}
                  placeholder="Tell us a bit about yourself..."
                />
              </div>

              <div className="flex items-center gap-3 text-sm">
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm disabled:opacity-50 hover:bg-indigo-700 transition"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit application'}
                </button>
                <button
                  type="button"
                  className="text-xs underline"
                  onClick={() => setSelectedUnitId(null)}
                >
                  Cancel
                </button>
              </div>

              {appMsg && <p className="text-sm">{appMsg}</p>}
            </form>
          </section>
        )}

        {/* Footer */}
        <footer className="pt-4 border-t border-slate-200 text-xs text-slate-500 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <p>© {new Date().getFullYear()} Property Manager. All rights reserved.</p>
          <div className="flex gap-3">
            <Link to="/info" className="hover:text-slate-800 underline-offset-4">
              Terms & Privacy
            </Link>
            <Link to="/info#faqs" className="hover:text-slate-800 underline-offset-4">
              FAQs
            </Link>
            <Link to="/info#contact" className="hover:text-slate-800 underline-offset-4">
              Contact
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
