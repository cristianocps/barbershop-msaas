import React from 'react';
import {
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    AlertCircle, Loader2, InboxIcon,
} from 'lucide-react';

const PAGE_SIZES = [5, 10, 25, 50];

function SkeletonRow({ cols }) {
    return (
        <tr className="animate-pulse">
            {[...Array(cols)].map((_, i) => (
                <td key={i} className="px-6 py-4">
                    <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                </td>
            ))}
        </tr>
    );
}

function SkeletonCard() {
    return (
        <div className="animate-pulse rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-3">
            <div className="h-2 bg-gray-200 w-full" />
            <div className="p-4 space-y-3">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-1" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div className="h-4 bg-gray-100 rounded-full w-1/2" />
                        <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                    </div>
                </div>
                <div className="h-3 bg-gray-100 rounded-full w-full mt-3" />
            </div>
        </div>
    );
}

function Pagination({ page, totalPages, total, pageSize, onPage, onPageSize }) {
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);

    const pages = () => {
        if (totalPages <= 5) return [...Array(totalPages)].map((_, i) => i + 1);
        if (page <= 3) return [1, 2, 3, 4, '...', totalPages];
        if (page >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        return [1, '...', page - 1, page, page + 1, '...', totalPages];
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-50" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-muted)', backgroundColor: 'var(--bg-card)'}}>
            <div className="flex items-center gap-2 text-sm text-gray-500" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <span>Exibindo</span>
                <select
                    value={pageSize}
                    onChange={(e) => onPageSize(Number(e.target.value))}
                    style={{ border: '1px solid var(--border-muted)', borderRadius: '8px', padding: '2px 8px', fontSize: '0.875rem' }}
                >
                    {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <span>de <strong>{total}</strong> registros ({from}–{to})</span>
            </div>

            <div className="flex items-center gap-1" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <button onClick={() => onPage(1)} disabled={page === 1}
                    style={{ padding: '6px', borderRadius: '8px', background: 'none', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.3 : 1 }}>
                    <ChevronsLeft size={16} />
                </button>
                <button onClick={() => onPage(page - 1)} disabled={page === 1}
                    style={{ padding: '6px', borderRadius: '8px', background: 'none', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.3 : 1 }}>
                    <ChevronLeft size={16} />
                </button>

                {pages().map((p, i) =>
                    p === '...' ? (
                        <span key={`ellipsis-${i}`} style={{ padding: '0 8px', color: 'var(--text-muted)' }}>…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPage(p)}
                            style={{
                                width: '32px', height: '32px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 'bold', border: 'none', cursor: 'pointer',
                                backgroundColor: p === page ? 'var(--accent-gold)' : 'transparent',
                                color: p === page ? 'var(--bg-header)' : 'var(--text-main)',
                                boxShadow: p === page ? '0 2px 8px rgba(246, 176, 1, 0.3)' : 'none'
                            }}
                        >
                            {p}
                        </button>
                    )
                )}

                <button onClick={() => onPage(page + 1)} disabled={page === totalPages || totalPages === 0}
                    style={{ padding: '6px', borderRadius: '8px', background: 'none', border: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.3 : 1 }}>
                    <ChevronRight size={16} />
                </button>
                <button onClick={() => onPage(totalPages)} disabled={page === totalPages || totalPages === 0}
                    style={{ padding: '6px', borderRadius: '8px', background: 'none', border: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.3 : 1 }}>
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
}

export function DataGrid({
    columns = [],
    data = [],
    loading = false,
    error = null,
    onRetry,
    page = 1,
    pageSize = 10,
    total = 0,
    onPage,
    onPageSize,
    renderCard,
    emptyIcon = <InboxIcon size={24} color="var(--text-muted)" />,
    emptyTitle = 'Nenhum registro encontrado',
    emptyMessage = 'Tente ajustar a busca ou adicione um novo registro.',
    loadingText = 'Atualizando...',
}) {
    const totalPages = Math.ceil(total / pageSize);
    const skeletonCount = Math.min(pageSize, 5);

    return (
        <div style={{ width: '100%' }}>
            {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.875rem' }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{error}</span>
                    {onRetry && (
                        <button onClick={onRetry} style={{ textDecoration: 'underline', fontWeight: 'bold', background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer' }}>
                            Tentar novamente
                        </button>
                    )}
                </div>
            )}

            {/* DESKTOP TABLE */}
            <div className="datagrid-desktop" style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-muted)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                        <thead style={{ backgroundColor: 'var(--bg-dark)', borderBottom: '1px solid var(--border-muted)' }}>
                            <tr>
                                {columns.map((col, i) => (
                                    <th
                                        key={col.label ?? i}
                                        style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', textAlign: col.align || 'left', width: col.width }}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody style={{ divideY: '1px solid var(--border-muted)' }}>
                            {loading ? (
                                [...Array(skeletonCount)].map((_, i) => (
                                    <SkeletonRow key={i} cols={columns.length} />
                                ))
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '56px', height: '56px', backgroundColor: 'var(--bg-dark)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {emptyIcon}
                                            </div>
                                            <p style={{ fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>{emptyTitle}</p>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>{emptyMessage}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, idx) => {
                                    if (!row) return null;
                                    return (
                                        <tr key={row.id ?? row.ID ?? idx} className="hover:bg-slate-50/5 hover-row-dark transition-all duration-200" style={{ borderBottom: '1px solid var(--border-muted)' }}>
                                            {columns.map((col, ci) => (
                                                <td
                                                    key={col.label ?? ci}
                                                    style={{ padding: '1rem 1.5rem', textAlign: col.align || 'left' }}
                                                >
                                                    {col.render ? col.render(row, idx) : row[col.key]}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && !error && (
                    <Pagination
                        page={page} totalPages={totalPages} total={total}
                        pageSize={pageSize} onPage={onPage} onPageSize={onPageSize}
                    />
                )}
            </div>

            {/* MOBILE CARDS */}
            <div className="datagrid-mobile">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {loading ? (
                        [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                    ) : data.length === 0 ? (
                        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-muted)', padding: '2.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--bg-dark)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                {emptyIcon}
                            </div>
                            <p style={{ fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>{emptyTitle}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>{emptyMessage}</p>
                        </div>
                    ) : (
                        data.map((row, idx) => (
                            renderCard
                                ? <React.Fragment key={row.id ?? row.ID ?? idx}>{renderCard(row, idx)}</React.Fragment>
                                : <div key={idx} style={{padding: '1rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-muted)'}}>Linha {idx} (Passe renderCard prop)</div>
                        ))
                    )}
                </div>

                {!loading && !error && total > 0 && (
                    <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-muted)', marginTop: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <Pagination
                            page={page} totalPages={totalPages} total={total}
                            pageSize={pageSize} onPage={onPage} onPageSize={onPageSize}
                        />
                    </div>
                )}
            </div>

            {loading && data.length > 0 && (
                <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50, backgroundColor: 'var(--bg-header)', color: '#fff', fontSize: '0.875rem', fontWeight: 'bold', padding: '10px 16px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Loader2 size={16} className="animate-spin text-[#FFC107]" />
                    {loadingText}
                </div>
            )}
        </div>
    );
}
