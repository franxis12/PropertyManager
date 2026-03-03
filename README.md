## Property Manager – Supabase + React

Aplicación web sencilla para gestionar propiedades en renta, con dos roles:

- `OWNER` (dueño): administra propiedades, units y tenants, ve pagos y averías.
- `TENANT` (inquilino): ve su lease, marca pagos mensuales como pagados y crea tickets de averías.

El landing público muestra las units disponibles y permite enviar aplicaciones básicas.

---

## Stack

- React + TypeScript (Vite)
- React Router DOM
- Tailwind CSS
- Supabase (`@supabase/supabase-js`)
- @tanstack/react-query (usado solo para el provider global)
- Opcionales instalados pero no usados todavía: `react-hook-form`, `dayjs`, `sonner`

No se agregan dependencias nuevas fuera de estas.

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con:

```bash
VITE_SUPABASE_URL=https://TU-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
```

En Supabase, crea las tablas y políticas RLS usando el SQL incluido en la documentación de este proyecto (ver sección “Base de datos (Supabase)” en las instrucciones de ChatGPT).

---

## Cómo correr el proyecto

Instala dependencias (solo la primera vez):

```bash
npm install
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Luego abre el navegador en la URL que muestre Vite (por defecto `http://localhost:5173`).

Para un build de producción:

```bash
npm run build
```

Y para previsualizar el build:

```bash
npm run preview
```

---

## Estructura del proyecto

Ramas principales:

- `src/app`
  - `supabaseClient.ts`: cliente de Supabase configurado con las variables de entorno.
  - `queryClient.ts`: instancia de `QueryClient` (react-query).
  - `providers.tsx`: envuelve la app con `QueryClientProvider` y `AuthProvider`.
  - `AuthContext.tsx`: contexto simple con `user`, `profile` (role) y `loading`.
- `src/components`
  - `RequireAuth.tsx`: guard sencillo para rutas protegidas por rol (`owner` o `tenant`).
- `src/routes`
  - `Home.tsx`: landing pública, lista units disponibles + formulario de aplicación.
  - `Login.tsx`: login de `OWNER`, redirige a `/owner/dashboard`.
  - `OwnerDashboard.tsx`: dashboard del dueño (resumen, propiedades, units, tenants).
  - `TenantRegister.tsx`: registro de tenants (email + password + datos básicos).
  - `TenantLogin.tsx`: login del tenant, redirige a `/tenant/portal`.
  - `TenantPortal.tsx`: portal del tenant (pagos mensuales y tickets de averías).
  - `CreatePropertyTest.tsx`: pantalla de test simple para crear properties (puede usarse como prueba de conexión).
- `src/App.tsx`: definición de rutas públicas y protegidas.
- `src/main.tsx`: punto de entrada de React.
- `src/index.css`: estilos base + Tailwind.

---

## Flujo principal

- Landing (`/`):
  - Lee `units` con `is_listed = true` e `is_available = true`.
  - Muestra tipo, precio, bedrooms, bathrooms y primera foto (si existe).
  - Formulario simple de “Apply” que crea un registro en `applications`.

- Owner:
  - Login en `/login`.
  - `profiles.role = 'owner'`.
  - Rutas protegidas con `<RequireAuth role="owner">`.
  - Dashboard `/owner/dashboard`:
    - Resumen de pagos del mes, leases sin pago, leases que vencen pronto y tickets abiertos.
    - Gestión de propiedades y units (campos básicos + flags `is_listed`/`is_available`).
    - Creación de tenants asignando `email`, `phone` y `unit`.

- Tenant:
  - Owner crea primero un registro en `tenants` con el email del futuro tenant.
  - Tenant se registra en `/tenant/register` con el mismo email:
    - Se crea/actualiza `profiles` con rol `tenant`.
    - Se asocia `tenants.user_id` con el `auth.uid()` del tenant.
  - Login en `/tenant/login` (también asegura perfil tenant).
  - Portal `/tenant/portal`:
    - Muestra lease actual (si existe).
    - Pagos:
      - Calcula mes actual.
      - Si no hay pago para ese mes → permite crear un `payment` con `status = "paid"`.
      - Si existe y no está pagado → permite marcarlo como `paid`.
    - Averías:
      - Formulario para crear tickets (`maintenance_tickets`).
      - Lista de tickets del tenant.

---

## Roadmap futuro

Ideas para siguientes versiones:

- Validaciones más robustas en formularios (usar `react-hook-form` + `zod`).
- Soporte para múltiples leases históricos por tenant (listado completo).
- Panel de administración para ver y actualizar el estado de `maintenance_tickets`.
- Envío de emails al owner cuando llega una nueva `application` o `ticket`.
- Filtros y búsqueda en el landing público.
- Soporte para subir imágenes reales a Supabase Storage en lugar de URLs.

Este README está pensado para ser entendible por alguien que está empezando, por eso el código y los patrones se mantienen simples y explícitos.
