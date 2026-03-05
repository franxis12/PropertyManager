import { Link } from 'react-router-dom'

export default function Info() {
  const year = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Property Manager</h1>
            <p className="text-xs text-slate-600">
              Simple terms, clear privacy, quick answers.
            </p>
          </div>
          <Link
            to="/"
            className="text-xs px-3 py-1.5 rounded-full border border-slate-300 bg-white hover:border-indigo-500 hover:text-indigo-600 transition"
          >
            Back to landing
          </Link>
        </header>

        <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
          <h2 className="text-lg font-semibold">Terms of Use</h2>
          <p className="text-sm text-slate-700">
            This project is a simple demo-style property manager. It is not a replacement
            for legal contracts or professional advice. By using the app you agree that:
          </p>
          <ul className="text-sm text-slate-700 list-disc list-inside space-y-1">
            <li>You are responsible for the accuracy of the data you enter.</li>
            <li>You must comply with local laws for rentals, payments and notices.</li>
            <li>This app does not process real payments. Marking a payment as “paid” is only a record.</li>
            <li>Maintenance tickets are only a communication tool between owner and tenant.</li>
          </ul>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
          <h2 className="text-lg font-semibold">Privacy & Data</h2>
          <p className="text-sm text-slate-700">
            Property Manager stores basic data about owners, tenants, leases, payments and
            maintenance tickets in Supabase. For a real production app you should update
            this section with your own legal privacy policy.
          </p>
          <ul className="text-sm text-slate-700 list-disc list-inside space-y-1">
            <li>
              We store: names, emails, phones, property data, units, leases, basic payment
              records and maintenance ticket descriptions.
            </li>
            <li>
              We do not charge cards or handle banking information in this demo.
            </li>
            <li>
              You can delete test data directly from the Supabase dashboard while you develop.
            </li>
          </ul>
          <p className="text-[11px] text-slate-500">
            Important: adapt this text with a real lawyer before using this app in
            production.
          </p>
        </section>

        <section
          id="faqs"
          className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm"
        >
          <h2 className="text-lg font-semibold">FAQs</h2>
          <div className="space-y-3 text-sm text-slate-700">
            <div>
              <p className="font-medium">Is this app ready for real tenants?</p>
              <p>
                No. It is intentionally simple so you can learn and evolve it. You should
                add your own auth flows, emails, PDF leases and real payment integrations
                before using it with real customers.
              </p>
            </div>

            <div>
              <p className="font-medium">Where is my data stored?</p>
              <p>
                All data is stored in your own Supabase project. If you delete the
                project, the data goes away.
              </p>
            </div>

            <div>
              <p className="font-medium">Can tenants see each other&apos;s data?</p>
              <p>
                No. Row Level Security (RLS) is configured so that each tenant only sees
                their own lease, payments and tickets.
              </p>
            </div>

            <div>
              <p className="font-medium">Can owners see other owners&apos; properties?</p>
              <p>
                No. Every query filters by <code>owner_id = auth.uid()</code>, so each
                owner only manages their own portfolio.
              </p>
            </div>
          </div>
        </section>

        <section
          id="contact"
          className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm"
        >
          <h2 className="text-lg font-semibold">Contact & Feedback</h2>
          <p className="text-sm text-slate-700">
            This project is designed as a learning playground. To adapt it to your own
            business you can:
          </p>
          <ul className="text-sm text-slate-700 list-disc list-inside space-y-1">
            <li>Clone the repository and customize the UI and flows.</li>
            <li>Add stronger validation, email notifications and more detailed reports.</li>
            <li>Work with a designer to refine the look and feel even more.</li>
          </ul>
          <p className="text-[11px] text-slate-500">
            Demo year {year}. Feel free to change this text to match your own brand.
          </p>
        </section>
      </div>
    </div>
  )
}

