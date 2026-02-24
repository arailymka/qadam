
import React, { useState, useEffect } from 'react';
import { Language, translations, Subject, UserRole } from '../types';

interface SubjectsProps { lang: Language; }

export const Subjects: React.FC<SubjectsProps> = ({ lang }) => {
  const t = translations[lang];
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newName, setNewName] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('kaznpu_email') || '';
    setProfEmail(savedEmail);
    
    const fetchData = async () => {
      try {
        const res = await fetch('/api/db');
        const db = await res.json();
        
        const localSubjects = localStorage.getItem('kaznpu_subjects');
        if (db.subjects.length === 0 && localSubjects) {
          const parsed = JSON.parse(localSubjects);
          if (parsed.length > 0) saveSubjects(parsed);
        } else if (db.subjects) {
          setSubjects(db.subjects);
        }
      } catch (e) {
        const saved = localStorage.getItem('kaznpu_subjects');
        if (saved) setSubjects(JSON.parse(saved));
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const saveSubjects = async (updated: Subject[]) => {
    setSubjects(updated);
    localStorage.setItem('kaznpu_subjects', JSON.stringify(updated));
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'subjects', data: updated })
      });
    } catch (e) { console.error(e); }
  };

  const handleAddSubject = () => {
    if (!newName.trim()) return;
    const newSub: Subject = { id: Date.now().toString(), name: newName, professorId: profEmail };
    saveSubjects([...subjects, newSub]);
    setNewName('');
  };

  const deleteSubject = (id: string) => {
    saveSubjects(subjects.filter(s => s.id !== id));
    setShowDeleteConfirm(null);
  };

  const mySubjects = subjects.filter(s => s.professorId === profEmail);

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
                onClick={() => deleteSubject(showDeleteConfirm)}
                className="flex-1 py-5 bg-rose-600 text-white font-black rounded-[24px] hover:bg-rose-700 shadow-2xl shadow-rose-600/20 transition-all uppercase text-xs tracking-widest"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-white/5 pb-10">
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase">{t.subjects}</h2>
        <p className="text-purple-accent font-bold text-sm mt-2 tracking-widest uppercase opacity-80">{t.subjectsDesc}</p>
      </div>

      <div className="glass-dark p-10 rounded-[40px] shadow-2xl border border-white/5 space-y-8">
        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block mb-2 ml-1">{t.addSubject}</label>
        <div className="flex flex-col md:flex-row gap-6">
          <input
            type="text"
            className="flex-1 p-5 rounded-[24px] border border-white/10 focus:ring-4 focus:ring-purple-accent/20 outline-none transition-all text-xl font-black bg-white/5 text-white placeholder:text-white/20"
            placeholder={t.subjectName}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            onClick={handleAddSubject}
            className="px-12 bg-purple-accent hover:bg-purple-600 text-white font-black rounded-[24px] transition-all shadow-2xl shadow-purple-accent/20 flex items-center justify-center gap-4 uppercase text-xs tracking-widest"
          >
            {t.addSubject}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mySubjects.length === 0 ? (
          <div className="col-span-full p-24 text-center glass-dark rounded-[40px] border-2 border-dashed border-white/5 text-white/10 italic font-medium">
            {t.noSubjects}
          </div>
        ) : (
          mySubjects.map(s => (
            <div key={s.id} className="glass-dark p-8 rounded-[40px] shadow-2xl border border-white/5 flex justify-between items-center group hover:border-purple-accent/30 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-purple-accent/10 text-purple-accent rounded-[24px] flex items-center justify-center border border-purple-accent/20 group-hover:bg-purple-accent group-hover:text-white transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                </div>
                <div>
                  <h3 className="font-black text-white text-2xl tracking-tight group-hover:text-purple-accent transition-colors">{s.name}</h3>
                  <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mt-1">Subject ID: {s.id.slice(-6)}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDeleteConfirm(s.id)}
                className="p-3.5 text-rose-500/30 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all border border-transparent hover:border-rose-500/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
