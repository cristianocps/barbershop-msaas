import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Scissors, Clock, User, Calendar, Check, Bell, Settings, ArrowLeft, Loader2 } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { VitrineService } from '../services/Agendamentos/VitrineService';
import { useToast } from '../contexts/ToastContext';
import '../index.css';

/**
 * Interface de Vitrine - Agendamento Público
 */
function App() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Estados de dados do backend
  const [empresa, setEmpresa] = useState(null);
  const [servicos, setServicos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  
  // Estados de UI/Loading
  const [loading, setLoading] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [passo, setPasso] = useState(1); // 1: Serviço, 2: Profissional, 3: Data/Hora, 4: Dados

  // Estados do Agendamento
  const [selectedServices, setSelectedServices] = useState([]); // Array de IDs
  const [selectedProfessional, setSelectedProfessional] = useState(null); // Objeto do profissional
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [selectedTime, setSelectedTime] = useState(null);
  const [customer, setCustomer] = useState({ name: '', phone: '', notes: '' });
  const [chavesPix, setChavesPix] = useState([]);
  const [comprovanteBase64, setComprovanteBase64] = useState(null);

  // 1. Carregar Dados Iniciais (Empresa, Serviços, Profissionais)
  useEffect(() => {
    async function loadInitialData() {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const empRes = await VitrineService.carregarEmpresa(slug);
        const empresaObj = empRes?.data || empRes?.Data || empRes?.dados || empRes;
        const validId = empresaObj?.id || empresaObj?.ID || empresaObj?.Id;

        if (!empresaObj || !validId) {
           throw new Error('Empresa sem ID retornada ou não encontrada.');
        }

        // Padroniza a propriedade id para caixa baixa para o restante do código
        empresaObj.id = validId;
        setEmpresa(empresaObj);

        const [servicosRes, profissionaisRes, pixRes] = await Promise.all([
          VitrineService.carregarServicos(validId),
          VitrineService.carregarProfissionais(validId),
          VitrineService.carregarDadosBancarios(validId)
        ]);

        setServicos(servicosRes?.data || servicosRes?.Data || servicosRes?.dados || servicosRes || []);
        setProfissionais(profissionaisRes?.data || profissionaisRes?.Data || profissionaisRes?.dados || profissionaisRes || []);
        setChavesPix(pixRes?.data || pixRes?.Data || pixRes?.dados || pixRes || []);
      } catch (err) {
        toast.error(err.message || 'Erro ao carregar dados da barbearia');
        // navigate('/login');
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [slug]);

  // 2. Carregar Horários Livres quando mudar Profissional ou Data
  useEffect(() => {
    async function loadSlots() {
      if (!selectedProfessional || !selectedDate) return;

      try {
        setLoadingHorarios(true);
        const dataStr = format(selectedDate, 'yyyy-MM-dd');
        const slotsRes = await VitrineService.carregarHorariosLivres(selectedProfessional.id, dataStr);
        setHorariosDisponiveis(slotsRes?.data || slotsRes?.Data || slotsRes?.dados || slotsRes || []);
      } catch (err) {
        toast.error('Erro ao carregar horários disponíveis');
      } finally {
        setLoadingHorarios(false);
      }
    }

    if (passo === 3) {
      loadSlots();
    }
  }, [selectedProfessional, selectedDate, passo]);

  // Auxiliares
  const toggleService = (servico) => {
    setSelectedServices(prev =>
      prev.find(s => s.id === servico.id) 
        ? prev.filter(s => s.id !== servico.id) 
        : [...prev, servico]
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setComprovanteBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const days = Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i));

  const totalDuration = selectedServices.reduce((acc, s) => acc + (s.unidade || 0), 0);
  const totalPrice = selectedServices.reduce((acc, s) => acc + (s.valorUnitario || 0), 0);

  const canNavigateToStep2 = selectedServices.length > 0;
  const canNavigateToStep3 = selectedProfessional !== null;
  const canNavigateToStep4 = selectedTime !== null;
  // Valida se é um número de celular BR válido para WhatsApp (DDD + 9 dígitos = 11 total)
  const isWhatsAppValido = (phone) => {
    const digits = phone.replace(/\D/g, '');
    // Celular BR: DDD (2 dígitos) + 9 (1 dígito) + 8 dígitos = 11 total
    return digits.length === 11 && digits[2] === '9';
  };

  const canConfirm = customer.name.trim().length >= 2;

  const handleConfirm = async () => {
    if (!canConfirm) return;

    try {
      setLoading(true);
      
      const empId = empresa.id ?? empresa.ID ?? empresa.Id;
      
      const payload = {
        idEmpresa: empId,
        idProfissional: selectedProfessional.id,
        nomeCliente: customer.name,
        telefoneCliente: '',
        observacao: customer.notes || '',
        comprovantePix: comprovanteBase64,
        dtAgendamento: `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`,
        servicos: selectedServices.map(s => ({
          idServico: s.id,
          nomeServico: s.descricao,
          valorCobrado: s.valorUnitario
        }))
      };

      const res = await VitrineService.confirmarAgendamento(payload);

      // A API retorna { JsonTypes, Mensagem, Data: { MensagemWhatsApp, ... } }
      // api.js retorna o JSON cru, então res = esse objeto
      if (res?.JsonTypes === 'error' || res?.jsonTypes === 'error') {
        throw new Error(res?.Mensagem || res?.mensagem || 'Erro ao confirmar agendamento');
      }

      const dataResult = res?.Data ?? res?.data ?? res?.dados ?? res;
      
      toast.success('Agendamento realizado com sucesso!');

      // Solução definitiva: emojis via String.fromCodePoint (runtime - bypass total de file encoding)
      // Usando apenas emojis do bloco moderno U+1F... que têm suporte universal no WhatsApp
      const ic = {
          ok:        String.fromCodePoint(0x2705),     // ✅
          servico:   String.fromCodePoint(0x1F4CB),   // 📋
          pessoa:    String.fromCodePoint(0x1F464),   // 👤
          data:      String.fromCodePoint(0x1F4C5),   // 📅
          hora:      String.fromCodePoint(0x23F0),    // ⏰
          obs:       String.fromCodePoint(0x1F4DD),   // 📝
          pray:      String.fromCodePoint(0x1F64F)    // 🙏
      };

      const descServicos = selectedServices.map(s => s.descricao).join(' + ');
      const profDesc     = selectedProfessional.descricao;
      const dataFmt      = format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR });

      let msg = `${ic.ok} *Agendamento Confirmado!*\n\n`;
      msg += `${ic.servico} *Serviço:* ${descServicos}\n`;
      msg += `${ic.pessoa} *Profissional:* ${profDesc}\n`;
      msg += `${ic.data} *Data:* ${dataFmt}\n`;
      msg += `${ic.hora} *Horário:* ${selectedTime}`;
      if (customer.notes) {
          msg += `\n${ic.obs} *Obs:* ${customer.notes.trim()}`;
      }
      msg += `\n\n_Obrigado pela preferência! Até logo_ ${ic.pray}`;

      // Envia para o WhatsApp do profissional
      let profPhone = selectedProfessional?.telefone || '';
      if (!profPhone) {
          profPhone = dataResult?.WhatsApp || dataResult?.whatsapp || '';
      }
      
      const cleanProfPhone = profPhone.replace(/\D/g, '');
      const isProfWhatsApp = cleanProfPhone.length === 11 && cleanProfPhone[2] === '9';

      if (isProfWhatsApp) {
        // encodeURIComponent UMA única vez no final — forma correta e padrão
        const whatsappLink = `https://wa.me/55${cleanProfPhone}?text=${encodeURIComponent(msg)}`;
        window.open(whatsappLink, '_blank');
      } else {
        toast.warning('Agendamento confirmado, mas o profissional não possui um WhatsApp válido para envio da notificação.');
      }

      // Resetar ou navegar para uma página de sucesso
      setPasso(1);
      setSelectedServices([]);
      setSelectedProfessional(null);
      setSelectedTime(null);
      setCustomer({ name: '', phone: '', notes: '' });
      setComprovanteBase64(null);

    } catch (err) {
      toast.error(err.message || 'Erro ao confirmar agendamento');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !empresa) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-700">Carregando Vitrine...</h2>
        </div>
      </div>
    );
  }

  if (!empresa && !loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 p-6">
        <div className="text-center max-w-md">
          <Scissors className="text-gray-300 mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Barbearia não encontrada</h2>
          <p className="text-gray-600 mb-6">O link que você acessou pode estar incorreto ou a barbearia não está mais ativa.</p>
          <button onClick={() => navigate('/login')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header Dinâmico */}
      <header className="header">
        <div className="header-top">
          <div className="header-user-info">
            {(empresa?.logoData || empresa?.LogoData) ? (
               <img src={empresa.logoData || empresa.LogoData} alt="Logo" className="header-logo-img" style={{ width: 48, height: 48, borderRadius: '12px', objectFit: 'cover' }} />
            ) : (
              <div className="header-logo-placeholder">{(empresa?.descricao || empresa?.Descricao || 'B').charAt(0).toUpperCase()}</div>
            )}
            <div className="header-text-container">
              <h1 className="header-title">{empresa?.descricao || empresa?.Descricao || 'Barbearia'}</h1>
              <p className="header-subtitle">{empresa?.cidade || empresa?.Cidade || 'Selecione seu horário'}</p>
            </div>
          </div>
          <div className="header-actions">
             {passo > 1 && (
               <button className="header-action-btn" onClick={() => setPasso(passo - 1)}>
                 <ArrowLeft size={20} />
               </button>
             )}
          </div>
        </div>
      </header>

      <div className="content-wrapper">
        
        {/* Indicador de Passos */}
        <div className="steps-indicator">
            <div 
                className={`step-dot ${passo >= 1 ? 'active' : ''}`} 
                onClick={() => setPasso(1)}
                style={{ cursor: 'pointer' }}
                title="Voltar para Serviços"
            >
                <span>1</span>
            </div>
            <div className={`step-line ${passo >= 2 ? 'active' : ''}`}></div>
            <div 
                className={`step-dot ${passo >= 2 ? 'active' : ''}`}
                onClick={() => { if (canNavigateToStep2) setPasso(2) }}
                style={{ cursor: canNavigateToStep2 ? 'pointer' : 'not-allowed' }}
                title={canNavigateToStep2 ? "Ir para Profissional" : ""}
            >
                <span>2</span>
            </div>
            <div className={`step-line ${passo >= 3 ? 'active' : ''}`}></div>
            <div 
                className={`step-dot ${passo >= 3 ? 'active' : ''}`}
                onClick={() => { if (canNavigateToStep3) setPasso(3) }}
                style={{ cursor: canNavigateToStep3 ? 'pointer' : 'not-allowed' }}
                title={canNavigateToStep3 ? "Ir para Data/Hora" : ""}
            >
                <span>3</span>
            </div>
            <div className={`step-line ${passo >= 4 ? 'active' : ''}`}></div>
            <div 
                className={`step-dot ${passo >= 4 ? 'active' : ''}`}
                onClick={() => { if (canNavigateToStep4) setPasso(4) }}
                style={{ cursor: canNavigateToStep4 ? 'pointer' : 'not-allowed' }}
                title={canNavigateToStep4 ? "Ir para Confirmação" : ""}
            >
                <span>4</span>
            </div>
        </div>

        {/* PASSO 1: SERVIÇOS */}
        {passo === 1 && (
          <section className="step-section show-up">
            <h2 className="step-title"><Scissors size={20} /> Selecione os Serviços</h2>
            
            {servicos && servicos.length > 0 ? (
              <div className="services-grid">
                {servicos.map((service, i) => {
                  const sId = service.id ?? service.ID ?? service.Id;
                  const sDesc = service.descricao ?? service.Descricao ?? 'Serviço sem nome';
                  const sUnidade = service.unidade ?? service.Unidade ?? 0;
                  const sValor = service.valorUnitario ?? service.ValorUnitario ?? 0;
                  const isSelected = selectedServices.find(s => s.id === sId);

                  return (
                    <div
                      key={sId || i}
                      className={`service-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleService({ id: sId, descricao: sDesc, unidade: sUnidade, valorUnitario: sValor })}
                    >
                      <div className="service-info">
                        <div className="service-icon-wrap">
                          <Scissors size={20} />
                        </div>
                        <div>
                          <div className="service-name">{sDesc}</div>
                          <div className="service-meta">
                            <Clock size={14} /> {sUnidade} min
                          </div>
                        </div>
                      </div>
                      <div className="service-price">
                        R$ {Number(sValor).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                  <Scissors size={40} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
                  <h3 style={{ color: '#64748b', fontSize: '1.1rem' }}>Nenhum serviço disponível</h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>A barbearia ainda não cadastrou serviços para agendamento online.</p>
              </div>
            )}

            <button 
              className="btn-submit" 
              disabled={!canNavigateToStep2}
              onClick={() => setPasso(2)}
            >
              Próximo: Escolher Profissional
            </button>
          </section>
        )}

        {/* PASSO 2: PROFISSIONAL */}
        {passo === 2 && (
          <section className="step-section show-right">
            <h2 className="step-title"><User size={20} /> Escolha o Profissional</h2>
            
            {profissionais && profissionais.length > 0 ? (
              <div className="professionals-grid">
                {profissionais.map((prof, i) => {
                  const pId = prof.id ?? prof.ID ?? prof.Id;
                  const pDesc = prof.descricao ?? prof.Descricao ?? 'Profissional';
                  const pCor = prof.corAgenda ?? prof.CorAgenda ?? '#6366f1';
                  const pTel = prof.telefone ?? prof.Telefone ?? '';
                  
                  return (
                    <div 
                      key={pId || i} 
                      className={`professional-card ${selectedProfessional?.id === pId ? 'selected' : ''}`}
                      onClick={() => setSelectedProfessional({ id: pId, descricao: pDesc, corAgenda: pCor, telefone: pTel })}
                    >
                       <div className="prof-avatar" style={{ backgroundColor: pCor, width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                          {pDesc.charAt(0).toUpperCase()}
                       </div>
                       <div className="prof-name" style={{ fontWeight: '700', fontSize: '1.1rem', color: '#111827' }}>{pDesc}</div>
                       {selectedProfessional?.id === pId && <Check style={{ marginLeft: 'auto', color: '#16a34a' }} size={24} strokeWidth={3} />}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                  <User size={40} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
                  <h3 style={{ color: '#64748b', fontSize: '1.1rem' }}>Profissionais Indisponíveis</h3>
              </div>
            )}

            <button 
              className="btn-submit" 
              disabled={!canNavigateToStep3}
              onClick={() => setPasso(3)}
            >
              Próximo: Data e Horário
            </button>
          </section>
        )}

        {/* PASSO 3: DATA E HORA */}
        {passo === 3 && (
          <section className="step-section show-right">
            <h2 className="step-title"><Calendar size={20} /> Data e Horário</h2>
            
            <div className="date-slider">
              {days.map(day => {
                const isSelected = format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                return (
                  <div
                    key={day.toISOString()}
                    className={`date-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedDate(day);
                      setSelectedTime(null);
                    }}
                  >
                    <div className="date-weekday">{format(day, 'EEE', { locale: ptBR }).replace('.', '')}</div>
                    <div className="date-day">{format(day, 'dd')}</div>
                  </div>
                );
              })}
            </div>

            {loadingHorarios ? (
              <div className="flex flex-col items-center py-8">
                 <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                 <p className="text-sm text-gray-500">Buscando horários disponíveis...</p>
              </div>
            ) : (
              <div className="time-grid">
                {horariosDisponiveis.length > 0 ? (
                  horariosDisponiveis.map(slot => (
                    <div
                      key={slot}
                      className={`time-pill ${selectedTime === slot ? 'selected' : ''}`}
                      onClick={() => setSelectedTime(slot)}
                    >
                      {slot}
                    </div>
                  ))
                ) : (
                  <div className="no-slots">
                    Nenhum horário disponível para este dia.
                  </div>
                )}
              </div>
            )}

            <button 
              className="btn-submit" 
              disabled={!canNavigateToStep4}
              onClick={() => setPasso(4)}
            >
              Próximo: Seus Dados
            </button>
          </section>
        )}

        {/* PASSO 4: DADOS DO CLIENTE */}
        {passo === 4 && (
          <section className="step-section show-right">
            <h2 className="step-title"><Check size={20} /> Seus Dados</h2>
            <div className="details-form">
              <div className="input-group">
                <label className="input-label">Seu Nome</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Seu nome completo"
                  value={customer.name}
                  onChange={e => setCustomer({ ...customer, name: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Observações (Opcional)</label>
                <textarea
                  className="input-field"
                  placeholder="Algum detalhe para o barbeiro?"
                  rows="3"
                  value={customer.notes}
                  onChange={e => setCustomer({ ...customer, notes: e.target.value })}
                />
              </div>

              {/* Seção de PIX */}
              {chavesPix && chavesPix.length > 0 && (
                <div className="pix-section mt-6 p-4 rounded-xl border-2 border-dashed border-blue-100 bg-blue-50/30">
                  <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    Pagamento via PIX (Opcional)
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    {chavesPix.map((pix, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                        <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">{pix.tipo || pix.Tipo}</div>
                        <div className="text-sm font-mono font-bold text-gray-800 break-all select-all cursor-pointer" title="Clique para copiar">
                          {pix.chave || pix.Chave}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="input-group !mb-0">
                    <label className="input-label !text-blue-800 !text-xs">Anexar Comprovante</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="pix-upload"
                      />
                      <label 
                        htmlFor="pix-upload"
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed cursor-pointer transition-all ${comprovanteBase64 ? 'border-green-500 bg-green-50' : 'border-blue-200 hover:border-blue-400 bg-white'}`}
                      >
                        {comprovanteBase64 ? (
                          <>
                            <Check size={18} className="text-green-600" />
                            <span className="text-sm font-bold text-green-700">Comprovante anexado!</span>
                          </>
                        ) : (
                          <>
                            <Scissors size={18} className="text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">Escolher foto do comprovante</span>
                          </>
                        )}
                      </label>
                      {comprovanteBase64 && (
                        <button 
                          onClick={() => setComprovanteBase64(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 italic text-center">O envio do comprovante agiliza sua confirmação.</p>
                </div>
              )}
            </div>

            {/* Resumo Final */}
            <div className="summary-box mt-6">
              <div className="flex-1">
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>Resumo</div>
                <div style={{ fontWeight: '600' }}>{selectedServices.length} serviço(s)</div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
                  {format(selectedDate, "dd/MM 'às' ")} {selectedTime} com {selectedProfessional?.descricao}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>Total</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>R$ {totalPrice.toFixed(2)}</div>
              </div>
            </div>

            <button
              className="btn-submit"
              disabled={!canConfirm || loading}
              onClick={handleConfirm}
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Finalizar Agendamento'}
            </button>
          </section>
        )}

      </div>
    </div>
  );
}

export default App;
