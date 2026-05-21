import React from 'react';
import { Plus } from 'lucide-react';

/* 
  Shared Page Header Component - Fully Responsive
  Usage: <PageHeader icon={<Scissors />} title="..." subtitle="..." onNew={() => {}} newLabel="Novo" />
*/

const css = `
.page-hdr {
  background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
  border-radius: 18px;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 8px 24px rgba(26,26,46,0.15);
  position: relative;
  overflow: hidden;
}
.page-hdr::after {
  content: '';
  position: absolute;
  top: -40px; right: -20px;
  width: 150px; height: 150px;
  background: radial-gradient(circle, rgba(246,176,1,0.1) 0%, transparent 70%);
  pointer-events: none;
}
@media (min-width: 640px) {
  .page-hdr {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 2rem;
  }
}
.page-hdr-info {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  position: relative;
  z-index: 1;
}
.page-hdr-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f6b001, #e09800);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(246,176,1,0.3);
  flex-shrink: 0;
}
.page-hdr-title {
  color: #fff;
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.2;
}
@media (min-width: 640px) {
  .page-hdr-title { font-size: 1.4rem; }
}
.page-hdr-sub {
  color: rgba(255,255,255,0.5);
  font-size: 0.8rem;
  margin: 2px 0 0;
}
.page-hdr-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0.7rem 1.25rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #f6b001, #e09800);
  color: #fff;
  font-weight: 800;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(246,176,1,0.3);
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
  width: 100%;
}
@media (min-width: 640px) {
  .page-hdr-btn { width: auto; }
}
.page-hdr-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(246,176,1,0.4);
}

/* Search bar */
.page-search {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  background: #fff;
  padding: 0.75rem;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}
.page-search-inner {
  position: relative;
  flex: 1;
}
.page-search-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}
.page-search-input {
  width: 100%;
  padding: 0.65rem 0.75rem 0.65rem 2.5rem;
  border-radius: 10px;
  border: 1.5px solid #e5e7eb;
  outline: none;
  font-size: 0.875rem;
  color: #111827;
  background: #f8f9fa;
  transition: border 0.2s;
}
.page-search-input:focus {
  border-color: #f6b001;
  box-shadow: 0 0 0 3px rgba(246,176,1,0.1);
}
.page-search-btn {
  padding: 0 1rem;
  background: linear-gradient(135deg, #1a1a2e, #0f3460);
  color: #fff;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.825rem;
  white-space: nowrap;
  transition: opacity 0.2s;
}
.page-search-btn:hover { opacity: 0.85; }

/* Filtros de listagem (Financeiro, etc.) */
.page-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: flex-end;
  margin-bottom: 1.25rem;
  background: #fff;
  padding: 0.75rem 1rem;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}
.page-filters-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.page-filters-field label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.page-filters-field .page-search-input {
  min-width: 160px;
  width: auto;
}
.page-filters-btn {
  padding: 0.65rem 1.25rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #f6b001, #e09800);
  color: #1a1a1a;
  font-weight: 800;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(246,176,1,0.25);
  transition: transform 0.15s, filter 0.2s;
}
.page-filters-btn:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}
`;

export function PageHeader({ icon, title, subtitle, onNew, newLabel = 'Novo', headerTourId, newButtonTourId }) {
    return (
        <>
            <style>{css}</style>
            <div className="page-hdr">
                <div className="page-hdr-info" {...(headerTourId ? { 'data-tour': headerTourId } : {})}>
                    <div className="page-hdr-icon">
                        {React.cloneElement(icon, { size: 20, color: '#fff' })}
                    </div>
                    <div>
                        <h1 className="page-hdr-title">{title}</h1>
                        {subtitle && <p className="page-hdr-sub">{subtitle}</p>}
                    </div>
                </div>
                {onNew && (
                    <button
                        type="button"
                        className="page-hdr-btn"
                        onClick={onNew}
                        {...(newButtonTourId ? { 'data-tour': newButtonTourId } : {})}
                    >
                        <Plus size={16} />{newLabel}
                    </button>
                )}
            </div>
        </>
    );
}

export function PageSearch({ value, onChange, onSearch, placeholder = 'Buscar...' }) {
    return (
        <div className="page-search">
            <div className="page-search-inner">
                <svg className="page-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input
                    type="text"
                    className="page-search-input"
                    placeholder={placeholder}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && onSearch()}
                />
            </div>
            <button className="page-search-btn" onClick={onSearch}>Buscar</button>
        </div>
    );
}
