
import React from 'react';
import { NavLink } from 'react-router-dom';
// ИСПРАВЛЕНО: удалена лишняя точка в пути
import { Language, translations, UserRole } from './types';

interface LayoutProps {
  children: React.ReactNode;
  lang: Language;
  onLangChange: (lang: Language) => void;
  role: UserRole;
  userName?: string;
  onLogout: () => void;
}

const Icons = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
  ),
  Professors: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Subjects: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/><path d="M4 12h16"/><path d="M4 16h16"/><path d="M2 20h20"/></svg>
  ),
  Contingent: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Syllabus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
  ),
  Lectures: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/><path d="M6 8h2"/><path d="M6 12h2"/><path d="M16 8h2"/><path d="M16 12h2"/></svg>
  ),
  Assignments: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
  ),
  Tests: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
  ),
  Editor: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
  )
};

export const Layout: React.FC<LayoutProps> = ({ children, lang, onLangChange, role, userName, onLogout }) => {
  const t = translations[lang];

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden text-white font-inter">
      {/* Sidebar */}
      <aside className="w-64 bg-charcoal text-slate-300 flex flex-col border-r border-white/5 shadow-2xl z-20">
        <div className="p-6 border-b border-white/5 bg-gradient-to-b from-charcoal to-black/40">
          <h1 className="flex items-center gap-3">
            <div className="bg-purple-accent p-2.5 rounded-lg shadow-lg shadow-purple-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <div className="leading-none">
              <span className="block text-purple-accent text-[9px] font-black uppercase tracking-[0.2em] mb-1">
                {role === UserRole.ADMIN ? t.adminPortal : role === UserRole.PROFESSOR ? t.profPortal : t.studentPortal}
              </span>
              <span className="text-white text-xl font-black tracking-tighter uppercase">QADAM</span>
            </div>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {role === UserRole.ADMIN && (
            <>
              <NavItem to="/" icon={<Icons.Dashboard />} label={t.dashboard} />
              <NavItem to="/professors" icon={<Icons.Professors />} label={t.manageProfessors} />
              <NavItem to="/groups" icon={<Icons.Contingent />} label={t.groups} />
            </>
          )}

          {role === UserRole.PROFESSOR && (
            <>
              <NavItem to="/" icon={<Icons.Dashboard />} label={t.dashboard} />
              <NavItem to="/subjects" icon={<Icons.Subjects />} label={t.subjects} />
              <NavItem to="/groups" icon={<Icons.Contingent />} label={t.groups} />
              <NavItem to="/syllabuses" icon={<Icons.Syllabus />} label={t.syllabuses} />
              <NavItem to="/lectures" icon={<Icons.Lectures />} label={t.lectures} />
              <NavItem to="/assignments" icon={<Icons.Assignments />} label={t.assignments} />
              <NavItem to="/tests" icon={<Icons.Tests />} label={t.tests} />
              <NavItem to="/image-editor" icon={<Icons.Editor />} label={t.imageEditor} />
            </>
          )}

          {role === UserRole.STUDENT && (
            <>
              <NavItem to="/lectures" icon={<Icons.Lectures />} label={t.lectures} />
              <NavItem to="/assignments" icon={<Icons.Assignments />} label={t.assignments} />
              <NavItem to="/tests" icon={<Icons.Tests />} label={t.tests} />
              <NavItem to="/syllabuses" icon={<Icons.Syllabus />} label={t.syllabuses} />
            </>
          )}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5 space-y-4">
          <div className="grid grid-cols-3 gap-1 bg-black/30 p-1 rounded-lg">
            {[Language.KK, Language.RU, Language.EN].map((l) => (
              <button
                key={l}
                onClick={() => onLangChange(l)}
                className={`py-1 rounded text-[8px] font-black uppercase transition-all ${
                  lang === l ? 'bg-purple-accent text-white shadow-sm' : 'text-slate-500 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <button 
            onClick={onLogout}
            className="w-full py-2.5 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-white rounded-lg text-[10px] font-black transition-all border border-white/5 uppercase tracking-widest"
          >
            {t.logout}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-charcoal/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-purple-accent rounded-full"></div>
            <div className="text-white font-black text-sm uppercase tracking-[0.2em]">
              Digital Academic Hub
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="block text-xs font-black text-white leading-none">{userName}</span>
              <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">{role}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-white/5 text-purple-accent border border-white/10 flex items-center justify-center font-black text-xs">
              {userName?.charAt(0) || role.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
        isActive ? 'bg-purple-accent/10 text-purple-accent border border-purple-accent/20 shadow-inner' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
      }`
    }
  >
    <span className={`transition-transform duration-200 group-hover:scale-110`}>{icon}</span>
    <span className="font-bold text-[12px] tracking-tight uppercase">{label}</span>
  </NavLink>
);
