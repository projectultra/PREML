import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Telescope, BookOpen, Database, Info, FileText, LayoutDashboard } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/methodology', label: 'Methodology', icon: BookOpen },
        { path: '/dataset', label: 'Dataset', icon: Database },
        { path: '/publications', label: 'Publications', icon: FileText },
        { path: '/about', label: 'About', icon: Info },
    ];

    return (
        <div className="min-h-screen relative overflow-hidden selection:bg-blue-500/30">
            <div className="grid-overlay" />

            {/* Header */}
            <header className="relative z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-3 sticky top-0">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <Telescope className="w-5 h-5 text-blue-400" />
                            <span className="mono text-sm font-bold tracking-tighter text-slate-200">PREML // RESEARCH_PLATFORM</span>
                        </Link>
                        <div className="h-4 w-px bg-slate-800" />
                        <nav className="flex items-center gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-sm transition-all ${isActive
                                            ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30'
                                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                                            }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        <span className="mono text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="status-dot status-online" />
                            <span className="mono text-[10px] text-slate-500 uppercase font-bold">Node_Active</span>
                        </div>
                        <div className="h-4 w-px bg-slate-800" />
                        <div className="flex flex-col items-end">
                            <span className="mono text-[10px] text-slate-500 uppercase font-bold">Research Center</span>
                            <span className="mono text-[10px] text-blue-400 font-bold">V-2.4.0-STABLE</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-[1600px] mx-auto p-6">
                {children}
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-slate-800 bg-slate-950/50 px-6 py-4 mt-auto">
                <div className="max-w-[1600px] mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span className="mono text-[10px] text-slate-600">© 2024 PREML_RESEARCH_GROUP</span>
                        <span className="mono text-[10px] text-slate-600">//</span>
                        <span className="mono text-[10px] text-slate-600">OPEN_SCIENCE_INITIATIVE</span>
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="mono text-[10px] text-slate-500 hover:text-blue-400 transition-colors uppercase font-bold">Data_Policy</a>
                        <a href="#" className="mono text-[10px] text-slate-500 hover:text-blue-400 transition-colors uppercase font-bold">Citation_Guide</a>
                        <a href="#" className="mono text-[10px] text-slate-500 hover:text-blue-400 transition-colors uppercase font-bold">GitHub</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
