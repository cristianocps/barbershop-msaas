import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function MainLayout() {
    return (
        <div className="main-layout">
            <Sidebar />
            <main className="main-content">
                <div className="content-wrapper admin-wrapper">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
