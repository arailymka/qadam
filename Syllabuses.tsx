
import React, { useState, useRef, useEffect } from 'react';
import { Language, translations, Syllabus, UserRole, Subject } from '../types';
import { GeminiService } from '../services/geminiService';
import { db } from '../services/db';

interface SyllabusesProps {
  lang: Language;
}

export const Syllabuses: React.FC<SyllabusesProps> = ({ lang }) => {
  const t = translations[lang];
  const [course, setCourse] = useState('');
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.GUEST);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'link' | 'ai'>('upload');
  const [syllabusUrl, setSyllabusUrl] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const gemini = useRef(new GeminiService());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem('kaznpu_role') as UserRole;
    if (savedRole) setRole(savedRole);

    const savedEmail = localStorage.getItem('kaznpu_email') || '';
    setUserEmail(savedEmail);

    const fetchData = async () => {
      try {
        const res = await fetch('/api/db');
        const dbData = await res.json();
        
        if (dbData.subjects) setSubjects(dbData.subjects);

        // Migration logic
        const localSyllabuses = localStorage.getItem('kaznpu_syllabuses');
        if (dbData.syllabuses && dbData.syllabuses.length === 0 && localSyllabuses) {
          const parsed = JSON.parse(localSyllabuses);
          if (parsed.length > 0) {
            setSyllabuses(parsed);
            saveSyllabuses(parsed);
          }
        } else if (dbData.syllabuses) {
          setSyllabuses(dbData.syllabuses);
        }
      } catch (e) {
        console.error("Syllabuses fetch error:", e);
      }
    };

    fetchData();
  }, []);

  const saveSyllabuses = async (updated: Syllabus[]) => {
    setSyllabuses(updated);
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'syllabuses', data: updated })
      });
    } catch (e) { console.error(e); }
  };

  const handleGenerate = async () => {
    if (!course || !selectedSubjectId) {
      alert(t.selectSubject);
      return;
    }
    setIsGenerating(true);
    try {
      const res = await gemini.current.generateSyllabus(course, lang);
      const newSyllabus: Syllabus = { 
        ...res, 
        id: Date.now().toString(), 
        subjectId: selectedSubjectId,
        type: 'ai'
      };
      saveSyllabuses([newSyllabus, ...syllabuses]);
      setCourse('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedSubjectId || !course.trim()) {
      alert(t.courseNameLabel + " " + t.selectSubject);
      return;
    }
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const fileId = `syllabus_${Date.now()}`;
        
        try {
          // Store PDF in IndexedDB
          await db.set(fileId, base64);
          
          const newSyllabus: Syllabus = {
            id: Date.now().toString(),
            subjectId: selectedSubjectId,
            courseName: course || file.name.replace('.pdf', ''),
            description: 'Academic Document',
            type: 'pdf',
            pdfData: fileId // Store reference ID only
          };
          saveSyllabuses([newSyllabus, ...syllabuses]);
          setCourse('');
        } catch (err) {
          console.error("DB Store Error:", err);
          alert("Could not save file. Database error.");
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert(t.onlyPdfAllowed);
    }
  };

  const handleAddLink = () => {
    if (!selectedSubjectId || !course.trim() || !syllabusUrl.trim()) return;
    
    // Ensure absolute URL
    let finalUrl = syllabusUrl.trim();
    if (!finalUrl.startsWith('http')) {
      finalUrl = 'https://' + finalUrl;
    }

    const newSyllabus: Syllabus = {
      id: Date.now().toString(),
      subjectId: selectedSubjectId,
      courseName: course,
      description: 'External Link',
      type: 'link',
      url: finalUrl
    };
    saveSyllabuses([newSyllabus, ...syllabuses]);
    setCourse('');
    setSyllabusUrl('');
  };

  const deleteSyllabus = async (id: string) => {
    const item = syllabuses.find(s => s.id === id);
    if (item?.type === 'pdf' && item.pdfData) {
      await db.delete(item.pdfData);
    }
    saveSyllabuses(syllabuses.filter(s => s.id !== id));
    setShowDeleteConfirm(null);
  };

  const openPdf = async (fileId: string) => {
    try {
      const base64Data = await db.get(fileId);
      if (!base64Data) {
        alert("File not found in storage.");
        return;
      }

      const byteString = atob(base64Data.split(',')[1]);
      const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: mimeString });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.click();
      
      // Clean up memory
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (e) {
      console.error("Error opening PDF:", e);
      alert("Error opening PDF. It might be corrupted.");
    }
  };

  const mySubjects = subjects.filter(s => s.professorId === userEmail);

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
                onClick={() => deleteSyllabus(showDeleteConfirm)}
                className="flex-1 py-5 bg-rose-600 text-white font-black rounded-[24px] hover:bg-rose-700 shadow-2xl shadow-rose-600/20 transition-all uppercase text-xs tracking-widest"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-white/5 pb-10">
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase">{t.syllabuses}</h2>
        <p className="text-purple-accent font-bold text-sm mt-2 tracking-widest uppercase opacity-80">{t.syllabusesDesc}</p>
      </div>

      {(role === UserRole.PROFESSOR || role === UserRole.ADMIN) && (
        <div className="glass-dark p-10 rounded-[40px] shadow-2xl border border-white/5 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">{t.selectSubject}</label>
              <select
                className="w-full p-5 rounded-[24px] border border-white/10 font-black outline-none bg-white/5 focus:bg-white/10 transition-all text-white"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
              >
                <option value="" className="bg-charcoal text-white">{t.selectSubject}</option>
                {mySubjects.map(s => <option key={s.id} value={s.id} className="bg-charcoal text-white">{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-3">
               <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">{t.courseNameLabel}</label>
               <input
                type="text"
                className="w-full p-5 rounded-[24px] border border-white/10 font-black outline-none bg-white/5 focus:bg-white/10 transition-all text-white placeholder:text-white/20"
                placeholder="e.g. Data Structures 101"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex p-1.5 bg-white/5 rounded-[24px] border border-white/10">
               {(['upload', 'link', 'ai'] as const).map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-purple-accent text-white shadow-2xl shadow-purple-accent/20' : 'text-white/40 hover:text-white/60'}`}
                 >
                   {tab === 'upload' ? 'PDF' : tab === 'link' ? 'Link' : 'AI'}
                 </button>
               ))}
            </div>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>

          <div className="animate-in slide-in-from-top-4 duration-500">
            {activeTab === 'upload' && (
              <div className="flex items-center gap-6">
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileUpload} />
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-4 px-10 py-5 bg-white text-charcoal rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-white/90 transition-all shadow-2xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  {t.uploadPdf}
                </button>
                <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">{t.onlyPdfAllowed}</span>
              </div>
            )}
            {activeTab === 'link' && (
              <div className="flex gap-4">
                <input 
                  type="url" 
                  className="flex-1 p-5 rounded-[24px] border border-white/10 outline-none text-sm font-black bg-white/5 text-white focus:bg-white/10 placeholder:text-white/20" 
                  placeholder="https://cloud-storage.com/syllabus.pdf" 
                  value={syllabusUrl} 
                  onChange={(e) => setSyllabusUrl(e.target.value)} 
                />
                <button onClick={handleAddLink} className="px-12 bg-purple-accent text-white font-black rounded-[24px] hover:bg-purple-600 transition-all text-xs uppercase tracking-widest shadow-2xl shadow-purple-accent/20">Add</button>
              </div>
            )}
            {activeTab === 'ai' && (
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !course || !selectedSubjectId}
                className="w-full py-6 bg-purple-accent text-white font-black rounded-[24px] hover:bg-purple-600 transition-all disabled:opacity-50 flex items-center justify-center gap-4 text-xs uppercase tracking-[0.2em] shadow-2xl shadow-purple-accent/40"
              >
                {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>✨ {t.generateBtn}</>}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="glass-dark rounded-[40px] border border-white/5 shadow-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-6 px-10 py-6 bg-white/5 border-b border-white/5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
           <div className="col-span-6">{t.syllabusCourseHeader}</div>
           <div className="col-span-3">{t.discipline}</div>
           <div className="col-span-2">{t.format}</div>
           <div className="col-span-1 text-right">{t.actions}</div>
        </div>
        
        <div className="divide-y divide-white/5">
          {syllabuses.length === 0 ? (
            <div className="py-32 text-center text-white/10 italic font-medium">No syllabuses available.</div>
          ) : (
            syllabuses.map((s) => (
              <div key={s.id} className="grid grid-cols-12 gap-6 px-10 py-8 items-center hover:bg-white/5 transition-all group">
                 <div className="col-span-6">
                    <h4 className="text-lg font-black text-white tracking-tight group-hover:text-purple-accent transition-colors">{s.courseName}</h4>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">{s.description}</p>
                 </div>
                 <div className="col-span-3">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{subjects.find(sub => sub.id === s.subjectId)?.name || 'N/A'}</span>
                 </div>
                 <div className="col-span-2">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${s.type === 'pdf' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : s.type === 'link' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-purple-accent/10 text-purple-accent border-purple-accent/20'}`}>
                      {s.type}
                    </span>
                 </div>
                 <div className="col-span-1 text-right flex justify-end gap-3">
                    {s.type === 'pdf' && (
                      <button onClick={() => openPdf(s.pdfData!)} className="p-3 text-white/20 hover:text-rose-500 transition-all hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      </button>
                    )}
                    {s.type === 'link' && (
                      <a href={s.url} target="_blank" rel="noreferrer" className="p-3 text-white/20 hover:text-blue-500 transition-all hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                      </a>
                    )}
                    {(role === UserRole.PROFESSOR || role === UserRole.ADMIN) && (
                      <button onClick={() => setShowDeleteConfirm(s.id)} className="p-3 text-rose-500/20 hover:text-rose-500 transition-all hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    )}
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
