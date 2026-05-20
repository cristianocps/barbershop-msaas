import React, { useState } from 'react';
import { FormModal, FormField } from '../UI/FormModal';

export function CancelarAgendamentoModal({ open, onClose, onConfirm, loading }) {
    const [motivo, setMotivo] = useState('');

    const handleClose = () => {
        setMotivo('');
        onClose?.();
    };

    const handleConfirm = () => {
        onConfirm?.(motivo.trim());
    };

    return (
        <FormModal
            open={open}
            onClose={handleClose}
            title="Cancelar agendamento"
            subtitle="O horário será liberado no calendário. O motivo é opcional."
            onSave={handleConfirm}
            saving={loading}
            saveLabel="Confirmar cancelamento"
        >
            <FormField label="Motivo do cancelamento" hint="Opcional">
                <textarea
                    className="fm-textarea"
                    rows={3}
                    placeholder="Ex.: Cliente desmarcou, conflito de horário..."
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                />
            </FormField>
        </FormModal>
    );
}
