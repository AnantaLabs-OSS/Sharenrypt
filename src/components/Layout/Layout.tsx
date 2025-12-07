
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout() {
    return (
        <div className="flex flex-col min-h-screen bg-background font-sans text-foreground transition-colors duration-300 relative">
            {/* Aurora Background Layer */}
            <div className="aurora-bg">
                <div className="aurora-blob aurora-blob-1" />
                <div className="aurora-blob aurora-blob-2" />
                <div className="aurora-blob aurora-blob-3" />
            </div>

            <Header />
            {/* Add padding-top to account for fixed header */}
            <main className="flex-1 pt-16 relative z-10">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
