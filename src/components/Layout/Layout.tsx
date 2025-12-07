
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-950">
            <Header />
            {/* Add padding-top to account for fixed header */}
            <main className="flex-1 pt-16">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
