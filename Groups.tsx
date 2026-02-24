
import React, { useState, useEffect } from 'react';
import { Language, translations, Group, Student, UserRole } from '../types';

interface GroupsProps { lang: Language; userId: string; role: UserRole; }

export const Groups: React.FC<GroupsProps> = ({ lang, userId, role }) => {
  const t = translations[lang];
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  
  // Student form state
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPass, setStudentPass] = useState('');
  
  // Reset password state
  const [resetStudentId, setResetStudentId] = useState<string | null>(null);
  const [newStudentPass, setNewStudentPass] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{type: 'group' | 'student', id: string, groupId?: string} | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/db');
        const db = await res.json();
        
        const localGroups = localStorage.getItem('kaznpu_groups');
        if (db.groups.length === 0 && localGroups) {
          const parsed = JSON.parse(localGroups);
          if (parsed.length > 0) saveGroups(parsed);
        } else if (db.groups) {
          setGroups(db.groups);
        }
      } catch (e) {
        const saved = localStorage.getItem('kaznpu_groups');
        if (saved) setGroups(JSON.parse(saved));
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const saveGroups = async (newGroups: Group[]) => {
    setGroups(newGroups);
    localStorage.setItem('kaznpu_groups', JSON.stringify(newGroups));
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'groups', data: newGroups })
      });
    } catch (e) { console.error(e); }
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const newGroup: Group = { id: Date.now().toString(), name: newGroupName, professorId: userId, students: [] };
    saveGroups([...groups, newGroup]);
    setNewGroupName('');
  };

  const handleAddStudent = (groupId: string) => {
    const cleanEmail = studentEmail.trim().toLowerCase();
    if (!studentName.trim() || !cleanEmail || !studentPass.trim()) return;
    const updatedGroups = groups.map(g => {
      if (g.id === groupId) {
        const newStudent: Student = { 
          id: Date.now().toString(), 
          name: studentName.trim(), 
          email: cleanEmail, 
          password: studentPass.trim() 
        };
        return { ...g, students: [...g.students, newStudent] };
      }
      return g;
    });
    saveGroups(updatedGroups);
    setStudentName('');
    setStudentEmail('');
    setStudentPass('');
    setSelectedGroupId(null);
  };

  const handleResetStudentPassword = (groupId: string, studentId: string) => {
    if (!newStudentPass.trim()) return;
    const updatedGroups = groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          students: g.students.map(s => s.id === studentId ? { ...s, password: newStudentPass } : s)
        };
      }
      return g;
    });
    saveGroups(updatedGroups);
    setResetStudentId(null);
    setNewStudentPass('');
    alert(translations[lang].finalGradeSet); 
  };

  const deleteGroup = (id: string) => {
    saveGroups(groups.filter(g => g.id !== id));
    setShowDeleteConfirm(null);
  };
  const deleteStudent = (groupId: string, studentId: string) => {
    const updatedGroups = groups.map(g => {
      if (g.id === groupId) {
        return { ...g, students: g.students.filter(s => s.id !== studentId) };
      }
      return g;
    });
    saveGroups(updatedGroups);
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
                onClick={() => showDeleteConfirm.type === 'group' ? deleteGroup(showDeleteConfirm.id) : deleteStudent(showDeleteConfirm.groupId!, showDeleteConfirm.id)}
                className="flex-1 py-5 bg-rose-600 text-white font-black rounded-[24px] hover:bg-rose-700 shadow-2xl shadow-rose-600/20 transition-all uppercase text-xs tracking-widest"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-white/5 pb-10">
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase">{t.groups}</h2>
        <p className="text-purple-accent font-bold text-sm mt-2 tracking-widest uppercase opacity-80">{t.groupsDesc}</p>
      </div>

      <div className="glass-dark p-10 rounded-[40px] shadow-2xl border border-white/5 space-y-8">
        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block mb-2 ml-1">{t.createGroup}</label>
        <div className="flex flex-col md:flex-row gap-6">
          <input
            type="text"
            className="flex-1 p-5 rounded-[24px] border border-white/10 focus:ring-4 focus:ring-purple-accent/20 outline-none transition-all text-xl font-black bg-white/5 text-white placeholder:text-white/20"
            placeholder={t.groupName}
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <button
            onClick={handleCreateGroup}
            className="px-12 bg-purple-accent hover:bg-purple-600 text-white font-black rounded-[24px] transition-all shadow-2xl shadow-purple-accent/20 flex items-center justify-center gap-4 uppercase text-xs tracking-widest"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {t.createGroup}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {groups.map(group => (
          <div key={group.id} className="glass-dark rounded-[40px] shadow-2xl border border-white/5 overflow-hidden flex flex-col group transition-all hover:border-purple-accent/30">
            <div className="p-8 bg-white/5 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-purple-accent transition-colors">{group.name}</h3>
                <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em] mt-2">{group.students.length} {t.totalStudents.toLowerCase()}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedGroupId(selectedGroupId === group.id ? null : group.id)}
                  className={`p-3.5 rounded-2xl transition-all border ${selectedGroupId === group.id ? 'bg-purple-accent text-white border-purple-accent shadow-lg shadow-purple-accent/20' : 'bg-white/5 border-white/10 text-purple-accent hover:bg-purple-accent/10'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm({type: 'group', id: group.id})}
                  className="p-3.5 bg-white/5 border border-white/10 text-rose-500/40 rounded-2xl hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </div>

            {selectedGroupId === group.id && (
              <div className="p-10 glass border-b border-white/10 space-y-8 animate-in slide-in-from-top-6">
                <h4 className="text-[10px] font-black text-purple-accent uppercase tracking-[0.3em] ml-1">{t.addStudent}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">{t.studentName}</label>
                    <input type="text" placeholder={t.studentName} className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-purple-accent outline-none text-xs font-bold placeholder:text-white/20" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">{t.email}</label>
                    <input type="email" placeholder={t.email} className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-purple-accent outline-none text-xs font-bold placeholder:text-white/20" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">{t.passwordLabel}</label>
                    <input type="text" placeholder={t.passwordLabel} className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-purple-accent outline-none text-xs font-bold placeholder:text-white/20" value={studentPass} onChange={(e) => setStudentPass(e.target.value)} />
                  </div>
                </div>
                <button onClick={() => handleAddStudent(group.id)} className="w-full py-5 bg-purple-accent text-white font-black rounded-2xl hover:bg-purple-600 transition-all shadow-2xl shadow-purple-accent/20 text-xs uppercase tracking-[0.2em]">{t.addStudent}</button>
              </div>
            )}

            <div className="flex-1 p-8 space-y-6">
              <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-1">{t.studentList}</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-4 custom-scrollbar">
                {group.students.length === 0 ? (
                  <div className="p-16 text-center text-white/10 italic font-medium bg-white/5 rounded-[32px] border border-dashed border-white/10">
                    {t.noStudents}
                  </div>
                ) : (
                  group.students.map(student => (
                    <div key={student.id} className="flex flex-col p-5 rounded-[24px] hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group/student">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-xl bg-purple-accent/10 border border-purple-accent/20 text-purple-accent flex items-center justify-center font-black text-sm group-hover/student:bg-purple-accent group-hover/student:text-white transition-all">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-base font-black text-white tracking-tight group-hover/student:text-purple-accent transition-colors">{student.name}</p>
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">{student.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">Access Key:</span>
                              <code className="text-[10px] font-mono text-purple-accent/40 bg-purple-accent/5 px-2 py-0.5 rounded-lg border border-purple-accent/10">{student.password}</code>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                           {role === UserRole.ADMIN && (
                             <button 
                               onClick={() => setResetStudentId(resetStudentId === student.id ? null : student.id)}
                               className="px-4 py-2 bg-white/5 border border-white/10 text-white/40 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-accent hover:text-white transition-all"
                             >
                               {t.resetPassword}
                             </button>
                           )}
                           <button onClick={() => setShowDeleteConfirm({type: 'student', id: student.id, groupId: group.id})} className="p-2.5 text-rose-500/30 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        </div>
                      </div>
                      
                      {resetStudentId === student.id && (
                        <div className="mt-6 p-6 glass rounded-[24px] border border-white/10 flex flex-col md:flex-row gap-4 animate-in slide-in-from-top-4">
                           <div className="flex-1 space-y-2">
                             <label className="block text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">{t.newPassword}</label>
                             <input 
                                type="text" 
                                className="w-full p-3 bg-white/5 rounded-xl text-xs font-black text-white outline-none border border-white/10 focus:border-purple-accent transition-all"
                                placeholder={t.newPassword}
                                value={newStudentPass}
                                onChange={(e) => setNewStudentPass(e.target.value)}
                             />
                           </div>
                           <div className="flex items-end gap-3">
                             <button 
                                onClick={() => handleResetStudentPassword(group.id, student.id)}
                                className="px-8 py-3 bg-purple-accent text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-600 transition-all shadow-lg shadow-purple-accent/20"
                             >
                              OK
                             </button>
                             <button 
                                onClick={() => setResetStudentId(null)}
                                className="px-4 py-3 text-xs font-black text-white/30 uppercase tracking-widest hover:text-white transition-colors"
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
        ))}
      </div>
    </div>
  );
};
