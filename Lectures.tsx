
import React, { useState, useEffect, useRef } from 'react';
import { Language, translations, Lecture, UserRole, Subject } from '../types';
import { GeminiService } from '../services/geminiService';
import { db } from '../services/db';

interface LecturesProps {
  lang: Language;
}

export const Lectures: React.FC<LecturesProps> = ({ lang }) => {
  const t = translations[lang];
  const [role, setRole] = useState<UserRole>(UserRole.GUEST);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'link' | 'ai'>('upload');
  const [viewingLecture, setViewingLecture] = useState<Lecture | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const gemini = useRef(new GeminiService());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem('kaznpu_role') as UserRole;
    const savedEmail = localStorage.getItem('kaznpu_email') || '';
    if (savedRole) setRole(savedRole);
    if (savedEmail) setUserEmail(savedEmail);

    const fetchData = async () => {
      try {
        const res = await fetch('/api/db');
        const dbData = await res.json();
        
        if (dbData.subjects) setSubjects(dbData.subjects);

        // Migration logic
        const localLectures = localStorage.getItem('kaznpu_lectures');
        if (dbData.lectures && dbData.lectures.length === 0 && localLectures) {
          const parsed = JSON.parse(localLectures);
          if (parsed.length > 0) {
            setLectures(parsed);
            saveLectures(parsed);
          }
        } else if (dbData.lectures) {
          setLectures(dbData.lectures);
        }
      } catch (e) {
        console.error("Lectures fetch error:", e);
      }
    };

    fetchData();
  }, []);

  const saveLectures = async (updated: Lecture[]) => {
    setLectures(updated);
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'lectures', data: updated })
      });
    } catch (e) { console.error(e); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedSubjectId || !title.trim()) {
      alert("Please enter title and select subject first.");
      return;
    }
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const fileId = `lecture_${Date.now()}`;
        
        try {
          await db.set(fileId, base64);
          
          const newLecture: Lecture = {
            id: Date.now().toString(),
            subjectId: selectedSubjectId,
            title: title,
            type: 'pdf',
            url: fileId,
            createdAt: Date.now()
          };
          saveLectures([newLecture, ...lectures]);
          setTitle('');
        } catch (err) {
          console.error(err);
          alert("Database storage full or inaccessible.");
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert(t.onlyPdfAllowed);
    }
  };

  const handleAddLink = () => {
    if (!selectedSubjectId || !title.trim() || !url.trim()) return;
    
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http')) finalUrl = 'https://' + finalUrl;

    const newLecture: Lecture = {
      id: Date.now().toString(),
      subjectId: selectedSubjectId,
      title: title,
      type: 'link',
      url: finalUrl,
      createdAt: Date.now()
    };
    saveLectures([newLecture, ...lectures]);
    setTitle('');
    setUrl('');
  };

  const handleGenerateAI = async () => {
    if (!selectedSubjectId || !title.trim()) return;
    setIsGenerating(true);
    try {
      const content = await gemini.current.generateLecture(title, lang);
      const newLecture: Lecture = {
        id: Date.now().toString(),
        subjectId: selectedSubjectId,
        title: title,
        type: 'ai',
        content: content,
        createdAt: Date.now()
      };
      saveLectures([newLecture, ...lectures]);
      setTitle('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteLecture = async (id: string) => {
    const item = lectures.find(l => l.id === id);
    if (item?.type === 'pdf' && item.url) {
      await db.delete(item.url);
    }
    saveLectures(lectures.filter(l => l.id !== id));
    setShowDeleteConfirm(null);
  };

  const openPdf = async (fileId: string) => {
    const base64Data = await db.get(fileId);
    if (!base64Data) return;

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
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const mySubjects = role === UserRole.PROFESSOR 
    ? subjects.filter(s => s.professorId === userEmail)
    : subjects;

  const filteredLectures = lectures.filter(l => 
    (!selectedSubjectId || l.subjectId === selectedSubjectId)
  );

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
                onClick={() => deleteLecture(showDeleteConfirm)}
                className="flex-1 py-5 bg-rose-600 text-white font-black rounded-[24px] hover:bg-rose-700 shadow-2xl shadow-rose-600/20 transition-all uppercase text-xs tracking-widest"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-10">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase">{t.lectures}</h2>
          <p className="text-purple-accent font-bold text-sm mt-2 tracking-widest uppercase opacity-80">{t.lecturesDesc}</p>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{t.filterBySubject}</span>
           <select 
             className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none font-black text-xs text-purple-accent focus:ring-4 focus:ring-purple-accent/20 transition-all shadow-2xl"
             value={selectedSubjectId}
             onChange={(e) => setSelectedSubjectId(e.target.value)}
           >
             <option value="" className="bg-charcoal text-white">{t.allSubjectsFilter}</option>
             {mySubjects.map(s => <option key={s.id} value={s.id} className="bg-charcoal text-white">{s.name}</option>)}
           </select>
        </div>
      </div>

      {role === UserRole.PROFESSOR && (
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
               <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">{t.lectureTitle}</label>
               <input
                 type="text"
                 className="w-full p-5 rounded-[24px] border border-white/10 font-black outline-none bg-white/5 focus:bg-white/10 transition-all text-white placeholder:text-white/20"
                 placeholder="e.g. Introduction to Binary Logic"
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
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
                   {tab === 'upload' ? t.uploadPdf : tab === 'link' ? t.lectureUrl : t.aiAssistant}
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
                    {t.selectPdfDoc}
                 </button>
                 <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">{t.onlyPdfAllowed}</span>
               </div>
             )}
             {activeTab === 'link' && (
               <div className="flex gap-4">
                 <input 
                   type="url" 
                   className="flex-1 p-5 rounded-[24px] border border-white/10 outline-none text-sm font-black bg-white/5 text-white focus:bg-white/10 placeholder:text-white/20" 
                   placeholder="Enter document URL (Google Docs, OneDrive, etc.)" 
                   value={url} 
                   onChange={(e) => setUrl(e.target.value)} 
                 />
                 <button onClick={handleAddLink} className="px-12 bg-purple-accent text-white font-black rounded-[24px] hover:bg-purple-600 transition-all text-xs uppercase tracking-widest shadow-2xl shadow-purple-accent/20">Add</button>
               </div>
             )}
             {activeTab === 'ai' && (
               <button 
                onClick={handleGenerateAI} 
                disabled={isGenerating || !title.trim()} 
                className="w-full py-6 bg-purple-accent text-white font-black rounded-[24px] hover:bg-purple-600 transition-all disabled:opacity-50 flex items-center justify-center gap-4 text-xs uppercase tracking-[0.2em] shadow-2xl shadow-purple-accent/40"
               >
                 {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>✨ {t.generateLecture}</>}
               </button>
             )}
          </div>
        </div>
      )}

      {viewingLecture ? (
        <div className="glass rounded-[40px] shadow-2xl border border-white/10 animate-in zoom-in-95 duration-700 overflow-hidden">
          <div className="p-10 bg-white/5 border-b border-white/10 flex justify-between items-center">
             <div>
                <p className="text-[10px] font-black text-purple-accent uppercase tracking-[0.3em] mb-2">{t.aiAssistant}</p>
                <h3 className="text-3xl font-black text-white tracking-tight">{viewingLecture.title}</h3>
             </div>
             <button onClick={() => setViewingLecture(null)} className="p-4 hover:bg-white/10 rounded-[20px] transition-all text-white/40 hover:text-white border border-transparent hover:border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
             </button>
          </div>
          <div className="p-12 md:p-20">
             <div className="max-w-4xl mx-auto">
                <div className="text-white/80 leading-relaxed font-medium text-xl whitespace-pre-wrap selection:bg-purple-accent/30">
                  {viewingLecture.content}
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="glass-dark rounded-[40px] border border-white/5 shadow-2xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-6 px-10 py-6 bg-white/5 border-b border-white/5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
             <div className="col-span-5">{t.lectureTitle}</div>
             <div className="col-span-2">{t.discipline}</div>
             <div className="col-span-2">{t.format}</div>
             <div className="col-span-2">{t.dateAdded}</div>
             <div className="col-span-1 text-right">{t.actions}</div>
          </div>
          
          <div className="divide-y divide-white/5">
            {filteredLectures.length === 0 ? (
              <div className="py-32 text-center text-white/10 italic font-medium">
                {t.noLectures}
              </div>
            ) : (
              filteredLectures.map(lecture => (
                <div key={lecture.id} className="grid grid-cols-12 gap-6 px-10 py-8 items-center hover:bg-white/5 transition-all group">
                   <div className="col-span-5 flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${lecture.type === 'pdf' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : lecture.type === 'link' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-purple-accent/10 text-purple-accent border-purple-accent/20'}`}>
                        {lecture.type === 'pdf' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>}
                        {lecture.type === 'link' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>}
                        {lecture.type === 'ai' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>}
                      </div>
                      <span className="text-lg font-black text-white tracking-tight group-hover:text-purple-accent transition-colors">{lecture.title}</span>
                   </div>
                   <div className="col-span-2">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{subjects.find(s => s.id === lecture.subjectId)?.name || 'N/A'}</span>
                   </div>
                   <div className="col-span-2">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${lecture.type === 'pdf' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : lecture.type === 'link' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-purple-accent/10 text-purple-accent border-purple-accent/20'}`}>
                        {lecture.type}
                      </span>
                   </div>
                   <div className="col-span-2">
                      <span className="text-[10px] font-black text-white/20 font-mono tracking-widest">{new Date(lecture.createdAt).toLocaleDateString()}</span>
                   </div>
                   <div className="col-span-1 text-right flex items-center justify-end gap-3">
                      {lecture.type === 'pdf' && (
                        <button onClick={() => openPdf(lecture.url!)} className="p-3 text-white/20 hover:text-purple-accent transition-all hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10" title={t.viewBtn}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                      )}
                      {lecture.type === 'link' && (
                        <a href={lecture.url} target="_blank" rel="noreferrer" className="p-3 text-white/20 hover:text-blue-500 transition-all hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10" title="Open Link">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                        </a>
                      )}
                      {lecture.type === 'ai' && (
                        <button onClick={() => setViewingLecture(lecture)} className="p-3 text-white/20 hover:text-purple-accent transition-all hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10" title={t.viewBtn}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                        </button>
                      )}
                      {role === UserRole.PROFESSOR && (
                        <button onClick={() => setShowDeleteConfirm(lecture.id)} className="p-3 text-rose-500/20 hover:text-rose-500 transition-all hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20" title={t.delete}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      )}
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
