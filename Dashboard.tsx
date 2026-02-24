
import React, { useState, useEffect } from 'react';
import { Language, translations, Group, Professor, UserRole, Subject, StudentSubmission } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';

interface DashboardProps {
  lang: Language;
  role: UserRole;
}

export const Dashboard: React.FC<DashboardProps> = ({ lang, role }) => {
  const t = translations[lang];
  const [groups, setGroups] = useState<Group[]>([]);
  const [profs, setProfs] = useState<Professor[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [newAdminPass, setNewAdminPass] = useState('');

  // Analytics State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedStudentEmail, setSelectedStudentEmail] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/db');
        const db = await res.json();
        if (db.groups) setGroups(db.groups);
        if (db.professors) setProfs(db.professors);
        if (db.subjects) setSubjects(db.subjects);
        if (db.submissions) setSubmissions(db.submissions);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      }
    };
    fetchData();
  }, []);

  const totalStudents = groups.reduce((acc, g) => acc + g.students.length, 0);

  // Calculate Chart Data based on filters
  const getFilteredChartData = () => {
    // For prototype purposes, we'll generate some realistic-looking data based on filters
    // If we had real timestamped grades, we'd use those.
    // Here we'll use a seed based on the selection to make it consistent but dynamic.
    const seed = (selectedSubjectId.length + selectedGroupId.length + selectedStudentEmail.length + selectedWeek) % 10;
    
    return [
      { name: 'Mon', avg: 70 + seed + Math.random() * 5 },
      { name: 'Tue', avg: 75 + seed + Math.random() * 5 },
      { name: 'Wed', avg: 82 + seed + Math.random() * 5 },
      { name: 'Thu', avg: 78 + seed + Math.random() * 5 },
      { name: 'Fri', avg: 85 + seed + Math.random() * 5 },
    ];
  };

  const chartData = getFilteredChartData();

  const handleUpdateAdminPass = () => {
    if (!newAdminPass.trim()) return;
    const creds = { email: 'admin@qadam.edu.kz', pass: newAdminPass };
    localStorage.setItem('kaznpu_admin_creds', JSON.stringify(creds));
    alert('Admin password updated successfully!');
    setNewAdminPass('');
    setShowSettings(false);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-10 space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-end border-b border-white/5 pb-10">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase">{t.dashboard}</h2>
          <p className="text-purple-accent font-bold text-sm mt-2 tracking-widest uppercase opacity-80">
            {role === UserRole.ADMIN ? t.deptDashboard : 'Academic Year 2025/2026 • Welcome back'}
          </p>
        </div>
        {role === UserRole.ADMIN && (
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-4 glass border border-white/10 rounded-2xl hover:bg-white/10 transition-all shadow-xl text-purple-accent group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-500"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        )}
      </div>

      {showSettings && (
        <div className="glass-dark p-10 rounded-[40px] shadow-2xl animate-in slide-in-from-top-6 border border-white/10">
          <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4 tracking-tight">
            <div className="w-10 h-10 bg-purple-accent/20 rounded-xl flex items-center justify-center border border-purple-accent/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            Security Settings
          </h3>
          <div className="max-w-md space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Change Chief Admin Password</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:ring-2 focus:ring-purple-accent/50 font-bold placeholder:text-white/20"
                  placeholder="Enter new password"
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                />
                <button 
                  onClick={handleUpdateAdminPass}
                  className="px-8 py-4 bg-purple-accent text-white font-black rounded-2xl hover:bg-purple-600 transition-all shadow-lg shadow-purple-accent/20 uppercase text-xs tracking-widest"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          title={t.totalStudents} 
          value={totalStudents.toString()} 
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} 
          accent="purple-accent" 
        />
        <StatCard 
          title={t.totalGroups} 
          value={groups.length.toString()} 
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/><path d="M13 13h4"/><path d="M13 17h4"/></svg>} 
          accent="purple-accent" 
        />
        {role === UserRole.ADMIN ? (
          <StatCard 
            title={t.totalProfs} 
            value={profs.length.toString()} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} 
            accent="purple-accent" 
          />
        ) : (
          <StatCard 
            title="Active Tests" 
            value="3" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>} 
            accent="purple-accent" 
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 glass-dark p-10 rounded-[40px] shadow-2xl border border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <h3 className="text-2xl font-black text-white flex items-center gap-4 tracking-tight">
              <div className="w-10 h-10 bg-purple-accent/20 rounded-xl flex items-center justify-center border border-purple-accent/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              </div>
              {t.analytics}
            </h3>
            
            <div className="flex flex-wrap gap-3">
              <select 
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-purple-accent/50 text-white appearance-none cursor-pointer"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(w => <option key={w} value={w} className="bg-charcoal">Week {w}</option>)}
              </select>
              
              <select 
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-purple-accent/50 text-white appearance-none cursor-pointer"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
              >
                <option value="" className="bg-charcoal">{t.allSubjects}</option>
                {subjects.map(s => <option key={s.id} value={s.id} className="bg-charcoal">{s.name}</option>)}
              </select>

              <select 
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-purple-accent/50 text-white appearance-none cursor-pointer"
                value={selectedGroupId}
                onChange={(e) => {
                  setSelectedGroupId(e.target.value);
                  setSelectedStudentEmail('');
                }}
              >
                <option value="" className="bg-charcoal">{t.groups}</option>
                {groups.map(g => <option key={g.id} value={g.id} className="bg-charcoal">{g.name}</option>)}
              </select>

              {selectedGroupId && (
                <select 
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-purple-accent/50 text-white appearance-none cursor-pointer animate-in fade-in slide-in-from-left-2"
                  value={selectedStudentEmail}
                  onChange={(e) => setSelectedStudentEmail(e.target.value)}
                >
                  <option value="" className="bg-charcoal">{t.analyticsByStudent}</option>
                  {groups.find(g => g.id === selectedGroupId)?.students.map(s => (
                    <option key={s.email} value={s.email} className="bg-charcoal">{s.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: 'rgba(255,255,255,0.3)'}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.03)'}}
                  contentStyle={{ 
                    backgroundColor: '#121212', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 
                    fontWeight: '900',
                    color: '#fff',
                    textTransform: 'uppercase',
                    fontSize: '10px',
                    letterSpacing: '0.1em'
                  }}
                  itemStyle={{ color: '#a855f7' }}
                />
                <Bar dataKey="avg" fill="#a855f7" radius={[8, 8, 0, 0]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.avg > 80 ? '#a855f7' : 'rgba(168,85,247,0.4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-10 flex gap-10 border-t border-white/5 pt-10">
            <div className="flex-1 space-y-3">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{t.analyticsBySubject}</p>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-purple-accent w-[75%] shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{t.analyticsByGroup}</p>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-white/20 w-[62%]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 glass-dark p-10 rounded-[40px] shadow-2xl border border-white/5 flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-white tracking-tight">{role === UserRole.ADMIN ? t.manageProfessors : t.groups}</h3>
            <Link to={role === UserRole.ADMIN ? "/professors" : "/groups"} className="text-[10px] font-black text-purple-accent bg-purple-accent/10 px-4 py-2 rounded-xl border border-purple-accent/20 hover:bg-purple-accent hover:text-white transition-all uppercase tracking-widest">View All</Link>
          </div>
          <div className="space-y-4 flex-1">
            {role === UserRole.ADMIN ? (
               profs.length === 0 ? <p className="text-sm text-white/20 italic font-medium">No professors registered</p> :
               profs.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between p-5 bg-white/5 rounded-[24px] border border-white/5 hover:border-purple-accent/30 transition-all group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-accent/20 text-purple-accent flex items-center justify-center font-black text-sm border border-purple-accent/20 group-hover:bg-purple-accent group-hover:text-white transition-all">{p.name.charAt(0)}</div>
                    <span className="font-black text-white text-sm group-hover:text-purple-accent transition-colors">{p.name}</span>
                  </div>
                  <span className="text-[9px] bg-white/5 border border-white/10 text-white/40 px-3 py-1 rounded-lg font-black uppercase tracking-widest">Faculty</span>
                </div>
               ))
            ) : (
              groups.length === 0 ? (
                <p className="text-sm text-white/20 italic font-medium">No groups created yet</p>
              ) : (
                groups.slice(0, 5).map(group => (
                  <div key={group.id} className="flex items-center justify-between p-5 bg-white/5 rounded-[24px] border border-white/5 hover:border-purple-accent/30 transition-all group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-accent/20 text-purple-accent flex items-center justify-center font-black text-sm border border-purple-accent/20 group-hover:bg-purple-accent group-hover:text-white transition-all">{group.name.charAt(0)}</div>
                      <span className="font-black text-white text-sm group-hover:text-purple-accent transition-colors">{group.name}</span>
                    </div>
                    <span className="text-[9px] bg-white/5 border border-white/10 text-white/40 px-3 py-1 rounded-lg font-black uppercase tracking-widest">
                      {group.students.length} students
                    </span>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, accent }: any) => (
  <div className="glass-dark p-10 rounded-[40px] shadow-2xl border border-white/5 flex items-center justify-between group hover:border-purple-accent/30 transition-all duration-500 cursor-default relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-accent/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-accent/10 transition-colors"></div>
    <div className="relative z-10">
      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{title}</p>
      <p className="text-6xl font-black text-white mt-4 tracking-tighter group-hover:text-purple-accent transition-colors">{value}</p>
    </div>
    <div className={`p-6 bg-white/5 text-purple-accent rounded-[24px] group-hover:scale-110 transition-transform shadow-inner border border-white/10 relative z-10 group-hover:bg-purple-accent group-hover:text-white`}>
      {icon}
    </div>
  </div>
);
