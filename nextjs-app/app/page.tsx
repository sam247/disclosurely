export const dynamic = "force-static";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-16">
      <section className="flex flex-col gap-4">
        <p className="text-sm font-medium uppercase tracking-wide text-indigo-500">
          Hybrid migration
        </p>
        <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
          Public site on Next.js, dashboard stays on Vite.
        </h1>
        <p className="max-w-3xl text-lg text-slate-700">
          This is the new Next.js surface for SEO-critical pages. Dashboard
          routes continue to live in the Vite app and are forwarded via rewrites
          to the internal dashboard deployment.
        </p>
      </section>

      <section className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-6">
        <div className="text-sm font-semibold text-slate-800">
          What to migrate first
        </div>
        <ul className="list-disc space-y-2 pl-5 text-slate-700">
          <li>Marketing pages (home, pricing, features, comparisons)</li>
          <li>Blog (Contentful, ISR)</li>
          <li>Anonymous reporting pages (/report, /status)</li>
          <li>Auth pages (/login, /signup, /invite)</li>
          <li>Docs via MDX</li>
        </ul>
        <p className="text-sm text-slate-600">
          See `.cursor/plans/vite_to_next.js_migration_c12cf2c2.plan.md` for the
          full checklist and route mapping.
        </p>
      </section>
    </main>
  );
}

