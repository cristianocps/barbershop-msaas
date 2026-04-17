import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { AgendamentoAlert } from '../UI/AgendamentoAlert';

export function MainLayout() {
    return (
        <div className="main-layout">
            <Sidebar />
            <main className="main-content">
                <div className="content-wrapper admin-wrapper">
                    <Outlet />
                </div>
            </main>
            <AgendamentoAlert />
        </div>
    );
}
