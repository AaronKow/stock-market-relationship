export default function Card({ title, subtitle, action, className = '', children }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`.trim()}>
      {(title || subtitle || action) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
