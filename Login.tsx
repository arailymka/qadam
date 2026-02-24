
import React, { useState, useEffect } from 'react';
import { Language, translations, UserRole, Group, Professor } from '../types';

interface LoginProps {
  lang: Language;
  onLogin: (role: UserRole, userEmail?: string) => void;
  onLangChange: (l: Language) => void;
}

const LoginIcons = {
  Admin: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  Professor: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Student: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  ),
  University: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 10 4.5V19a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-4a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5L12 3Z"/><path d="M12 10v4"/><path d="M9 10v4"/><path d="M15 10v4"/></svg>
  )
};

export const Login: React.FC<LoginProps> = ({ lang, onLogin, onLangChange }) => {
  const t = translations[lang];
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const remembered = localStorage.getItem('kaznpu_remembered');
    if (remembered) {
      const { email: savedEmail, pass: savedPass, role: savedRole, remember } = JSON.parse(remembered);
      if (remember) {
        setEmail(savedEmail);
        setPassword(savedPass);
        setRole(savedRole);
        setRememberMe(true);
      }
    }
  }, []);

  const saveRemembered = (currentRole: UserRole) => {
    if (rememberMe) {
      localStorage.setItem('kaznpu_remembered', JSON.stringify({ 
        email, 
        pass: password, 
        role: currentRole, 
        remember: true 
      }));
    } else {
      localStorage.removeItem('kaznpu_remembered');
    }
  };

  const handleStudentLogin = () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password.trim()) return;
    const savedGroups = localStorage.getItem('kaznpu_groups');
    if (savedGroups) {
      const groups: Group[] = JSON.parse(savedGroups);
      const student = groups.flatMap(g => g.students).find(s => s.email.trim().toLowerCase() === cleanEmail && s.password === password);
      if (student) {
        saveRemembered(UserRole.STUDENT);
        onLogin(UserRole.STUDENT, cleanEmail);
      } else {
        setError(lang === Language.KK ? "Электрондық пошта немесе құпия сөз қате" : lang === Language.RU ? "Неверная почта или пароль" : "Invalid email or password");
      }
    } else {
      setError(lang === Language.KK ? "Топтар жоқ" : lang === Language.RU ? "Группы не созданы" : "No groups created yet");
    }
  };

  const handleProfessorLogin = () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password.trim()) return;
    const savedProfs = localStorage.getItem('kaznpu_professors');
    const profs: Professor[] = JSON.parse(savedProfs || '[]');
    const prof = profs.find(p => p.email.trim().toLowerCase() === cleanEmail && p.password === password);
    if (prof) {
      saveRemembered(UserRole.PROFESSOR);
      onLogin(UserRole.PROFESSOR, cleanEmail);
    } else {
      setError(lang === Language.KK ? "Қате логин немесе құпия сөз" : lang === Language.RU ? "Неверный логин или пароль" : "Invalid login or password");
    }
  };

  const handleAdminLogin = () => {
    const savedAdmin = localStorage.getItem('kaznpu_admin_creds');
    const adminCreds = savedAdmin ? JSON.parse(savedAdmin) : { email: 'admin@kaznpu.kz', pass: 'admin123' };

    if (email === adminCreds.email && password === adminCreds.pass) {
      saveRemembered(UserRole.ADMIN);
      onLogin(UserRole.ADMIN, email);
    } else {
      setError(lang === Language.KK ? "Әкімшіге рұқсат жоқ" : lang === Language.RU ? "Доступ администратора отклонен" : "Admin access denied");
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6 font-inter relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-accent/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-accent/5 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full glass rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-700 flex flex-col border border-white/10 relative z-10">
        
        {/* Header Section */}
        <div className="p-12 text-center space-y-6">
          <div className="inline-flex p-6 rounded-[32px] bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl mb-2">
            <LoginIcons.University />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white leading-tight tracking-tighter uppercase">{t.title}</h1>
            <p className="text-purple-accent text-[10px] font-black uppercase tracking-[0.4em] mt-4 opacity-80">
              Білім шыңына бастар жол
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-12 pt-0 space-y-10">
          {!role ? (
            <div className="space-y-4">
              
              <LoginButton 
                onClick={() => setRole(UserRole.ADMIN)} 
                icon={<LoginIcons.Admin />} 
                label={t.loginAsAdmin} 
                variant="dark"
              />
              <LoginButton 
                onClick={() => setRole(UserRole.PROFESSOR)} 
                icon={<LoginIcons.Professor />} 
                label={t.loginAsProfessor} 
                variant="primary"
              />
              <LoginButton 
                onClick={() => setRole(UserRole.STUDENT)} 
                icon={<LoginIcons.Student />} 
                label={t.loginAsStudent} 
                variant="outline"
              />
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => {setRole(null); setError(''); setEmail(''); setPassword('');}} 
                  className="flex items-center gap-3 text-white/40 font-black text-[10px] uppercase tracking-[0.2em] hover:text-purple-accent transition-all group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
                  {lang === Language.RU ? 'Назад' : lang === Language.KK ? 'Артқа' : 'Back'}
                </button>
                <div className="flex items-center gap-3 px-4 py-1.5 bg-purple-accent/10 rounded-full border border-purple-accent/20">
                   <div className="w-2 h-2 rounded-full bg-purple-accent animate-pulse"></div>
                   <span className="text-[10px] font-black text-purple-accent uppercase tracking-widest">
                    {role === UserRole.STUDENT ? t.loginAsStudent : role === UserRole.PROFESSOR ? t.loginAsProfessor : t.loginAsAdmin}
                   </span>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">{t.enterEmail}</label>
                  <input
                    type="email"
                    className="w-full p-5 rounded-[24px] bg-white/5 border border-white/10 focus:bg-white/10 focus:ring-4 focus:ring-purple-accent/20 focus:border-purple-accent outline-none transition-all font-bold text-white placeholder-white/20 shadow-inner"
                    placeholder="example@kaznpu.kz"
                    value={email}
                    onChange={(e) => {setEmail(e.target.value); setError('');}}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">{t.passwordLabel}</label>
                  <input
                    type="password"
                    className="w-full p-5 rounded-[24px] bg-white/5 border border-white/10 focus:bg-white/10 focus:ring-4 focus:ring-purple-accent/20 focus:border-purple-accent outline-none transition-all font-bold text-white placeholder-white/20 shadow-inner"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {setPassword(e.target.value); setError('');}}
                  />
                </div>

                <div className="flex items-center gap-4 px-1">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      id="remember" 
                      className="peer w-6 h-6 rounded-xl border-white/10 bg-white/5 text-purple-accent focus:ring-purple-accent/50 cursor-pointer transition-all appearance-none border checked:bg-purple-accent checked:border-purple-accent"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <svg className="absolute w-4 h-4 text-white pointer-events-none hidden peer-checked:block left-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <label htmlFor="remember" className="text-[11px] font-bold text-white/40 cursor-pointer select-none hover:text-white/60 transition-colors">
                    {lang === Language.KK ? "Кіру мәліметтерін сақтау" : lang === Language.RU ? "Сохранить данные входа" : "Remember Credentials"}
                  </label>
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-[24px] animate-in shake duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <p className="text-rose-500 text-[11px] font-black uppercase tracking-tight">{error}</p>
                  </div>
                )}
              </div>

              <button
                onClick={role === UserRole.STUDENT ? handleStudentLogin : role === UserRole.PROFESSOR ? handleProfessorLogin : handleAdminLogin}
                className="w-full py-5 bg-purple-accent hover:bg-purple-600 text-white font-black rounded-[24px] transition-all shadow-2xl shadow-purple-accent/20 active:scale-95 uppercase tracking-[0.2em] text-xs"
              >
                {t.login}
              </button>

              {role === UserRole.ADMIN && (
                <div className="text-center pt-4">
                  <button 
                    onClick={() => setShowHint(!showHint)}
                    className="text-[9px] text-white/20 hover:text-purple-accent uppercase font-black tracking-[0.3em] transition-colors"
                  >
                    System Information
                  </button>
                  {showHint && (
                    <div className="mt-6 p-6 bg-white/5 rounded-[24px] text-[10px] text-white/40 font-mono text-left animate-in fade-in slide-in-from-top-2 border border-white/10 shadow-inner">
                      <span className="text-purple-accent/60 font-black">Chief Admin Credentials:</span><br/>
                      <div className="mt-2 space-y-1">
                        <div>ID: <span className="text-white/60">admin@kaznpu.kz</span></div>
                        <div>KEY: <span className="text-white/60">admin123</span></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Language Switcher */}
          <div className="pt-10 flex justify-center gap-3 border-t border-white/5">
            {[Language.KK, Language.RU, Language.EN].map((l) => (
              <button
                key={l}
                onClick={() => onLangChange(l)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  lang === l ? 'bg-purple-accent text-white shadow-lg shadow-purple-accent/20' : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <p className="mt-12 text-white/10 text-[9px] font-black uppercase tracking-[0.6em] text-center max-w-xs leading-loose relative z-10">
        Абай атындағы Қазақ Ұлттық Педагогикалық университеті 2026
      </p>
    </div>
  );
};

interface LoginButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant: 'dark' | 'primary' | 'outline';
}

const LoginButton: React.FC<LoginButtonProps> = ({ onClick, icon, label, variant }) => {
  const styles = {
    dark: "bg-white/5 text-white hover:bg-white/10 border border-white/10 shadow-xl",
    primary: "bg-purple-accent text-white hover:bg-purple-600 shadow-2xl shadow-purple-accent/20",
    outline: "bg-transparent border border-white/10 text-white/60 hover:border-purple-accent hover:text-white hover:bg-purple-accent/5 shadow-sm"
  };

  return (
    <button
      onClick={onClick}
      className={`w-full py-5 rounded-[24px] transition-all active:scale-[0.98] flex items-center justify-between px-8 group ${styles[variant]}`}
    >
      <span className="font-black text-xs tracking-widest uppercase">{label}</span>
      <div className={`p-2.5 rounded-xl transition-all ${variant === 'primary' ? 'bg-white/20 text-white' : 'bg-purple-accent/20 text-purple-accent group-hover:bg-purple-accent group-hover:text-white'}`}>
        {icon}
      </div>
    </button>
  );
};
