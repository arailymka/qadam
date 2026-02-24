import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
// Импорт типов из текущей папки
import { Language, UserRole, Group, Student, Professor } from './types';

// Импорты компонентов (без расширений .tsx и без лишних папок)
import { Layout } from './Layout';
import { Dashboard } from './Dashboard';
import { Syllabuses } from './Syllabuses';
import { Assignments } from './Assignments';
import { Lectures } from './Lectures';
import { Tests } from './Tests';
import { ImageEditor } from './ImageEditor';
import { Groups } from './Groups';
import { Login } from './Login';
import { Professors } from './Professors';
import { Subjects } from './Subjects';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(Language.RU);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<Student | Professor | { name: string } | null>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem('kaznpu_role') as UserRole;
    const savedEmail = (localStorage.getItem('kaznpu_email') || '').trim().toLowerCase();
    
    if (savedRole === UserRole.ADMIN) {
      setUserRole(UserRole.ADMIN);
      setCurrentUser({ name: 'Head of Department' });
    } else if (savedRole === UserRole.PROFESSOR && savedEmail) {
      const savedProfs = localStorage.getItem('kaznpu_professors');
      const profs: Professor[] = JSON.parse(savedProfs || '[]');
      const prof = profs.find(p => p.email.trim().toLowerCase() === savedEmail);
      if (prof) {
        setUserRole(UserRole.PROFESSOR);
        setCurrentUser(prof);
      }
    } else if (savedRole === UserRole.STUDENT && savedEmail) {
      const savedGroups = localStorage.getItem('kaznpu_groups');
      const groups: Group[] = JSON.parse(savedGroups || '[]');
      const student = groups.flatMap(g => g.students).find(s => s.email.trim().toLowerCase() === savedEmail);
      if (student) {
        setUserRole(UserRole.STUDENT);
        setCurrentUser(student);
      }
    }
  }, []);

  const handleLogin = (role: UserRole, email?: string) => {
    setUserRole(role);
    localStorage.setItem('kaznpu_role', role);
    if (role === UserRole.ADMIN) {
      setCurrentUser({ name: 'Head of Department' });
    } else if (email) {
      const cleanEmail = email.trim().toLowerCase();
      localStorage.setItem('kaznpu_email', cleanEmail);
      if (role === UserRole.PROFESSOR) {
        const savedProfs = localStorage.getItem('kaznpu_professors');
        const profs: Professor[] = JSON.parse(savedProfs || '[]');
        setCurrentUser(profs.find(p => p.email.trim().toLowerCase() === cleanEmail) || { name: 'Professor' });
      } else {
        const savedGroups = localStorage.getItem('kaznpu_groups');
        const groups: Group[] = JSON.parse(savedGroups || '[]');
        setCurrentUser(groups.flatMap(g => g.students).find(s => s.email.trim().toLowerCase() === cleanEmail) || { name: 'Student' });
      }
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentUser(null);
    localStorage.removeItem('kaznpu_role');
    localStorage.removeItem('kaznpu_email');
  };

  if (!userRole) {
    return <Login lang={lang} onLogin={handleLogin} onLangChange={setLang} />;
  }

  const currentUserId = (currentUser as any)?.id || 'admin';

  return (
    <HashRouter>
      <Layout 
        lang={lang} 
        onLangChange={setLang} 
        role={userRole} 
        userName={(currentUser as any)?.name} 
        onLogout={handleLogout}
      >
        <Routes>
          <Route path="/" element={
            userRole === UserRole.STUDENT ? <Navigate to="/lectures" replace /> : <Dashboard lang={lang} role={userRole} />
          } />
          
          {userRole === UserRole.ADMIN && (
            <>
              <Route path="/professors" element={<Professors lang={lang} />} />
              <Route path="/groups" element={<Groups lang={lang} userId={currentUserId} role={userRole} />} />
            </>
          )}

          {userRole === UserRole.PROFESSOR && (
            <>
              <Route path="/subjects" element={<Subjects lang={lang} />} />
              <Route path="/groups" element={<Groups lang={lang} userId={currentUserId} role={userRole} />} />
              <Route path="/syllabuses" element={<Syllabuses lang={lang} />} />
              <Route path="/lectures" element={<Lectures lang={lang} />} />
              <Route path="/assignments" element={<Assignments lang={lang} />} />
              <Route path="/tests" element={<Tests lang={lang} />} />
              <Route path="/image-editor" element={<ImageEditor lang={lang} />} />
            </>
          )}

          {userRole === UserRole.STUDENT && (
            <>
              <Route path="/lectures" element={<Lectures lang={lang} />} />
              <Route path="/assignments" element={<Assignments lang={lang} />} />
              <Route path="/tests" element={<Tests lang={lang} />} />
              <Route path="/syllabuses" element={<Syllabuses lang={lang} />} />
            </>
          )}
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
