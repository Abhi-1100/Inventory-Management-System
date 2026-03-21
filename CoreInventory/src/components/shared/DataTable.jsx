'use client';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

export default function DataTable({
  data = [],
  columns = [],
  loading = false,
  total = 0,
  page = 1,
  limit = 20,
  onPageChange,
  onRowClick,
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / limit),
  });

  const totalPages = Math.ceil(total / limit);

  if (loading) return <LoadingSpinner />;
  if (!loading && data.length === 0) return <EmptyState />;

  const visiblePages = [];
  const maxVisible = 3;
  let start = Math.max(1, page - 1);
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
  for (let i = start; i <= end; i++) visiblePages.push(i);

  return (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-sm"
      style={{ border: '1px solid #e2e8f0' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-xs font-bold uppercase tracking-wider"
                    style={{ color: '#334155' }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, idx) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={`transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                style={{ borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none' }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(248,250,252,0.8)'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 text-sm" style={{ color: '#475569' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}
      >
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} products
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            {/* Prev */}
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page === 1}
              className="p-2 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ border: '1px solid #e2e8f0' }}
              onMouseOver={(e) => { if (page !== 1) e.currentTarget.style.backgroundColor = '#ffffff'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <ChevronLeft size={16} style={{ color: '#64748b' }} />
            </button>

            {/* Page numbers */}
            {visiblePages.map((p) => (
              <button
                key={p}
                onClick={() => onPageChange?.(p)}
                className="w-8 h-8 flex items-center justify-center rounded text-sm font-bold transition-colors"
                style={{
                  backgroundColor: p === page ? '#f07c28' : 'transparent',
                  color: p === page ? '#ffffff' : '#64748b',
                }}
                onMouseOver={(e) => { if (p !== page) e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
                onMouseOut={(e) => { if (p !== page) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {p}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ border: '1px solid #e2e8f0' }}
              onMouseOver={(e) => { if (page !== totalPages) e.currentTarget.style.backgroundColor = '#ffffff'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <ChevronRight size={16} style={{ color: '#64748b' }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
