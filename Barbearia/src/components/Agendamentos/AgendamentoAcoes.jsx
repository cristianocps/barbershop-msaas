import React from 'react';
import { Check, Edit2, XCircle, DollarSign, Eye } from 'lucide-react';

const btnStyle = (bg, color, border) => ({
    width: '34px',
    height: '34px',
    borderRadius: '9px',
    background: bg,
    color,
    border: `1px solid ${border}`,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

export function AgendamentoAcoes({ row, onEdit, onConfirmar, onConcluir, onCancelar, onVerPagamento, onVerMotivo }) {
    const id = row?.id || row?.ID || row?.Id;
    const st = row?.status ?? row?.Status ?? 0;

    return (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {st === 0 && (
                <button type="button" title="Confirmar" onClick={() => onConfirmar?.(row)} style={btnStyle('rgba(59,130,246,0.1)', '#2563eb', 'rgba(59,130,246,0.2)')}>
                    <Check size={14} />
                </button>
            )}
            {(st === 0 || st === 1) && (
                <>
                    <button type="button" title="Concluir" onClick={() => onConcluir?.(row)} style={btnStyle('rgba(34,197,94,0.1)', '#16a34a', 'rgba(34,197,94,0.2)')}>
                        <DollarSign size={14} />
                    </button>
                    <button type="button" title="Editar" onClick={() => onEdit?.(row)} style={btnStyle('rgba(246,176,1,0.1)', '#e09800', 'rgba(246,176,1,0.2)')}>
                        <Edit2 size={14} />
                    </button>
                    <button type="button" title="Cancelar" onClick={() => onCancelar?.(row)} style={btnStyle('rgba(239,68,68,0.08)', '#ef4444', 'rgba(239,68,68,0.15)')}>
                        <XCircle size={14} />
                    </button>
                </>
            )}
            {st === 2 && (
                <button type="button" title="Ver pagamento" onClick={() => onVerPagamento?.(row)} style={btnStyle('rgba(34,197,94,0.08)', '#16a34a', 'rgba(34,197,94,0.15)')}>
                    <Eye size={14} />
                </button>
            )}
            {st === 3 && (
                <button type="button" title="Ver motivo" onClick={() => onVerMotivo?.(row)} style={btnStyle('#f3f4f6', '#6b7280', '#e5e7eb')}>
                    <Eye size={14} />
                </button>
            )}
        </div>
    );
}
