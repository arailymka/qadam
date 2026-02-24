import React, { useState, useEffect } from 'react';
// Исправлен путь к типам (убрана лишняя точка, так как файл рядом)
import { Language, translations, Group, Professor, UserRole, Subject, StudentSubmission } from './types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';

interface DashboardProps {
  lang: Language;
  role: UserRole;
}

export const Dashboard: React.FC<DashboardProps> = ({ lang, role }) => {
  // Добавлена защита на случай, если lang еще не определен
  const t = translations[lang] || translations[Language.RU]; 
  
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

  const totalStudents = groups.reduce((acc, g) => acc + (g.students?.length || 0), 0);

  const getFilteredChartData = () => {
    const seed = (selectedSubjectId.length + selectedGroupId.length + selectedStudentEmail.length + selectedWeek) % 10;
    return [
      { name: 'Mon', avg: 70 + seed },
      { name: 'Tue', avg: 75 + seed },
      { name: 'Wed', avg: 82 + seed },
      { name: 'Thu', avg: 78 + seed },
      { name: 'Fri', avg: 85 + seed },
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
        <div className="glass-dark p-10 rounded-[40px] shadow-2xl border border-white/10">
          <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4">Security Settings</h3>
          <div className="max-w-md flex gap-4">
            <input
              type="text"
              className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none"
              placeholder="New password"
              value={newAdminPass}
              onChange={(e) => setNewAdminPass(e.target.value)}
            />
            <button onClick={handleUpdateAdminPass} className="px-8 py-4 bg-purple-accent text-white font-black rounded-2xl">Save</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard title={t.totalStudents} value={totalStudents.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
        <StatCard title={t.totalGroups} value={groups.length.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/><path d="M13 13h4"/><path d="M13 17h4"/></svg>} />
        <StatCard title={role === UserRole.ADMIN ? t.totalProfs : "Active Tests"} value={role === UserRole.ADMIN ? profs.length.toString() : "3"} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 glass-dark p-10 rounded-[40px] border border-white/5">
          <div className="flex flex-col md:flex-row justify-between mb-10 gap-6">
            <h3 className="text-2xl font-black text-white">{t.analytics}</h3>
            <div className="flex flex-wrap gap-3">
              <select className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none" value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)}>
                <option value="">{t.allSubjects}</option>
                {subjects.map(s => <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{fill: 'rgba(255,255,255,0.3)'}} />
                <YAxis tick={{fill: 'rgba(255,255,255,0.3)'}} />
                <Tooltip contentStyle={{backgroundColor: '#121212', borderRadius: '12px'}} />
                <Bar dataKey="avg" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Исправлены типы в пропсах для предотвращения ошибок сборки
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="glass-dark p-10 rounded-[40px] shadow-2xl border border-white/5 flex items-center justify-between group hover:border-purple-accent/30 transition-all cursor-default">
    <div>
      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{title}</p>
      <p className="text-6xl font-black text-white mt-4 tracking-tighter group-hover:text-purple-accent transition-colors">{value}</p>
    </div>
    <div className="p-6 bg-white/5 text-purple-accent rounded-[24px] group-hover:bg-purple-accent group-hover:text-white transition-all">
      {icon}
    </div>
  </div>
);
