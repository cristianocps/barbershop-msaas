import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronDown, Search, Loader2, Check } from 'lucide-react';

export function ComboSelect({
    value,
    onChange,
    fetchOptions,
    icon = null,
    placeholder = 'Selecione...',
    searchPlaceholder = 'Buscar...',
    disabled = false,
    className = '',
    minimal = false,
    initialLabel = '',
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null); 
    const containerRef = useRef(null);
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (open) setTimeout(() => searchRef.current?.focus(), 60);
    }, [open]);

    const load = useCallback(async (q) => {
        if (!fetchOptions) return;
        setLoading(true);
        try {
            const res = await fetchOptions(q, 1);
            const list = res?.data || res?.Data || res?.results || (Array.isArray(res) ? res : []);
            setOptions(list);
        } catch {
            setOptions([]);
        } finally {
            setLoading(false);
        }
    }, [fetchOptions]);

    useEffect(() => {
        if (!open) return;
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => load(search), 300);
        return () => clearTimeout(debounceRef.current);
    }, [search, open, load]);

    useEffect(() => {
        if (value && initialLabel) {
            setSelected({ id: value, text: initialLabel });
        } else if (!value) {
            setSelected(null);
        }
    }, [value, initialLabel]);

    const select = (opt) => {
        setSelected(opt);
        onChange?.(opt.id, opt);
        setOpen(false);
        setSearch('');
    };

    const clear = (e) => {
        e.stopPropagation();
        setSelected(null);
        onChange?.('', null);
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setOpen((o) => !o)}
                className={minimal ? 'p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center' : [
                    'input-premium w-full flex items-center gap-2 text-left pr-10',
                    open ? 'ring-2 ring-[#FFC107]/50 border-[#FFC107]' : '',
                    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                ].join(' ')}
                style={!minimal ? { padding: '1.25rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-muted)', borderRadius: '16px', outline: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' } : {}}
            >
                {icon && <span className={minimal ? '' : 'text-gray-400 flex-shrink-0'}>{icon}</span>}

                {!minimal && (
                    <>
                        {selected ? (
                            <span className="flex-1 font-semibold text-gray-900 capitalize text-sm truncate">
                                {selected.text}
                            </span>
                        ) : (
                            <span className="flex-1 text-gray-400 text-sm">{placeholder}</span>
                        )}

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {selected && !disabled && (
                                <button
                                    type="button"
                                    onClick={clear}
                                    className="p-0.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                                    aria-label="Limpar seleção"
                                >
                                    <X size={14} />
                                </button>
                            )}
                            <ChevronDown
                                size={16}
                                className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                            />
                        </span>
                    </>
                )}
            </button>

            {open && (
                <div className="absolute z-50 mt-1.5 w-full bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden" style={{animation: 'fadeIn 0.2s ease'}}>
                    <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                ref={searchRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC107]/40 focus:border-[#FFC107] transition-all"
                            />
                        </div>
                    </div>
                    <ul className="max-h-52 overflow-y-auto py-1">
                        {loading ? (
                            <li className="flex items-center justify-center gap-2 py-6 text-gray-400 text-sm">
                                <Loader2 size={16} className="animate-spin text-[#FFC107]" />
                                Carregando...
                            </li>
                        ) : options.length === 0 ? (
                            <li className="py-6 text-center text-gray-400 text-sm">
                                Nenhum resultado encontrado
                            </li>
                        ) : (
                            options.map((opt) => {
                                const isSel = selected?.id === opt.id;
                                return (
                                    <li key={opt.id}>
                                        <button
                                            type="button"
                                            onClick={() => select(opt)}
                                            className={[
                                                'w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors',
                                                isSel
                                                    ? 'bg-[#FFC107]/10 text-[#b38600] font-semibold'
                                                    : 'text-gray-700 hover:bg-gray-50',
                                            ].join(' ')}
                                        >
                                            {icon && (
                                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isSel ? 'bg-[#FFC107] text-[#1a1a1a]' : 'bg-gray-100 text-gray-400'}`}>
                                                    {icon}
                                                </span>
                                            )}
                                            <span className="flex-1 capitalize">{opt.text}</span>
                                            {isSel && <Check size={14} className="text-[#b38600] flex-shrink-0" />}
                                        </button>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
