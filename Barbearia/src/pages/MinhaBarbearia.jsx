import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Building2, ExternalLink } from 'lucide-react';
import { PageHeader } from '../components/UI/PageHeader';
import { EmpresaForm, EmpresaFormDefault } from '../components/forms/EmpresaForm';
import { EmpresasService } from '../services/Configuracoes/EmpresasService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useOnboardingTour } from '../hooks/useOnboardingTour';
import { TOURS } from '../config/onboardingTours';
import { isDemoEmpresa } from '../utils/userPolicy';
import { assertApiSuccess } from '../services/apiHelpers';
import { validateEmpresaForm, buildEmpresaApiPayload } from '../utils/validateEmpresaForm';
import { getVitrineUrl } from '../utils/publicSiteUrl';

function mapEmpresaToForm(dados, fallbackId = 0) {
    return {
        id: dados.id ?? dados.ID ?? dados.Id ?? fallbackId,
        descricao: dados.descricao ?? dados.Descricao ?? '',
        cnpj: dados.cnpj ?? dados.Cnpj ?? '',
        telefone: dados.telefone ?? dados.Telefone ?? '',
        email: dados.email ?? dados.Email ?? '',
        endereco: dados.endereco ?? dados.Endereco ?? '',
        cidade: dados.cidade ?? dados.Cidade ?? '',
        estado: dados.estado ?? dados.Estado ?? '',
        slug: dados.slug ?? dados.Slug ?? '',
        logoData: dados.logoData ?? dados.LogoData ?? '',
        status: dados.status ?? dados.Status ?? 1,
        infinitepayHandle: dados.infinitepayHandle ?? dados.InfinitepayHandle ?? '',
    };
}

export function MinhaBarbearia() {
    const toast = useToast();
    const { empresa, refreshEmpresa, user } = useAuth();
    const { iniciarTour } = useOnboardingTour();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EmpresaFormDefault());
    const [fieldErrors, setFieldErrors] = useState({});
    const [reloadKey, setReloadKey] = useState(0);
    const skipNextLoadRef = useRef(false);

    const isDemo = isDemoEmpresa(empresa);
    const empresaId = empresa?.id ?? empresa?.ID ?? empresa?.Id ?? 0;

    useEffect(() => {
        const steps = TOURS.minhaBarbearia({ isDemo });
        if (steps.length) iniciarTour('minha-barbearia', steps);
    }, [iniciarTour, isDemo]);

    const loadForm = useCallback(async () => {
        if (skipNextLoadRef.current) {
            skipNextLoadRef.current = false;
            return;
        }
        try {
            setLoading(true);
            if (empresaId > 0) {
                const res = await EmpresasService.editar(empresaId);
                const { data } = assertApiSuccess(res, 'Erro ao carregar dados da unidade.');
                const dados = data ?? res?.data ?? res?.Data ?? res;
                if (dados) {
                    setForm(mapEmpresaToForm(dados, empresaId));
                }
            } else {
                setForm({
                    ...EmpresaFormDefault(),
                    email: user?.email || '',
                });
            }
        } catch (err) {
            toast.error(err.message || 'Erro ao carregar dados da unidade.');
        } finally {
            setLoading(false);
        }
    }, [empresaId, toast, user?.email]);

    useEffect(() => {
        loadForm();
    }, [loadForm, reloadKey]);

    const handleSave = async () => {
        const { valid, errors } = validateEmpresaForm(form, { requireSlug: true });
        setFieldErrors(errors);
        if (!valid) {
            toast.error('Corrija os campos destacados antes de salvar.');
            return;
        }

        const snapshot = { ...form };
        setSaving(true);
        try {
            const payloadId = isDemo ? 0 : (form.id || empresaId || 0);
            const res = await EmpresasService.alterar(
                buildEmpresaApiPayload({ ...form, id: payloadId })
            );
            assertApiSuccess(res, 'Erro ao salvar.');

            toast.success(isDemo ? 'Barbearia criada com sucesso!' : 'Dados atualizados!');
            setFieldErrors({});
            await refreshEmpresa();
            setReloadKey((k) => k + 1);
        } catch (err) {
            setForm(snapshot);
            skipNextLoadRef.current = true;
            toast.error(err.message || 'Erro ao salvar.');
        } finally {
            setSaving(false);
        }
    };

    const vitrineUrl = getVitrineUrl(form.slug || empresa?.slug);

    return (
        <div>
            <div data-tour="minha-barbearia-intro">
                <PageHeader
                    icon={<Building2 />}
                    title="Minha barbearia"
                    subtitle={isDemo
                        ? 'Configure sua unidade real (você está na demonstração)'
                        : 'Dados da sua unidade e link de agendamento'}
                    headerTourId="minha-barbearia-intro"
                />
            </div>

            {isDemo && (
                <div style={{
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    borderRadius: 16,
                    padding: '1.25rem 1.5rem',
                    marginBottom: '1.25rem',
                    color: '#fff',
                }}>
                    <p style={{ margin: 0, lineHeight: 1.55, fontSize: '0.95rem' }}>
                        Contas novas começam na <strong>unidade de demonstração</strong>. Preencha o formulário abaixo e salve
                        para criar <strong>sua barbearia</strong> — serviços, profissionais e agendamentos passam a valer só para ela.
                    </p>
                </div>
            )}

            {!loading && vitrineUrl && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: '1rem',
                    padding: '0.75rem 1rem',
                    background: '#f8fafc',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    flexWrap: 'wrap',
                }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Vitrine pública:</span>
                    <button
                        type="button"
                        onClick={() => window.open(vitrineUrl, '_blank')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: 'none',
                            border: 'none',
                            color: '#2563eb',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            wordBreak: 'break-all',
                        }}
                    >
                        {vitrineUrl} <ExternalLink size={14} />
                    </button>
                </div>
            )}

            <div
                data-tour="minha-barbearia-salvar"
                style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: '1.25rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
            >
                {loading ? (
                    <p style={{ color: '#64748b' }}>Carregando...</p>
                ) : (
                    <>
                        <EmpresaForm
                            form={form}
                            onChange={(next) => {
                                setForm(next);
                                if (Object.keys(fieldErrors).length) setFieldErrors({});
                            }}
                            variant="minha"
                            fieldErrors={fieldErrors}
                        />
                        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    padding: '10px 22px',
                                    borderRadius: 10,
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #f6b001, #e09800)',
                                    color: '#fff',
                                    fontWeight: 800,
                                    cursor: saving ? 'wait' : 'pointer',
                                    opacity: saving ? 0.7 : 1,
                                }}
                            >
                                {saving ? 'Salvando...' : (isDemo ? 'Criar minha barbearia' : 'Salvar alterações')}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
