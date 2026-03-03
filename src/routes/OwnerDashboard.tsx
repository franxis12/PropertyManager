import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../app/supabaseClient'
import { useAuth } from '../app/AuthContext'

type Property = {
  id: string
  name: string
  address: string
}

type Unit = {
  id: string
  property_id: string
  unit_label?: string | null
  type: string
  bedrooms: number
  bathrooms: number
  rent_price: number
  is_listed: boolean
  is_available: boolean
  notes: string | null
  created_at?: string
}

type Tenant = {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  unit_id: string | null
  rent_amount: number | null
  move_in_date: string | null
  is_active: boolean | null
}

type Lease = {
  id: string
  tenant_id: string
  unit_id: string
  owner_id: string
  start_date: string
  end_date: string
  status: string
  monthly_rent: number
}

type Payment = {
  id: string
  lease_id: string
  tenant_id: string
  year: number
  month: number
  status: string
  amount: number
  paid_at: string | null
}

type Ticket = {
  id: string
  title: string
  category?: string | null
  priority?: string | null
  status: string
  created_at: string
  cost?: number | null
  resolved_at?: string | null
}

export default function OwnerDashboard() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [properties, setProperties] = useState<Property[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [leases, setLeases] = useState<Lease[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)

  const [newPropertyName, setNewPropertyName] = useState('')
  const [newPropertyAddress, setNewPropertyAddress] = useState('')

  const [editPropertyName, setEditPropertyName] = useState('')
  const [editPropertyAddress, setEditPropertyAddress] = useState('')

  const [unitType, setUnitType] = useState<'house' | 'apartment' | 'office'>('apartment')
  const [unitBedrooms, setUnitBedrooms] = useState(1)
  const [unitBathrooms, setUnitBathrooms] = useState(1)
  const [unitRentPrice, setUnitRentPrice] = useState(0)
  const [unitIsListed, setUnitIsListed] = useState(false)
  const [unitIsAvailable, setUnitIsAvailable] = useState(true)
  const [unitNotes, setUnitNotes] = useState('')
  const [unitPhotoUrl, setUnitPhotoUrl] = useState('')

  const [newUnitLabel, setNewUnitLabel] = useState('')
  const [newUnitType, setNewUnitType] = useState<'house' | 'apartment' | 'office'>(
    'apartment',
  )
  const [newUnitBedrooms, setNewUnitBedrooms] = useState(1)
  const [newUnitBathrooms, setNewUnitBathrooms] = useState(1)
  const [newUnitRentPrice, setNewUnitRentPrice] = useState(0)
  const [newUnitIsListed, setNewUnitIsListed] = useState(false)
  const [newUnitIsAvailable, setNewUnitIsAvailable] = useState(true)
  const [newUnitNotes, setNewUnitNotes] = useState('')

  const [tenantEmail, setTenantEmail] = useState('')
  const [tenantPhone, setTenantPhone] = useState('')
  const [tenantUnitId, setTenantUnitId] = useState('')

  const ownerDisplayName = profile?.full_name || user?.email || 'Owner'

  useEffect(() => {
    async function loadOwnerData() {
      setLoading(true)
      setError('')

      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData.user) {
        setError('Debes iniciar sesión como owner.')
        setLoading(false)
        return
      }

      const ownerId = authData.user.id

      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, name, address')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: true })

      if (propertiesError) {
        setError(`Error cargando propiedades: ${propertiesError.message}`)
        setLoading(false)
        return
      }

      setProperties(propertiesData || [])
      const firstProperty = propertiesData && propertiesData.length > 0 ? propertiesData[0] : null
      setSelectedPropertyId(firstProperty ? firstProperty.id : null)

      const { data: unitsData, error: unitsError } = await supabase
        .from('units')
        .select(
          'id, property_id, unit_label, type, bedrooms, bathrooms, rent_price, is_listed, is_available, notes, created_at',
        )
        .eq('owner_id', ownerId)

      if (unitsError) {
        setError(`Error cargando units: ${unitsError.message}`)
        setLoading(false)
        return
      }

      setUnits(unitsData || [])

      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select(
          'id, full_name, email, phone, unit_id, rent_amount, move_in_date, is_active',
        )
        .eq('owner_id', ownerId)

      if (tenantsError) {
        setError(`Error cargando tenants: ${tenantsError.message}`)
        setLoading(false)
        return
      }

      setTenants(tenantsData || [])

      const { data: leasesData, error: leasesError } = await supabase
        .from('leases')
        .select('id, tenant_id, unit_id, owner_id, start_date, end_date, status, monthly_rent')
        .eq('owner_id', ownerId)

      if (leasesError) {
        setError(`Error cargando leases: ${leasesError.message}`)
        setLoading(false)
        return
      }

      setLeases(leasesData || [])

      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('id, lease_id, tenant_id, year, month, status, amount, paid_at')
        .eq('owner_id', ownerId)

      if (paymentsError) {
        setError(`Error cargando payments: ${paymentsError.message}`)
        setLoading(false)
        return
      }

      setPayments(paymentsData || [])

      const { data: ticketsData, error: ticketsError } = await supabase
        .from('maintenance_tickets')
        .select('id, title, category, priority, status, cost, created_at, resolved_at')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })

      if (ticketsError) {
        setError(`Error cargando tickets: ${ticketsError.message}`)
        setLoading(false)
        return
      }

      setTickets(ticketsData || [])

      setLoading(false)
    }

    loadOwnerData()
  }, [])

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const paidThisMonth = payments.filter(
    (p) => p.year === currentYear && p.month === currentMonth && p.status === 'paid',
  )

  const leasesWithPaymentThisMonth = new Set(
    paidThisMonth.map((payment) => payment.lease_id),
  )

  const activeLeases = leases.filter((lease) => lease.status === 'active')
  const leasesWithoutPaymentThisMonth = activeLeases.filter(
    (lease) => !leasesWithPaymentThisMonth.has(lease.id),
  )

  const leasesEndingSoon = activeLeases.filter((lease) => {
    const end = new Date(lease.end_date)
    const now = new Date()
    const diffDays = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays >= 0 && diffDays <= 60
  })

  const openTickets = tickets.filter((ticket) => ticket.status !== 'closed')

  const totalProperties = properties.length
  const availableUnits = units.filter((u) => u.is_available).length
  const occupiedUnits = units.filter((u) => !u.is_available).length
  const listedUnits = units.filter((u) => u.is_listed).length

  const activeTenantsCount = tenants.filter((t) => t.is_active !== false).length

  const newTenantsThisMonth = tenants.filter((tenant) => {
    if (!tenant.move_in_date) return false
    const moveIn = new Date(tenant.move_in_date)
    return (
      moveIn.getFullYear() === currentYear &&
      moveIn.getMonth() + 1 === currentMonth
    )
  })

  const totalPaidThisMonth = paidThisMonth.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0,
  )

  const expectedRentThisMonth = activeLeases.reduce(
    (sum, lease) => sum + (lease.monthly_rent || 0),
    0,
  )

  const outstandingRentThisMonth = Math.max(
    0,
    expectedRentThisMonth - totalPaidThisMonth,
  )

  const openTicketsCount = tickets.filter((t) => t.status === 'open').length
  const inProgressTicketsCount = tickets.filter(
    (t) => t.status === 'in_progress',
  ).length
  const closedTicketsCount = tickets.filter((t) => t.status === 'closed').length

  const totalMaintenanceCost = tickets.reduce(
    (sum, ticket) => sum + (ticket.cost || 0),
    0,
  )

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId) || null
  const propertyUnits = units.filter((u) => u.property_id === selectedPropertyId)
  const selectedUnit = units.find((u) => u.id === selectedUnitId) || null

  function handleSelectProperty(propertyId: string) {
    setSelectedPropertyId(propertyId)
    setSelectedUnitId(null)
    const property = properties.find((p) => p.id === propertyId)
    if (property) {
      setEditPropertyName(property.name)
      setEditPropertyAddress(property.address)
    }
  }

  async function handleCreateProperty() {
    setError('')
    if (!newPropertyName.trim() || !newPropertyAddress.trim()) {
      setError('Nombre y dirección son obligatorios.')
      return
    }

    const { data: authData } = await supabase.auth.getUser()
    const ownerId = authData.user?.id
    if (!ownerId) {
      setError('No hay usuario autenticado.')
      return
    }

    const { data, error } = await supabase
      .from('properties')
      .insert({
        owner_id: ownerId,
        name: newPropertyName,
        address: newPropertyAddress,
      })
      .select('id, name, address')
      .single()

    if (error) {
      setError(`Error creando property: ${error.message}`)
      return
    }

    setProperties((prev) => [...prev, data as Property])
    setNewPropertyName('')
    setNewPropertyAddress('')
  }

  async function handleCreateUnit() {
    setError('')

    if (!selectedPropertyId) {
      setError('Primero selecciona una property para crear la unidad.')
      return
    }

    const { data: authData } = await supabase.auth.getUser()
    const ownerId = authData.user?.id
    if (!ownerId) {
      setError('No hay usuario autenticado.')
      return
    }

    const { data, error } = await supabase
      .from('units')
      .insert({
        owner_id: ownerId,
        property_id: selectedPropertyId,
        unit_label: newUnitLabel || null,
        type: newUnitType,
        bedrooms: newUnitBedrooms,
        bathrooms: newUnitBathrooms,
        rent_price: newUnitRentPrice,
        is_listed: newUnitIsListed,
        is_available: newUnitIsAvailable,
        notes: newUnitNotes || null,
      })
      .select(
        'id, property_id, unit_label, type, bedrooms, bathrooms, rent_price, is_listed, is_available, notes, created_at',
      )
      .single()

    if (error) {
      setError(`Error creando unit: ${error.message}`)
      return
    }

    setUnits((prev) => [...prev, data as Unit])

    setNewUnitLabel('')
    setNewUnitType('apartment')
    setNewUnitBedrooms(1)
    setNewUnitBathrooms(1)
    setNewUnitRentPrice(0)
    setNewUnitIsListed(false)
    setNewUnitIsAvailable(true)
    setNewUnitNotes('')
  }

  async function handleUpdateProperty() {
    setError('')
    if (!selectedProperty) return

    const { error } = await supabase
      .from('properties')
      .update({
        name: editPropertyName,
        address: editPropertyAddress,
      })
      .eq('id', selectedProperty.id)

    if (error) {
      setError(`Error actualizando property: ${error.message}`)
      return
    }

    setProperties((prev) =>
      prev.map((p) =>
        p.id === selectedProperty.id
          ? { ...p, name: editPropertyName, address: editPropertyAddress }
          : p,
      ),
    )
  }

  function startEditUnit(unit: Unit) {
    setSelectedUnitId(unit.id)
    setUnitType(unit.type as 'house' | 'apartment' | 'office')
    setUnitBedrooms(unit.bedrooms)
    setUnitBathrooms(unit.bathrooms)
    setUnitRentPrice(unit.rent_price)
    setUnitIsListed(unit.is_listed)
    setUnitIsAvailable(unit.is_available)
    setUnitNotes(unit.notes ?? '')
    setUnitPhotoUrl('')
  }

  async function handleSaveUnit() {
    setError('')
    if (!selectedUnit) return

    const { error: updateError } = await supabase
      .from('units')
      .update({
        type: unitType,
        bedrooms: unitBedrooms,
        bathrooms: unitBathrooms,
        rent_price: unitRentPrice,
        is_listed: unitIsListed,
        is_available: unitIsAvailable,
        notes: unitNotes,
      })
      .eq('id', selectedUnit.id)

    if (updateError) {
      setError(`Error actualizando unit: ${updateError.message}`)
      return
    }

    if (unitPhotoUrl.trim()) {
      await supabase.from('unit_photos').insert({
        unit_id: selectedUnit.id,
        url: unitPhotoUrl.trim(),
      })
    }

    setUnits((prev) =>
      prev.map((u) =>
        u.id === selectedUnit.id
          ? {
              ...u,
              type: unitType,
              bedrooms: unitBedrooms,
              bathrooms: unitBathrooms,
              rent_price: unitRentPrice,
              is_listed: unitIsListed,
              is_available: unitIsAvailable,
              notes: unitNotes,
            }
          : u,
      ),
    )

    setUnitPhotoUrl('')
  }

  async function handleCreateTenant() {
    setError('')
    if (!tenantEmail.trim() || !tenantUnitId) {
      setError('Email y unidad son obligatorios.')
      return
    }

    const { data: authData } = await supabase.auth.getUser()
    const ownerId = authData.user?.id
    if (!ownerId) {
      setError('No hay usuario autenticado.')
      return
    }

    const unit = units.find((u) => u.id === tenantUnitId)

    const { data, error } = await supabase
      .from('tenants')
      .insert({
        owner_id: ownerId,
        email: tenantEmail.trim(),
        phone: tenantPhone.trim() || null,
        unit_id: tenantUnitId,
        rent_amount: unit ? unit.rent_price : null,
        move_in_date: new Date().toISOString().slice(0, 10),
        is_active: true,
      })
      .select(
        'id, full_name, email, phone, unit_id, rent_amount, move_in_date, is_active',
      )
      .single()

    if (error) {
      setError(`Error creando tenant: ${error.message}`)
      return
    }

    setTenants((prev) => [...prev, data as Tenant])
    setTenantEmail('')
    setTenantPhone('')
    setTenantUnitId('')
  }

  function getTenantEmail(tenantId: string) {
    const tenant = tenants.find((t) => t.id === tenantId)
    return tenant ? tenant.email : 'Sin email'
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-sm text-gray-700">Cargando dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Owner Dashboard</h1>
            <p className="text-xs text-gray-600">
              Gestiona propiedades, units, tenants, pagos y averías.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-xs">
              <span className="font-medium">{ownerDisplayName}</span>
              {user?.email && (
                <span className="text-gray-500">{user.email}</span>
              )}
            </div>
            <button
              className="px-3 py-1.5 rounded-full border border-slate-300 bg-white text-xs hover:border-red-500 hover:text-red-600 transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Resumen */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
        <h2 className="text-lg font-semibold">Resumen</h2>

        <div className="grid gap-4 md:grid-cols-4 text-sm">
          <div className="border rounded p-3">
            <p className="text-xs text-gray-600">Propiedades</p>
            <p className="text-xl font-semibold">{totalProperties}</p>
          </div>

          <div className="border rounded p-3">
            <p className="text-xs text-gray-600">Units (ocupadas / disponibles)</p>
            <p className="text-xl font-semibold">
              {occupiedUnits} / {availableUnits}
            </p>
            <p className="text-xs text-gray-600">Listadas: {listedUnits}</p>
          </div>

          <div className="border rounded p-3">
            <p className="text-xs text-gray-600">Tenants activos</p>
            <p className="text-xl font-semibold">{activeTenantsCount}</p>
            <p className="text-xs text-gray-600">
              Nuevos este mes: {newTenantsThisMonth.length}
            </p>
          </div>

          <div className="border rounded p-3">
            <p className="text-xs text-gray-600">Ingresos este mes</p>
            <p className="text-xl font-semibold">
              ${totalPaidThisMonth.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600">
              Pendiente estimado: ${outstandingRentThisMonth.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium text-sm mb-1">
              Pagos de este mes ({currentMonth}/{currentYear})
            </h3>
            <ul className="text-sm space-y-1">
              {paidThisMonth.length === 0 && <li>No hay pagos marcados como paid.</li>}
              {paidThisMonth.map((payment) => (
                <li key={payment.id}>
                  {getTenantEmail(payment.tenant_id)} - lease {payment.lease_id} -{' '}
                  {payment.status}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-1">Leases sin pago este mes</h3>
            <ul className="text-sm space-y-1">
              {leasesWithoutPaymentThisMonth.length === 0 && (
                <li>Todos los leases activos tienen pago o no hay leases.</li>
              )}
              {leasesWithoutPaymentThisMonth.map((lease) => (
                <li key={lease.id}>
                  {getTenantEmail(lease.tenant_id)} - lease {lease.id}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium text-sm mb-1">Leases que vencen pronto</h3>
            <ul className="text-sm space-y-1">
              {leasesEndingSoon.length === 0 && (
                <li>No hay leases que venzan en los próximos 60 días.</li>
              )}
              {leasesEndingSoon.map((lease) => (
                <li key={lease.id}>
                  {getTenantEmail(lease.tenant_id)} - termina el {lease.end_date}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-1">Averías abiertas</h3>
            <p className="text-xs text-gray-600 mb-1">
              Abiertas: {openTicketsCount} · En progreso: {inProgressTicketsCount} ·
              Cerradas: {closedTicketsCount}
            </p>
            <p className="text-xs text-gray-600 mb-1">
              Coste total registrado: ${totalMaintenanceCost.toFixed(2)}
            </p>
            <ul className="text-sm space-y-1">
              {openTickets.length === 0 && <li>No hay averías abiertas.</li>}
              {openTickets.map((ticket) => (
                <li key={ticket.id}>
                  {ticket.title} - {ticket.status}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {newTenantsThisMonth.length > 0 && (
          <div>
            <h3 className="font-medium text-sm mb-1">Nuevos tenants este mes</h3>
            <ul className="text-sm space-y-1">
              {newTenantsThisMonth.map((tenant) => (
                <li key={tenant.id}>
                  <span className="font-medium">
                    {tenant.full_name || tenant.email}
                  </span>{' '}
                  · move-in:{' '}
                  {tenant.move_in_date
                    ? new Date(tenant.move_in_date).toLocaleDateString()
                    : 'sin fecha'}
                </li>
              ))}
            </ul>
          </div>
        )}
        </section>

        {/* Properties */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-sm">
        <h2 className="text-lg font-semibold">Propiedades</h2>

        <div className="grid gap-4 md:grid-cols-[1.5fr,2fr]">
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Lista de propiedades</h3>
            <div className="space-y-2">
              {properties.length === 0 && (
                <p className="text-sm text-gray-600">No tienes propiedades todavía.</p>
              )}
              {properties.map((property) => (
                <button
                  key={property.id}
                  onClick={() => handleSelectProperty(property.id)}
                  className={`w-full text-left border rounded p-2 text-sm ${
                    selectedPropertyId === property.id ? 'border-black' : ''
                  }`}
                >
                  <div className="font-medium">{property.name}</div>
                  <div className="text-xs text-gray-600">{property.address}</div>
                </button>
              ))}
            </div>

            <div className="border rounded p-3 space-y-2">
              <h3 className="font-medium text-sm">Crear nueva property</h3>
              <input
                className="border rounded w-full p-2 text-sm"
                placeholder="Nombre"
                value={newPropertyName}
                onChange={(e) => setNewPropertyName(e.target.value)}
              />
              <input
                className="border rounded w-full p-2 text-sm"
                placeholder="Dirección"
                value={newPropertyAddress}
                onChange={(e) => setNewPropertyAddress(e.target.value)}
              />
              <button
                className="px-3 py-2 rounded bg-black text-white text-sm"
                onClick={handleCreateProperty}
              >
                Crear property
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {selectedProperty ? (
              <>
                <div className="border rounded p-3 space-y-2">
                  <h3 className="font-medium text-sm">Editar property seleccionada</h3>
                  <input
                    className="border rounded w-full p-2 text-sm"
                    value={editPropertyName}
                    onChange={(e) => setEditPropertyName(e.target.value)}
                  />
                  <input
                    className="border rounded w-full p-2 text-sm"
                    value={editPropertyAddress}
                    onChange={(e) => setEditPropertyAddress(e.target.value)}
                  />
                  <button
                    className="px-3 py-2 rounded bg-black text-white text-sm"
                    onClick={handleUpdateProperty}
                  >
                    Guardar cambios
                  </button>
                </div>

                <div className="border rounded p-3 space-y-2">
                  <h3 className="font-medium text-sm">Units de esta property</h3>
                  {propertyUnits.length === 0 && (
                    <p className="text-sm text-gray-600">
                      No hay units asociadas a esta property todavía.
                    </p>
                  )}
                  <div className="space-y-2">
                    {propertyUnits.map((unit) => (
                      <button
                        key={unit.id}
                        onClick={() => startEditUnit(unit)}
                        className={`w-full text-left border rounded p-2 text-sm ${
                          selectedUnitId === unit.id ? 'border-black' : ''
                        }`}
                      >
                        <div className="font-medium">
                          {unit.type} - ${unit.rent_price}
                        </div>
                        <div className="text-xs text-gray-600">
                          {unit.bedrooms} beds · {unit.bathrooms} baths
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 border-t pt-3 space-y-2">
                    <h4 className="font-medium text-sm">
                      Crear nueva unit en esta property
                    </h4>
                    <input
                      className="border rounded w-full p-2 text-sm"
                      placeholder="Label (opcional, ej: Apt 2B)"
                      value={newUnitLabel}
                      onChange={(e) => setNewUnitLabel(e.target.value)}
                    />

                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs">Tipo</label>
                        <select
                          className="border rounded w-full p-2 text-sm"
                          value={newUnitType}
                          onChange={(e) =>
                            setNewUnitType(
                              e.target.value as 'house' | 'apartment' | 'office',
                            )
                          }
                        >
                          <option value="house">house</option>
                          <option value="apartment">apartment</option>
                          <option value="office">office</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs">Rent price</label>
                        <input
                          className="border rounded w-full p-2 text-sm"
                          type="number"
                          value={newUnitRentPrice}
                          onChange={(e) =>
                            setNewUnitRentPrice(Number(e.target.value))
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs">Bedrooms</label>
                        <input
                          className="border rounded w-full p-2 text-sm"
                          type="number"
                          value={newUnitBedrooms}
                          onChange={(e) =>
                            setNewUnitBedrooms(Number(e.target.value))
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs">Bathrooms</label>
                        <input
                          className="border rounded w-full p-2 text-sm"
                          type="number"
                          value={newUnitBathrooms}
                          onChange={(e) =>
                            setNewUnitBathrooms(Number(e.target.value))
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={newUnitIsListed}
                          onChange={(e) => setNewUnitIsListed(e.target.checked)}
                        />
                        is_listed
                      </label>
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={newUnitIsAvailable}
                          onChange={(e) => setNewUnitIsAvailable(e.target.checked)}
                        />
                        is_available
                      </label>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs">Notes (opcional)</label>
                      <textarea
                        className="border rounded w-full p-2 text-sm"
                        value={newUnitNotes}
                        onChange={(e) => setNewUnitNotes(e.target.value)}
                      />
                    </div>

                    <button
                      className="px-3 py-2 rounded bg-black text-white text-sm"
                      onClick={handleCreateUnit}
                    >
                      Crear unit
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-600">
                Selecciona una property para ver sus units.
              </p>
            )}

            {selectedUnit && (
              <div className="border rounded p-3 space-y-2">
                <h3 className="font-medium text-sm">Editar unit seleccionada</h3>

                <div className="grid gap-2 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs">Tipo</label>
                    <select
                      className="border rounded w-full p-2 text-sm"
                      value={unitType}
                      onChange={(e) =>
                        setUnitType(e.target.value as 'house' | 'apartment' | 'office')
                      }
                    >
                      <option value="house">house</option>
                      <option value="apartment">apartment</option>
                      <option value="office">office</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs">Rent price</label>
                    <input
                      className="border rounded w-full p-2 text-sm"
                      type="number"
                      value={unitRentPrice}
                      onChange={(e) => setUnitRentPrice(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs">Bedrooms</label>
                    <input
                      className="border rounded w-full p-2 text-sm"
                      type="number"
                      value={unitBedrooms}
                      onChange={(e) => setUnitBedrooms(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs">Bathrooms</label>
                    <input
                      className="border rounded w-full p-2 text-sm"
                      type="number"
                      value={unitBathrooms}
                      onChange={(e) => setUnitBathrooms(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={unitIsListed}
                      onChange={(e) => setUnitIsListed(e.target.checked)}
                    />
                    is_listed
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={unitIsAvailable}
                      onChange={(e) => setUnitIsAvailable(e.target.checked)}
                    />
                    is_available
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-xs">Notes</label>
                  <textarea
                    className="border rounded w-full p-2 text-sm"
                    value={unitNotes}
                    onChange={(e) => setUnitNotes(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs">Nueva photo URL (opcional)</label>
                  <input
                    className="border rounded w-full p-2 text-sm"
                    placeholder="https://..."
                    value={unitPhotoUrl}
                    onChange={(e) => setUnitPhotoUrl(e.target.value)}
                  />
                </div>

                <button
                  className="px-3 py-2 rounded bg-black text-white text-sm"
                  onClick={handleSaveUnit}
                >
                  Guardar unit
                </button>
              </div>
            )}
          </div>
        </div>
        </section>

        {/* Tenants */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-sm">
        <h2 className="text-lg font-semibold">Tenants</h2>

        <div className="grid gap-4 md:grid-cols-[1.5fr,2fr]">
          <div className="border rounded p-3 space-y-2">
            <h3 className="font-medium text-sm">Crear tenant</h3>

            <input
              className="border rounded w-full p-2 text-sm"
              placeholder="Email"
              value={tenantEmail}
              onChange={(e) => setTenantEmail(e.target.value)}
            />
            <input
              className="border rounded w-full p-2 text-sm"
              placeholder="Phone"
              value={tenantPhone}
              onChange={(e) => setTenantPhone(e.target.value)}
            />

            <select
              className="border rounded w-full p-2 text-sm"
              value={tenantUnitId}
              onChange={(e) => setTenantUnitId(e.target.value)}
            >
              <option value="">Selecciona unit</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.type} - {unit.bedrooms} beds · {unit.bathrooms} baths
                </option>
              ))}
            </select>

            <button
              className="px-3 py-2 rounded bg-black text-white text-sm"
              onClick={handleCreateTenant}
            >
              Crear tenant
            </button>
          </div>

          <div className="border rounded p-3 space-y-2">
            <h3 className="font-medium text-sm">Lista de tenants</h3>
            {tenants.length === 0 && (
              <p className="text-sm text-gray-600">Todavía no tienes tenants creados.</p>
            )}
            <ul className="text-sm space-y-1">
              {tenants.map((tenant) => {
                const unit = units.find((u) => u.id === tenant.unit_id)
                const displayName = tenant.full_name || tenant.email
                return (
                  <li key={tenant.id}>
                    <div className="font-medium">{displayName}</div>
                    <div className="text-xs text-gray-600">
                      Tel: {tenant.phone || 'N/A'} · Unidad:{' '}
                      {unit ? `${unit.type} - ${unit.bedrooms} beds` : 'Sin unidad'}
                    </div>
                    <div className="text-xs text-gray-600">
                      Rent: {tenant.rent_amount ? `$${tenant.rent_amount}` : 'N/A'} ·
                      Activo: {tenant.is_active !== false ? 'Sí' : 'No'} · Move-in:{' '}
                      {tenant.move_in_date
                        ? new Date(tenant.move_in_date).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
        </section>
      </div>
    </div>
  )
}
