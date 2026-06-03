import React, { useRef, useState } from 'react';
import { FormField, FormRow } from '../UI/FormModal';
import { ImagePlus, X } from 'lucide-react';
import { getSlugPrefixLabel } from '../../utils/publicSiteUrl';
import { EmpresaHorariosConfig } from './EmpresaHorariosConfig';

const MAX_SIZE_MB = 2;

/**
 * @param {'full'|'minha'} variant — minha: campos obrigatórios alinhados à API; oculta status
 */
export function EmpresaForm({ form, onChange, variant = 'full', fieldErrors = {} }) {
    const isMinha = variant === 'minha';
    const set = (field, value) => onChange({ ...form, [field]: value });
    const fileInputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const slugPrefix = getSlugPrefixLabel();
    const err = (key) => fieldErrors[key];

    const handleImageFile = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Selecione um arquivo de imagem (JPG, PNG, SVG...)');
            return;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            alert(`A imagem deve ter no máximo ${MAX_SIZE_MB}MB.`);
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => set('logoData', e.target.result);
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleImageFile(e.dataTransfer.files?.[0]);
    };

    const removeLogo = (e) => {
        e.stopPropagation();
        set('logoData', '');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <>
            <FormField label="Logo da Barbearia">
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    style={{
                        border: `2px dashed ${dragOver ? '#f6b001' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: dragOver ? 'rgba(246,176,1,0.04)' : '#fafafa',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        position: 'relative',
                    }}
                >
                    {form.logoData ? (
                        <>
                            <img
                                src={form.logoData}
                                alt="Logo"
                                style={{
                                    width: '72px',
                                    height: '72px',
                                    objectFit: 'contain',
                                    borderRadius: '10px',
                                    background: '#fff',
                                    border: '1px solid #e5e7eb',
                                    padding: '4px',
                                    flexShrink: 0,
                                }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827' }}>Logo carregada ✓</div>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>Clique ou arraste para trocar</div>
                            </div>
                            <button
                                type="button"
                                onClick={removeLogo}
                                title="Remover logo"
                                style={{
                                    position: 'absolute', top: '8px', right: '8px',
                                    width: '24px', height: '24px', borderRadius: '6px',
                                    background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                                    border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <X size={13} />
                            </button>
                        </>
                    ) : (
                        <>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '12px',
                                background: 'rgba(246,176,1,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <ImagePlus size={24} color="#f6b001" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#374151' }}>Clique ou arraste a logo aqui</div>
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>PNG, JPG, SVG • máx. {MAX_SIZE_MB}MB</div>
                            </div>
                        </>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleImageFile(e.target.files?.[0])}
                    />
                </div>
            </FormField>

            <FormField label="Nome da Empresa" required error={err('descricao')}>
                <input
                    className="fm-input"
                    type="text"
                    placeholder="Ex: BarberShop Centro"
                    value={form.descricao || ''}
                    onChange={e => set('descricao', e.target.value)}
                    autoFocus
                    maxLength={150}
                />
            </FormField>

            <FormField label="CNPJ" error={err('cnpj')}>
                <input
                    className="fm-input"
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={form.cnpj || ''}
                    onChange={e => set('cnpj', e.target.value)}
                />
            </FormField>

            <FormField
                label="Link de Agendamento (Slug)"
                required={isMinha}
                hint="URL pública da vitrine — só letras minúsculas, números e hífens"
                error={err('slug')}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{
                        padding: '0 10px',
                        background: '#f3f4f6',
                        border: '1px solid #e5e7eb',
                        borderRight: 'none',
                        borderRadius: '8px 0 0 8px',
                        color: '#6b7280',
                        fontSize: '0.8rem',
                        whiteSpace: 'nowrap',
                        maxWidth: '45%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}>
                        {slugPrefix}
                    </span>
                    <input
                        className="fm-input"
                        style={{ borderRadius: '0 8px 8px 0', flex: 1, minWidth: 0 }}
                        type="text"
                        placeholder="nome-da-barbearia"
                        value={form.slug || ''}
                        onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                        maxLength={100}
                    />
                </div>
            </FormField>

            <FormRow>
                <FormField label="Telefone" required={isMinha} error={err('telefone')}>
                    <input
                        className="fm-input"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={form.telefone || ''}
                        onChange={e => set('telefone', e.target.value)}
                        maxLength={15}
                    />
                </FormField>
                <FormField label="E-mail" error={err('email')}>
                    <input
                        className="fm-input"
                        type="email"
                        placeholder="contato@empresa.com"
                        value={form.email || ''}
                        onChange={e => set('email', e.target.value)}
                    />
                </FormField>
            </FormRow>

            <FormField label="Endereço" required={isMinha} error={err('endereco')}>
                <input
                    className="fm-input"
                    type="text"
                    placeholder="Rua, Número - Bairro"
                    value={form.endereco || ''}
                    onChange={e => set('endereco', e.target.value)}
                    maxLength={60}
                />
            </FormField>

            <FormRow>
                <FormField label="Cidade" required={isMinha} error={err('cidade')}>
                    <input
                        className="fm-input"
                        type="text"
                        placeholder="Ex: São Paulo"
                        value={form.cidade || ''}
                        onChange={e => set('cidade', e.target.value)}
                        maxLength={150}
                    />
                </FormField>
                <FormField label="Estado (UF)" error={err('estado')}>
                    <input
                        className="fm-input"
                        type="text"
                        maxLength={2}
                        placeholder="SP"
                        value={form.estado || ''}
                        onChange={e => set('estado', e.target.value.toUpperCase())}
                    />
                </FormField>
            </FormRow>

            {!isMinha && (
                <FormField label="Status">
                    <select
                        className="fm-select"
                        value={form.status ?? 1}
                        onChange={e => set('status', parseInt(e.target.value, 10))}
                    >
                        <option value={1}>Ativa</option>
                        <option value={0}>Inativa</option>
                    </select>
                </FormField>
            )}

            <FormField label="Infinite Pay — handle" hint="Infinite Tag desta barbearia (ex.: $minha_loja)">
                <input
                    className="fm-input"
                    value={form.infinitepayHandle || ''}
                    onChange={e => set('infinitepayHandle', e.target.value)}
                    placeholder="$sua_infinite_tag"
                />
            </FormField>

            <EmpresaHorariosConfig
                value={form.horariosConfig}
                onChange={(val) => set('horariosConfig', val)}
            />
        </>
    );
}

export const EmpresaFormDefault = () => ({
    id: 0,
    descricao: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    slug: '',
    logoData: '',
    status: 1,
    infinitepayHandle: '',
    horariosConfig: null,
});
