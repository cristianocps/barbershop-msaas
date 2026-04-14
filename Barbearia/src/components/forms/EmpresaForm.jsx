import React, { useRef, useState } from 'react';
import { FormField, FormRow } from '../UI/FormModal';
import { ImagePlus, X } from 'lucide-react';

const MAX_SIZE_MB = 2; // Base64 de 2MB ≈ 2.7MB de texto — dentro do limite de 20MB do backend


export function EmpresaForm({ form, onChange }) {
    const set = (field, value) => onChange({ ...form, [field]: value });
    const fileInputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);

    // Converte File → Base64 e salva em form.logoData
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
        reader.onload = (e) => set('logoData', e.target.result); // data:image/...;base64,...
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        handleImageFile(file);
    };

    const removeLogo = (e) => {
        e.stopPropagation();
        set('logoData', '');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <>
            {/* ── LOGO ── */}
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
                    {/* Preview ou placeholder */}
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

            <FormField label="Nome da Empresa" required>
                <input
                    className="fm-input"
                    type="text"
                    placeholder="Ex: BarberShop Centro"
                    value={form.descricao || ''}
                    onChange={e => set('descricao', e.target.value)}
                    autoFocus
                />
            </FormField>

            <FormField label="CNPJ">
                <input
                    className="fm-input"
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={form.cnpj || ''}
                    onChange={e => set('cnpj', e.target.value)}
                />
            </FormField>

            <FormField label="Link de Agendamento (Slug)" hint="Ex: barbearia-do-jeferson">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ padding: '0 10px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRight: 'none', borderRadius: '8px 0 0 8px', color: '#6b7280', fontSize: '0.875rem' }}>site.com/</span>
                    <input
                        className="fm-input"
                        style={{ borderRadius: '0 8px 8px 0' }}
                        type="text"
                        placeholder="nome-da-barbearia"
                        value={form.slug || ''}
                        onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                    />
                </div>
            </FormField>

            <FormRow>
                <FormField label="Telefone">
                    <input
                        className="fm-input"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={form.telefone || ''}
                        onChange={e => set('telefone', e.target.value)}
                    />
                </FormField>
                <FormField label="E-mail">
                    <input
                        className="fm-input"
                        type="email"
                        placeholder="contato@empresa.com"
                        value={form.email || ''}
                        onChange={e => set('email', e.target.value)}
                    />
                </FormField>
            </FormRow>

            <FormField label="Endereço">
                <input
                    className="fm-input"
                    type="text"
                    placeholder="Rua, Número - Bairro"
                    value={form.endereco || ''}
                    onChange={e => set('endereco', e.target.value)}
                />
            </FormField>

            <FormRow>
                <FormField label="Cidade">
                    <input
                        className="fm-input"
                        type="text"
                        placeholder="Ex: São Paulo"
                        value={form.cidade || ''}
                        onChange={e => set('cidade', e.target.value)}
                    />
                </FormField>
                <FormField label="Estado (UF)">
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

            <FormField label="Status">
                <select
                    className="fm-select"
                    value={form.status ?? 1}
                    onChange={e => set('status', parseInt(e.target.value))}
                >
                    <option value={1}>Ativa</option>
                    <option value={0}>Inativa</option>
                </select>
            </FormField>
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
});
