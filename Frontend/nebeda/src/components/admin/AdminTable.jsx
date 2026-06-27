function AdminTable({ columns, rows, emptyMessage }) {
  if (!rows.length) {
    return (
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-6 py-14 text-center">
        <p className="font-serif text-2xl text-white">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04]">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[900px] text-left">
          <thead className="border-b border-white/10 bg-white/[0.035]">
            <tr>
              {columns.map((column) => (
                <th
                  className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]"
                  key={column.key}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-b border-white/10 last:border-b-0" key={row.id}>
                {columns.map((column) => (
                  <td className="px-5 py-5 align-top text-sm text-white/78" key={column.key}>
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 p-4 lg:hidden">
        {rows.map((row) => (
          <article className="rounded-2xl border border-white/10 bg-black/35 p-4" key={row.id}>
            {columns.map((column) => (
              <div className="border-b border-white/10 py-3 last:border-b-0" key={column.key}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
                  {column.label}
                </p>
                <div className="mt-2 text-sm text-white/82">{row[column.key]}</div>
              </div>
            ))}
          </article>
        ))}
      </div>
    </div>
  )
}

export default AdminTable
