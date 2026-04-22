/*
 * جدول البيانات العام - رمز الإبداع
 * جدول متجاوب مع بحث وفلترة وترقيم صفحات
 */
import { useState, useMemo } from 'react';
import { Search, ChevronRight, ChevronLeft, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  searchable?: boolean;
  searchKeys?: string[];
  pageSize?: number;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
  actions?: (row: any) => React.ReactNode;
}

export default function DataTable({
  columns,
  data,
  searchable = true,
  searchKeys = [],
  pageSize = 10,
  emptyMessage = 'لا توجد بيانات',
  onRowClick,
  actions,
}: DataTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!search) return data;
    const term = search.toLowerCase();
    return data.filter(row =>
      searchKeys.some(key => {
        const val = row[key];
        return val && String(val).toLowerCase().includes(term);
      }) || columns.some(col => {
        const val = row[col.key];
        return val && String(val).toLowerCase().includes(term);
      })
    );
  }, [data, search, searchKeys, columns]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="space-y-3">
      {/* Search */}
      {searchable && (
        <div className="relative max-w-sm">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="w-full h-9 pr-9 pl-4 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              {columns.map(col => (
                <th key={col.key} className={cn('px-4 py-3 text-right text-xs font-medium text-muted-foreground', col.className)}>
                  {col.label}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground w-24">إجراءات</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paged.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'transition-colors',
                  onRowClick ? 'cursor-pointer hover:bg-accent/50' : 'hover:bg-muted/30'
                )}
              >
                {columns.map(col => (
                  <td key={col.key} className={cn('px-4 py-3 text-foreground', col.className)}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards - Mobile */}
      <div className="md:hidden space-y-2">
        {paged.map((row, i) => (
          <div
            key={row.id || i}
            onClick={() => onRowClick?.(row)}
            className={cn(
              'bg-card border border-border rounded-lg p-3 space-y-2',
              onRowClick ? 'cursor-pointer active:bg-accent/50' : ''
            )}
          >
            {columns.slice(0, 4).map(col => (
              <div key={col.key} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground text-xs">{col.label}</span>
                <span className="text-foreground font-medium">
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </span>
              </div>
            ))}
            {actions && (
              <div className="pt-2 border-t border-border flex justify-end" onClick={e => e.stopPropagation()}>
                {actions(row)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {paged.length === 0 && (
        <div className="text-center py-12">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663078821712/Zm2JEbmeVFTJRp6HMZVTym/empty-state-Sq3NBpCqRd537bzdY2kFzF.webp"
            alt="لا توجد بيانات"
            className="w-24 h-24 mx-auto mb-3 opacity-50"
          />
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {filtered.length} نتيجة — صفحة {page + 1} من {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-md hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed text-muted-foreground"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-md hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed text-muted-foreground"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
