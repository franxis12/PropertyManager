import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../app/supabaseClient'

type TenantRow = {
  id: string
  email: string
}

type Lease = {
  id: string
  owner_id: string
  tenant_id: string
  unit_id: string
  start_date: string
  end_date: string
  status: string
  monthly_rent: number
}

type Payment = {
  id: string
  lease_id: string
  year: number
  month: number
  amount: number
  status: string
  paid_at: string | null
}

type Ticket = {
  id: string
  title: string
  description: string
  priority: string
  status: string
  created_at: string
}

export default function TenantPortal() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [tenant, setTenant] = useState<TenantRow | null>(null)
  const [lease, setLease] = useState<Lease | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])

  const [ticketTitle, setTicketTitle] = useState('')
  const [ticketDescription, setTicketDescription] = useState('')
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high'>('medium')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError('')

      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData.user) {
        setError('Debes iniciar sesión como tenant.')
        setLoading(false)
        return
      }

      const userId = authData.user.id

      const { data: tenantRow, error: tenantError } = await supabase
        .from('tenants')
        .select('id, email')
        .eq('user_id', userId)
        .maybeSingle()

      if (tenantError) {
        setError(`Error cargando tenant: ${tenantError.message}`)
        setLoading(false)
        return
      }

      if (!tenantRow) {
        setError(
          'No se encontró un tenant asociado a tu usuario. Pide a tu owner que te cree primero.',
        )
        setLoading(false)
        return
      }

      setTenant(tenantRow as TenantRow)

      const { data: leaseRow, error: leaseError } = await supabase
        .from('leases')
        .select(
          'id, owner_id, tenant_id, unit_id, start_date, end_date, status, monthly_rent',
        )
        .eq('tenant_id', tenantRow.id)
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (leaseError) {
        setError(`Error cargando lease: ${leaseError.message}`)
        setLoading(false)
        return
      }

      setLease((leaseRow || null) as Lease | null)

      if (leaseRow) {
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select(
            'id, lease_id, year, month, amount, status, paid_at',
          )
          .eq('lease_id', leaseRow.id)
          .order('year', { ascending: false })
          .order('month', { ascending: false })

        if (paymentsError) {
          setError(`Error cargando payments: ${paymentsError.message}`)
          setLoading(false)
          return
        }

        setPayments((paymentsData || []) as Payment[])
      }

      const { data: ticketsData, error: ticketsError } = await supabase
        .from('maintenance_tickets')
        .select(
          'id, title, description, priority, status, created_at',
        )
        .eq('tenant_id', tenantRow.id)
        .order('created_at', { ascending: false })

      if (ticketsError) {
        setError(`Error cargando tickets: ${ticketsError.message}`)
        setLoading(false)
        return
      }

      setTickets((ticketsData || []) as Ticket[])

      setLoading(false)
    }

    loadData()
  }, [])

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const currentPayment = payments.find(
    (p) => p.year === currentYear && p.month === currentMonth,
  )

  async function handleMarkPaid() {
    if (!lease || !tenant) return
    setError('')

    const nowIso = new Date().toISOString()

    if (currentPayment) {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          paid_at: nowIso,
        })
        .eq('id', currentPayment.id)

      if (error) {
        setError(`Error actualizando pago: ${error.message}`)
        return
      }
    } else {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          owner_id: lease.owner_id,
          tenant_id: tenant.id,
          lease_id: lease.id,
          year: currentYear,
          month: currentMonth,
          amount: lease.monthly_rent,
          status: 'paid',
          paid_at: nowIso,
        })
        .select(
          'id, lease_id, year, month, amount, status, paid_at',
        )
        .single()

      if (error) {
        setError(`Error creando pago: ${error.message}`)
        return
      }

      setPayments((prev) => [...prev, data as Payment])
    }

    const updated = await supabase
      .from('payments')
      .select(
        'id, lease_id, year, month, amount, status, paid_at',
      )
      .eq('lease_id', lease.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    if (!updated.error) {
      setPayments((updated.data || []) as Payment[])
    }
  }

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault()
    if (!lease || !tenant) return
    if (!ticketTitle.trim()) {
      setError('El título es obligatorio.')
      return
    }

    setError('')

    const { data: ticket, error } = await supabase
      .from('maintenance_tickets')
      .insert({
        owner_id: lease.owner_id,
        tenant_id: tenant.id,
        unit_id: lease.unit_id,
        title: ticketTitle.trim(),
        description: ticketDescription.trim(),
        priority: ticketPriority,
        status: 'open',
      })
      .select(
        'id, title, description, priority, status, created_at',
      )
      .single()

    if (error) {
      setError(`Error creando ticket: ${error.message}`)
      return
    }

    setTickets((prev) => [ticket as Ticket, ...prev])
    setTicketTitle('')
    setTicketDescription('')
    setTicketPriority('medium')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-sm text-gray-700">Cargando portal del tenant...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Tenant Portal</h1>
            {tenant && (
              <p className="text-xs text-gray-600">
                Sesión iniciada como{' '}
                <span className="font-medium">{tenant.email}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              Tenant
            </span>
            <button
              className="px-3 py-1.5 rounded-full border border-slate-300 bg-white text-xs hover:border-red-500 hover:text-red-600 transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Pagos */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
          <h2 className="text-lg font-semibold">Pagos</h2>

        {lease ? (
          <>
            <p className="text-sm">
              Lease actual: rent mensual{' '}
              <span className="font-medium">${lease.monthly_rent}</span>
            </p>

            <div className="border rounded p-3 space-y-2">
              <h3 className="font-medium text-sm">
                Mes actual: {currentMonth}/{currentYear}
              </h3>
              {currentPayment ? (
                <p className="text-sm">
                  Estado: <span className="font-medium">{currentPayment.status}</span>{' '}
                  {currentPayment.paid_at && (
                    <span className="text-xs text-gray-600">
                      (pagado el {new Date(currentPayment.paid_at).toLocaleDateString()})
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-sm">No hay pago registrado para este mes.</p>
              )}

              {(!currentPayment || currentPayment.status !== 'paid') && (
                <button
                  className="px-3 py-2 rounded bg-black text-white text-sm"
                  onClick={handleMarkPaid}
                >
                  Mark as paid
                </button>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-medium text-sm">Historial de pagos</h3>
              <ul className="text-sm space-y-1">
                {payments.length === 0 && (
                  <li>No hay pagos registrados todavía.</li>
                )}
                {payments.map((payment) => (
                  <li key={payment.id}>
                    {payment.month}/{payment.year} - ${payment.amount} -{' '}
                    {payment.status}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-600">
            No se encontró un lease activo asociado a tu usuario.
          </p>
        )}
        </section>

        {/* Averías */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
          <h2 className="text-lg font-semibold">Averías</h2>

          <form className="space-y-2" onSubmit={handleCreateTicket}>
            <div className="space-y-1">
              <label className="text-xs">Título</label>
              <input
                className="border border-slate-300 rounded-lg w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
                placeholder="Ej: Fuga en el baño"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs">Descripción</label>
              <textarea
                className="border border-slate-300 rounded-lg w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                placeholder="Explica el problema con más detalle..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs">Prioridad</label>
              <select
                className="border border-slate-300 rounded-lg w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={ticketPriority}
                onChange={(e) =>
                  setTicketPriority(e.target.value as 'low' | 'medium' | 'high')
                }
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition"
              disabled={!lease || !tenant}
            >
              Crear ticket
            </button>
          </form>

          <div className="space-y-1">
            <h3 className="font-medium text-sm">Mis tickets</h3>
            <ul className="text-sm space-y-1">
              {tickets.length === 0 && (
                <li>No has creado tickets todavía.</li>
              )}
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <div className="font-medium">
                    {ticket.title} - {ticket.status} ({ticket.priority})
                  </div>
                  <div className="text-xs text-gray-600">
                    {new Date(ticket.created_at).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
