import React from 'react';
import { Shield, Users, Layout, Calendar as CalendarIcon, Activity } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'squad', label: 'Elenco', icon: Users },
    { id: 'tactics', label: 'Prancheta Tática', icon: Layout },
    { id: 'schedule', label: 'Calendário Mensal', icon: CalendarIcon },
    { id: 'medical', label: 'Dept. Médico', icon: Activity },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen z-20">
      <div>
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500 rounded-xl text-white shadow-md shadow-emerald-500/30 shrink-0">
            <Shield size={22} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Plantel Manager</h1>
            <p className="text-[11px] text-slate-400 font-medium">Gestão de Futebol</p>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
            FC
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Clube Profissional</p>
            <p className="text-[10px] text-slate-400">Temporada 2026</p>
          </div>
        </div>
      </div>
    </aside>
  );
}