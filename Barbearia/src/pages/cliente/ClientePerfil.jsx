import React, { useEffect, useState } from 'react';
import { PortalClienteService } from '../../services/Acessos/PortalClienteService';
import { useToast } from '../../contexts/ToastContext';

export function ClientePerfil() {
    const toast = useToast();
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await PortalClienteService.obterPerfil();
                const p = res?.data ?? {};
                setNome(p.nome ?? p.Nome ?? '');
                setTelefone(p.telefone ?? p.Telefone ?? '');
                setEmail(p.email ?? p.Email ?? '');
            } catch {
                toast.error('Não foi possível carregar o perfil.');
            }
        })();
    }, [toast]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await PortalClienteService.atualizarPerfil({ nome, telefone, email, status: 1 });
            toast.success('Perfil atualizado!');
        } catch (err) {
            toast.error(err.message || 'Erro ao salvar.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', border: '1px solid #e2e8f0' }}>
            <h2 style={{ marginTop: 0 }}>Meu perfil</h2>
            <form onSubmit={handleSave}>
                <label style={{ display: 'block', marginBottom: '0.75rem' }}>
                    Nome
                    <input
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                        style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #cbd5e1' }}
                    />
                </label>
                <label style={{ display: 'block', marginBottom: '0.75rem' }}>
                    Telefone
                    <input
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #cbd5e1' }}
                    />
                </label>
                <label style={{ display: 'block', marginBottom: '1rem' }}>
                    E-mail
                    <input
                        type="email"
                        value={email}
                        readOnly
                        style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f1f5f9' }}
                    />
                </label>
                <button
                    type="submit"
                    disabled={saving}
                    style={{
                        background: '#d4af37',
                        color: '#1a1a2e',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: 8,
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}
                >
                    {saving ? 'Salvando...' : 'Salvar'}
                </button>
            </form>
        </div>
    );
}
