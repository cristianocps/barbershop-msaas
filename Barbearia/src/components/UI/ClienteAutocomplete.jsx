import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, User, X } from 'lucide-react';
import { ClientesService } from '../../services/Configuracoes/ClientesService';

function pick(row, ...keys) {
    for (const k of keys) {
        if (row?.[k] !== undefined && row?.[k] !== null) return row[k];
    }
    return undefined;
}

function normalizeCliente(row) {
    if (!row) return null;
    return {
        id: pick(row, 'id', 'ID', 'Id') ?? 0,
        descricao: pick(row, 'descricao', 'Descricao') ?? '',
        telefone: pick(row, 'telefone', 'Telefone') ?? '',
        cpf: pick(row, 'cpf', 'Cpf') ?? '',
    };
}

export function ClienteAutocomplete({
    idCliente = 0,
    nome = '',
    telefone = '',
    cpf = '',
    onChange,
    disabled = false,
}) {
    const wrapRef = useRef(null);
    const debounceRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [linked, setLinked] = useState(Number(idCliente) > 0);

    useEffect(() => {
        setLinked(Number(idCliente) > 0);
    }, [idCliente]);

    const emit = useCallback((patch) => {
        onChange?.({
            idCliente: patch.idCliente ?? idCliente ?? 0,
            descricao: patch.descricao ?? nome,
            telefone: patch.telefone ?? telefone,
            cpf: patch.cpf ?? cpf,
        });
    }, [onChange, idCliente, nome, telefone, cpf]);

    const runSearch = useCallback(async (term) => {
        const q = (term || '').trim();
        if (q.length < 2) {
            setResults([]);
            return;
        }
        setLoading(true);
        try {
            const res = await ClientesService.buscar(q, 15);
            const list = res?.Data ?? res?.data ?? [];
            setResults(Array.isArray(list) ? list.map(normalizeCliente).filter(Boolean) : []);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleNomeChange = (value) => {
        setLinked(false);
        emit({ idCliente: 0, descricao: value });
        setOpen(true);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => runSearch(value), 320);
    };

    const selectCliente = (client) => {
        setLinked(true);
        setOpen(false);
        setResults([]);
        emit({
            idCliente: client.id,
            descricao: client.descricao,
            telefone: client.telefone || telefone,
            cpf: client.cpf || '',
        });
    };

    const clearVinculo = () => {
        setLinked(false);
        emit({ idCliente: 0 });
    };

    useEffect(() => {
        const onDocClick = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    useEffect(() => () => clearTimeout(debounceRef.current), []);

    return (
        <div className="cliente-ac-wrap" ref={wrapRef}>
            <div className="cliente-ac-input-row">
                <User size={16} className="cliente-ac-icon" aria-hidden />
                <input
                    className="fm-input cliente-ac-input"
                    type="text"
                    placeholder="Nome, CPF ou celular..."
                    value={nome}
                    disabled={disabled}
                    autoComplete="off"
                    onChange={(e) => handleNomeChange(e.target.value)}
                    onFocus={() => {
                        if ((nome || '').trim().length >= 2) {
                            setOpen(true);
                            runSearch(nome);
                        }
                    }}
                />
                {linked && (
                    <button
                        type="button"
                        className="cliente-ac-clear"
                        title="Desvincular cadastro"
                        onClick={clearVinculo}
                        disabled={disabled}
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {linked && (
                <span className="cliente-ac-linked">Vinculado ao cadastro de clientes</span>
            )}

            {open && !disabled && (
                <div className="cliente-ac-dropdown" role="listbox">
                    {loading && (
                        <div className="cliente-ac-hint">
                            <Loader2 size={14} className="cal-spin" /> Buscando...
                        </div>
                    )}
                    {!loading && (nome || '').trim().length < 2 && (
                        <div className="cliente-ac-hint">Digite ao menos 2 caracteres</div>
                    )}
                    {!loading && (nome || '').trim().length >= 2 && results.length === 0 && (
                        <div className="cliente-ac-hint">
                            Nenhum cliente encontrado — será criado ao salvar o agendamento
                        </div>
                    )}
                    {!loading && results.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            className="cliente-ac-option"
                            role="option"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => selectCliente(c)}
                        >
                            <span className="cliente-ac-option-name">{c.descricao}</span>
                            <span className="cliente-ac-option-meta">
                                {[c.telefone, c.cpf ? `CPF ${c.cpf}` : ''].filter(Boolean).join(' · ')}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
