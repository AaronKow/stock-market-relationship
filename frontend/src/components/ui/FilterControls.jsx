export default function FilterControls({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  showSearch = true,
  children,
  rightContent,
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
      {showSearch && (
        <input
          className="min-w-[220px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-1"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      )}
      {children}
      {rightContent && <div className="ml-auto">{rightContent}</div>}
    </div>
  );
}
