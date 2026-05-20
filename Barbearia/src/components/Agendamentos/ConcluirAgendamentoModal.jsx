import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FormModal, FormField } from '../UI/FormModal';
import { AgendamentosService, TIPO_PAGAMENTO } from '../../services/Agendamentos/AgendamentosService';
import { useToast } from '../../contexts/ToastContext';

const OPCOES = [
    { value: TIPO_PAGAMENTO.DINHEIRO, label: 'Dinheiro' },
    { value: TIPO_PAGAMENTO.CARTAO_CREDITO, label: 'Cartão de crédito (presencial)' },
    { value: TIPO_PAGAMENTO.CARTAO_DEBITO, label: 'Cartão de débito (presencial)' },
    { value: TIPO_PAGAMENTO.PIX_MANUAL, label: 'PIX (comprovante manual)' },
    { value: TIPO_PAGAMENTO.PIX_INFINITE, label: 'PIX via Link Infinite Pay' },
    { value: TIPO_PAGAMENTO.INFINITE_TAP, label: 'Tap Infinite Pay (celular)' },
];

export function ConcluirAgendamentoModal({ open, agendamento, onClose, onSuccess }) {
    const toast = useToast();
    const [tipo, setTipo] = useState(TIPO_PAGAMENTO.DINHEIRO);
    const [parcelas, setParcelas] = useState(1);
    const [comprovante, setComprovante] = useState('');
    const [observacao, setObservacao] = useState('');
    const [saving, setSaving] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [tapUrl, setTapUrl] = useState('');

    const id = agendamento?.id ?? agendamento?.ID ?? agendamento?.Id ?? 0;
    const valor = Number(agendamento?.valorTotal ?? agendamento?.ValorTotal ?? 0);

    const reset = () => {
        setTipo(TIPO_PAGAMENTO.DINHEIRO);
        setParcelas(1);
        setComprovante('');
        setObservacao('');
        setLinkUrl('');
        setTapUrl('');
    };

    const handleClose = () => {
        reset();
        onClose?.();
    };

    const concluirDireto = async () => {
        setSaving(true);
        try {
            await AgendamentosService.concluir(id, {
                tipoPagamento: tipo,
                valor: valor || undefined,
                parcelas: tipo === TIPO_PAGAMENTO.INFINITE_TAP || tipo === TIPO_PAGAMENTO.CARTAO_CREDITO ? parcelas : undefined,
                comprovanteUrl: comprovante || undefined,
                observacao: observacao || undefined,
            });
            toast.success('Agendamento concluído com sucesso!');
            handleClose();
            onSuccess?.();
        } catch (err) {
            toast.error(err.message || 'Erro ao concluir agendamento.');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!id) return;

        if (tipo === TIPO_PAGAMENTO.PIX_INFINITE) {
            setSaving(true);
            try {
                const { url } = await AgendamentosService.gerarLinkPagamento(id);
                setLinkUrl(url);
                toast.success('Link de pagamento gerado. Envie ao cliente.');
            } catch (err) {
                toast.error(err.message || 'Erro ao gerar link Infinite Pay.');
            } finally {
                setSaving(false);
            }
            return;
        }

        if (tipo === TIPO_PAGAMENTO.INFINITE_TAP) {
            setSaving(true);
            try {
                const metodo = parcelas > 1 ? 'credit' : 'credit';
                const { tapUrl: url } = await AgendamentosService.obterTapUrl(id, metodo, parcelas);
                setTapUrl(url);
                const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
                if (isMobile) window.location.href = url;
                else toast.success('URL Tap gerada — use o QR abaixo no celular com o app InfinitePay.');
            } catch (err) {
                toast.error(err.message || 'Erro ao gerar Tap.');
            } finally {
                setSaving(false);
            }
            return;
        }

        await concluirDireto();
    };

    const handleComprovanteFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setComprovante(reader.result);
        reader.readAsDataURL(file);
    };

    return (
        <FormModal
            open={open}
            onClose={handleClose}
            title="Concluir agendamento"
            subtitle="Registre o pagamento para finalizar o atendimento"
            onSave={handleSave}
            saving={saving}
            saveLabel={
                tipo === TIPO_PAGAMENTO.PIX_INFINITE ? 'Gerar link de pagamento'
                : tipo === TIPO_PAGAMENTO.INFINITE_TAP ? 'Gerar pagamento Tap'
                : 'Concluir e registrar pagamento'
            }
        >
            <div style={{ marginBottom: '12px', padding: '10px 14px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                <span style={{ fontSize: '0.8rem', color: '#166534' }}>Valor total</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>
                    R$ {(valor || 0).toFixed(2).replace('.', ',')}
                </div>
            </div>

            <FormField label="Forma de pagamento" required>
                <select className="fm-select" value={tipo} onChange={(e) => { setTipo(parseInt(e.target.value)); setLinkUrl(''); setTapUrl(''); }}>
                    {OPCOES.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </FormField>

            {(tipo === TIPO_PAGAMENTO.CARTAO_CREDITO || tipo === TIPO_PAGAMENTO.INFINITE_TAP) && (
                <FormField label="Parcelas">
                    <select className="fm-select" value={parcelas} onChange={(e) => setParcelas(parseInt(e.target.value))}>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>{n}x</option>
                        ))}
                    </select>
                </FormField>
            )}

            {tipo === TIPO_PAGAMENTO.PIX_MANUAL && (
                <FormField label="Comprovante PIX" hint="Opcional">
                    <input type="file" accept="image/*" className="fm-input" onChange={handleComprovanteFile} />
                </FormField>
            )}

            {linkUrl && (
                <FormField label="Link Infinite Pay">
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input className="fm-input" readOnly value={linkUrl} style={{ flex: 1 }} />
                        <button type="button" className="fm-btn fm-btn-primary" onClick={() => { navigator.clipboard?.writeText(linkUrl); toast.success('Link copiado!'); }}>
                            Copiar
                        </button>
                    </div>
                    <a href={linkUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#2563eb' }}>Abrir checkout</a>
                </FormField>
            )}

            {tapUrl && (
                <FormField label="Tap Infinite Pay — escaneie no celular">
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                        }}
                    >
                        <div
                            style={{
                                padding: '12px',
                                background: '#fff',
                                borderRadius: '10px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            }}
                        >
                            <QRCodeSVG value={tapUrl} size={220} level="M" marginSize={2} />
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#4b5563', textAlign: 'center', lineHeight: 1.5 }}>
                            Escaneie com o celular que tem o <strong>InfinitePay</strong> instalado.
                            Após o pagamento, o agendamento será concluído automaticamente.
                        </p>
                        <button
                            type="button"
                            className="fm-btn fm-btn-secondary"
                            style={{ fontSize: '0.8rem' }}
                            onClick={() => {
                                navigator.clipboard?.writeText(tapUrl);
                                toast.success('Link do Tap copiado!');
                            }}
                        >
                            Copiar link do Tap
                        </button>
                    </div>
                </FormField>
            )}

            <FormField label="Observações">
                <textarea className="fm-textarea" rows={2} value={observacao} onChange={(e) => setObservacao(e.target.value)} />
            </FormField>
        </FormModal>
    );
}
