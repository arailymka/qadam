
import React, { useState, useEffect } from 'react';
import { Language, translations, Professor } from '../types';

interface ProfessorsProps {
  lang: Language;
}

export const Professors: React.FC<ProfessorsProps> = ({ lang }) => {
  const t = translations[lang];
  const [profs, setProfs] = useState<Professor[]>(() => {
    const saved = localStorage.getItem('kaznpu_professors');
    return saved ? JSON.parse(saved) : [];
  });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetId, setResetId] = useState<string | null>(null);
  const [newPass, setNewPass] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('kaznpu_professors', JSON.stringify(profs));
  }, [profs]);

  const handleAddProf = () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim() || !cleanEmail || !password.trim()) return;
    const newProf: Professor = {
      id: Date.now().toString(),
      name: name.trim(),
      email: cleanEmail,
      password: password.trim()
    };
    setProfs([...profs, newProf]);
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleReset = (id: string) => {
    if (!newPass.trim()) return;
    setProfs(profs.map(p => p.id === id ? { ...p, password: newPass } : p));
    setResetId(null);
    setNewPass('');
  };

  const deleteProf = (id: string) => {
    setProfs(profs.filter(p => p.id !== id));
    setShowDeleteConfirm(null);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-10 space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="glass w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 border border-white/10">
            <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-[24px] flex items-center justify-center text-4xl mb-8 mx-auto border border-rose-500/30">⚠️</div>
            <h3 className="text-2xl font-black text-center text-white mb-4 tracking-tight">{t.confirmDeletion}</h3>
            <p className="text-white/40 text-center text-sm mb-10 leading-relaxed">
              {t.deleteAssignmentConfirm}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-5 bg-white/5 text-white/60 font-black rounded-[24px] hover:bg-white/10 transition-all uppercase text-xs tracking-widest border border-white/5"
              >
                {t.cancel}
              </button>
              <button 
                onClick={() => deleteProf(showDeleteConfirm)}
                className="flex-1 py-5 bg-rose-600 text-white font-black rounded-[24px] hover:bg-rose-700 shadow-2xl shadow-rose-600/20 transition-all uppercase text-xs tracking-widest"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-white/5 pb-10">
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase">{t.manageProfessors}</h2>
        <p className="text-purple-accent font-bold text-sm mt-2 tracking-widest uppercase opacity-80">{t.professorsDesc}</p>
      </div>

      <div className="glass-dark p-10 rounded-[40px] shadow-2xl border border-white/5 space-y-10">
        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-1">{t.addProfessor}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">{t.professorName}</label>
            <input
              type="text"
              className="w-full p-5 rounded-[24px] border border-white/10 focus:ring-4 focus:ring-purple-accent/20 outline-none transition-all font-bold bg-white/5 text-white placeholder:text-white/20"
              placeholder={t.professorName}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">{t.email}</label>
            <input
              type="email"
              className="w-full p-5 rounded-[24px] border border-white/10 focus:ring-4 focus:ring-purple-accent/20 outline-none transition-all font-bold bg-white/5 text-white placeholder:text-white/20"
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">{t.passwordLabel}</label>
            <input
              type="text"
              className="w-full p-5 rounded-[24px] border border-white/10 focus:ring-4 focus:ring-purple-accent/20 outline-none transition-all font-bold bg-white/5 text-white placeholder:text-white/20"
              placeholder={t.passwordLabel}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={handleAddProf}
          className="w-full md:w-auto px-16 py-5 bg-purple-accent hover:bg-purple-600 text-white font-black rounded-[24px] transition-all shadow-2xl shadow-purple-accent/20 uppercase text-xs tracking-[0.2em]"
        >
          {t.addProfessor}
        </button>
      </div>

      <div className="glass-dark rounded-[40px] shadow-2xl border border-white/5 overflow-hidden">
        <div className="p-8 bg-white/5 border-b border-white/5">
          <h3 className="font-black text-white/40 uppercase tracking-[0.3em] text-[10px]">{t.profList}</h3>
        </div>
        <div className="divide-y divide-white/5">
          {profs.length === 0 ? (
            <div className="p-20 text-center text-white/20 italic font-medium">No professors registered yet</div>
          ) : (
            profs.map(prof => (
              <div key={prof.id} className="p-8 hover:bg-white/5 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-purple-accent/10 text-purple-accent flex items-center justify-center font-black text-xl border border-purple-accent/20 group-hover:bg-purple-accent group-hover:text-white transition-all">
                      {prof.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-white text-2xl tracking-tight group-hover:text-purple-accent transition-colors">{prof.name}</h4>
                      <p className="text-sm text-white/40 font-medium mt-1">{prof.email}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Access Key:</span>
                        <code className="text-[10px] font-mono text-purple-accent/60 bg-purple-accent/5 px-2 py-1 rounded-lg border border-purple-accent/10">{prof.password}</code>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setResetId(prof.id)}
                      className="px-6 py-3 bg-white/5 text-white/60 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-accent hover:text-white transition-all border border-white/5"
                    >
                      {t.resetPassword}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(prof.id)}
                      className="p-3.5 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                </div>

                {resetId === prof.id && (
                  <div className="mt-8 p-8 glass rounded-[32px] border border-white/10 flex flex-col md:flex-row gap-6 animate-in slide-in-from-top-4">
                    <div className="flex-1 space-y-2">
                      <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">{t.newPassword}</label>
                      <input
                        type="text"
                        className="w-full p-4 rounded-2xl border border-white/10 outline-none text-sm bg-white/5 text-white font-bold focus:ring-2 focus:ring-purple-accent/50"
                        placeholder={t.newPassword}
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end gap-4">
                      <button
                        onClick={() => handleReset(prof.id)}
                        className="px-10 py-4 bg-purple-accent text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-purple-600 transition-all shadow-lg shadow-purple-accent/20"
                      >
                        OK
                      </button>
                      <button 
                        onClick={() => setResetId(null)} 
                        className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
      </div>
    </div>
  </div>
  );
};
