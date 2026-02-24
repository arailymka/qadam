
import React, { useState, useRef, useEffect } from 'react';
import { Language, translations, SubmissionResult, UserRole, Group, AssignmentTask, StudentSubmission, Subject, IndividualAuditResult } from '../types';
import { GeminiService } from '../services/geminiService';

export const Assignments: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang];
  const [role, setRole] = useState<UserRole>(UserRole.GUEST);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<AssignmentTask[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);

  // UI State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMaxPoints, setNewMaxPoints] = useState(100);
  const [newDeadline, setNewDeadline] = useState('');
  const [targetGroupId, setTargetGroupId] = useState('');
  const [targetSubjectId, setTargetSubjectId] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('');
  const [attachedFile, setAttachedFile] = useState<{data: string, name: string} | null>(null);
  
  const [viewingSubsForId, setViewingSubsForId] = useState<string | null>(null);
  const [isGradingId, setIsGradingId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isSubmittingId, setIsSubmittingId] = useState<string | null>(null);
  const [isCheckingPlagiarismId, setIsCheckingPlagiarismId] = useState<string | null>(null);
  const [auditingSubId, setAuditingSubId] = useState<string | null>(null);
  const [viewingFileContent, setViewingFileContent] = useState<{name: string, data: string} | null>(null);

  // Bulk Delete State
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | 'bulk' | null>(null);

  // Student UI
  const [viewingAudit, setViewingAudit] = useState<IndividualAuditResult | null>(null);

  const gemini = useRef(new GeminiService());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Data
  useEffect(() => {
    const savedRole = localStorage.getItem('kaznpu_role') as UserRole;
    const savedEmail = (localStorage.getItem('kaznpu_email') || '').trim().toLowerCase();
    
    if (savedRole) setRole(savedRole);
    if (savedEmail) setUserEmail(savedEmail);

    const fetchData = async () => {
      try {
        const res = await fetch('/api/db');
        const db = await res.json();
        
        // Sync logic
        if (db.groups) setGroups(db.groups);
        if (db.subjects) setSubjects(db.subjects);
        
        // Migration logic for tasks
        const localTasks = localStorage.getItem('kaznpu_tasks');
        if (db.tasks && db.tasks.length === 0 && localTasks) {
          const parsed = JSON.parse(localTasks);
          if (parsed.length > 0) {
            setTasks(parsed);
            saveTasks(parsed);
          }
        } else if (db.tasks) {
          setTasks(db.tasks);
        }

        // Migration logic for submissions
        const localSubs = localStorage.getItem('kaznpu_submissions');
        if (db.submissions && db.submissions.length === 0 && localSubs) {
          const parsed = JSON.parse(localSubs);
          if (parsed.length > 0) {
            setSubmissions(parsed);
            saveSubmissions(parsed);
          }
        } else if (db.submissions) {
          setSubmissions(db.submissions);
        }

        // Get user name if student
        if (db.groups && savedEmail) {
          const student = db.groups.flatMap((x: Group) => x.students).find((s: any) => s.email.trim().toLowerCase() === savedEmail);
          if (student) setUserName(student.name);
        }
      } catch (e) {
        console.error("Failed to fetch from server", e);
      }
    };

    fetchData();
    const interval = setInterval(() => {
      if (isSubmittingId === null) {
        fetchData();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isSubmittingId]);

  const saveTasks = async (newTasks: AssignmentTask[]) => {
    setTasks(newTasks);
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'tasks', data: newTasks })
      });
    } catch (e) { console.error(e); }
  };

  const saveSubmissions = async (newSubs: StudentSubmission[]) => {
    setSubmissions(newSubs);
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'submissions', data: newSubs })
      });
    } catch (e) { console.error(e); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: any) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        alert("File too large. Max 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setter({ data: reader.result as string, name: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateTask = () => {
    if (!newTitle || !newDesc || !targetGroupId || !targetSubjectId) {
      alert("Please fill all fields");
      return;
    }

    if (editingTaskId) {
      const updatedTasks = tasks.map(t => t.id === editingTaskId ? {
        ...t,
        subjectId: targetSubjectId,
        title: newTitle,
        description: newDesc,
        maxPoints: newMaxPoints,
        groupId: targetGroupId,
        deadline: newDeadline ? new Date(newDeadline).getTime() : undefined,
        fileData: attachedFile?.data || t.fileData,
        fileName: attachedFile?.name || t.fileName
      } : t);
      saveTasks(updatedTasks);
      setEditingTaskId(null);
      alert("Assignment Updated!");
    } else {
      const newTask: AssignmentTask = {
        id: Date.now().toString(),
        subjectId: targetSubjectId,
        title: newTitle,
        description: newDesc,
        maxPoints: newMaxPoints,
        groupId: targetGroupId,
        professorId: userEmail,
        createdAt: Date.now(),
        deadline: newDeadline ? new Date(newDeadline).getTime() : undefined,
        fileData: attachedFile?.data,
        fileName: attachedFile?.name
      };
      saveTasks([newTask, ...tasks]);
      alert("Assignment Created!");
    }
    
    setNewTitle(''); setNewDesc(''); setTargetGroupId(''); setTargetSubjectId(''); setAttachedFile(null); setNewDeadline('');
  };

  const startEditing = (task: AssignmentTask) => {
    setEditingTaskId(task.id);
    setNewTitle(task.title);
    setNewDesc(task.description);
    setNewMaxPoints(task.maxPoints);
    setTargetGroupId(task.groupId);
    setTargetSubjectId(task.subjectId);
    if (task.deadline) {
      const d = new Date(task.deadline);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const dateStr = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      setNewDeadline(dateStr);
    } else {
      setNewDeadline('');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTask = async (id: string) => {
    const updatedTasks = tasks.filter(t => String(t.id) !== String(id));
    const updatedSubs = submissions.filter(s => String(s.taskId) !== String(id));
    await saveTasks(updatedTasks);
    await saveSubmissions(updatedSubs);
    setShowDeleteConfirm(null);
  };

  const handleBulkDelete = async () => {
    const updatedTasks = tasks.filter(t => !selectedTaskIds.includes(t.id));
    const updatedSubs = submissions.filter(s => !selectedTaskIds.includes(s.taskId));
    await saveTasks(updatedTasks);
    await saveSubmissions(updatedSubs);
    setSelectedTaskIds([]);
    setShowDeleteConfirm(null);
  };

  const toggleTaskSelection = (id: string) => {
    setSelectedTaskIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDirectSubmit = async (taskId: string, file: File) => {
    const cleanEmail = userEmail.trim().toLowerCase();
    if (!cleanEmail) {
      alert("Error: User email not found. Please log in again.");
      return;
    }
    if (!taskId || !file) return;

    const isAlreadySubmitted = submissions.some(s => 
      String(s.taskId) === String(taskId) && 
      s.studentEmail.trim().toLowerCase() === cleanEmail
    );

    if (isAlreadySubmitted) {
      alert(t.alreadySubmitted);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Max 10MB.");
      return;
    }

    setIsSubmittingId(taskId);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const fileData = reader.result as string;
        const newSub: StudentSubmission = {
          id: Date.now().toString(),
          taskId: taskId,
          studentEmail: cleanEmail,
          studentName: userName || "Student",
          fileData: fileData,
          fileName: file.name,
          submittedAt: Date.now()
        };

        const updated = [newSub, ...submissions];
        await saveSubmissions(updated);
        alert(t.submissionSent);
      } catch (err) {
        console.error("Submission error:", err);
        alert("Error sending file.");
      } finally {
        setIsSubmittingId(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const previewFile = (data: string, name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.endsWith('.pdf')) {
      try {
        const parts = data.split(',');
        const byteString = atob(parts[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        const blob = new Blob([ab], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } catch (e) {
        alert("Error opening PDF.");
      }
    } else {
      setViewingFileContent({ name, data });
    }
  };

  const checkAntiPlagiarism = async (sub: StudentSubmission) => {
    if (!sub.fileData) return;
    setIsCheckingPlagiarismId(sub.id);
    try {
      const others = submissions
        .filter(s => s.taskId === sub.taskId && s.id !== sub.id)
        .map(s => ({ email: s.studentEmail, data: s.fileData }));

      const res = await gemini.current.checkPlagiarism(sub.fileData, others);
      const updated = submissions.map(s => s.id === sub.id ? { 
        ...s, 
        plagiarismScore: res.score, 
        similarStudentEmail: res.similarEmail 
      } : s);
      saveSubmissions(updated);
      alert(`Plagiarism Check Complete: ${res.score}% Originality.`);
    } catch (err) {
      alert("Plagiarism check failed.");
    } finally {
      setIsCheckingPlagiarismId(null);
    }
  };

  const runIndividualAudit = async (sub: StudentSubmission) => {
    const task = tasks.find(t => String(t.id) === String(sub.taskId));
    if (!task || !sub.fileData) return;
    setAuditingSubId(sub.id);
    try {
      const audit = await gemini.current.performIndividualAudit(sub.studentName, task.title, task.description, sub.fileData, lang);
      const updated = submissions.map(s => s.id === sub.id ? { ...s, individualAudit: audit } : s);
      saveSubmissions(updated);
      setViewingAudit(audit);
    } catch (err) {
      alert("AI Audit failed.");
    } finally {
      setAuditingSubId(null);
    }
  };

  const runAiGrading = async (sub: StudentSubmission) => {
    const task = tasks.find(t => String(t.id) === String(sub.taskId));
    if (!task || !sub.fileData) return;
    
    setIsGradingId(sub.id);
    try {
      const res = await gemini.current.gradeAssignment(task.description, sub.fileData, sub.fileName, lang, task.maxPoints);
      // Automatically calculate preliminary grade
      const updated = submissions.map(s => s.id === sub.id ? { ...s, aiResult: res, finalGrade: res.grade } : s);
      saveSubmissions(updated);
      alert("AI Grading Complete! Preliminary score calculated.");
    } catch (err) {
      alert("AI Grading failed.");
    } finally {
      setIsGradingId(null);
    }
  };

  const approveGrade = async (subId: string) => {
    const sub = submissions.find(s => s.id === subId);
    if (!sub) return;
    
    // Ensure the current state is saved to the server
    await saveSubmissions(submissions);
    alert(t.scoreAssigned);
  };

  const updateFinalGrade = (subId: string, grade: number) => {
    const updated = submissions.map(s => s.id === subId ? { ...s, finalGrade: grade } : s);
    saveSubmissions(updated);
  };

  // Filters
  const studentGroup = groups.find(g => g.students.some(s => s.email.trim().toLowerCase() === userEmail.trim().toLowerCase()));
  
  const filteredTasks = tasks.filter(task => {
    const matchesSubject = !filterSubjectId || task.subjectId === filterSubjectId;
    if (role === UserRole.ADMIN) return matchesSubject;
    if (role === UserRole.PROFESSOR) return task.professorId === userEmail && matchesSubject;
    if (role === UserRole.STUDENT) return task.groupId === studentGroup?.id && matchesSubject;
    return false;
  });

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-10 space-y-10 pb-32 animate-in fade-in duration-700">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="glass w-full max-w-md rounded-[32px] p-10 shadow-2xl animate-in zoom-in-95 border border-white/10">
            <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center text-4xl mb-8 mx-auto border border-rose-500/20">⚠️</div>
            <h3 className="text-2xl font-black text-center mb-3 text-white">{t.confirmDeletion}</h3>
            <p className="text-slate-400 text-center text-sm mb-10 leading-relaxed px-4">
              {showDeleteConfirm === 'bulk' 
                ? `This action will permanently remove ${selectedTaskIds.length} assignments and all associated student data.`
                : t.deleteAssignmentConfirm}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-4 bg-white/5 text-slate-300 font-black rounded-2xl hover:bg-white/10 transition-all border border-white/5"
              >
                {t.cancel}
              </button>
              <button 
                onClick={() => showDeleteConfirm === 'bulk' ? handleBulkDelete() : handleDeleteTask(showDeleteConfirm)}
                className="flex-1 py-4 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 shadow-xl shadow-rose-500/20 transition-all"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Result Modal */}
      {viewingAudit && (
        <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setViewingAudit(null)}>
          <div className="glass w-full max-w-3xl rounded-[40px] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="p-8 bg-charcoal/80 text-white flex justify-between items-center border-b border-white/5">
              <h3 className="text-2xl font-black uppercase tracking-tight">{t.auditTitle}</h3>
              <button onClick={() => setViewingAudit(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">✕</button>
            </div>
            <div className="p-10 overflow-auto space-y-8 custom-scrollbar">
              <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.topicMatchStatus}</span>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${viewingAudit.topicMatch ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {viewingAudit.topicMatch ? 'MATCHED' : 'MISMATCH'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">{t.requirementsMet}</p>
                  <ul className="space-y-3">
                    {viewingAudit.metPoints.map((p, i) => (
                      <li key={i} className="text-sm font-medium text-slate-300 flex gap-3">
                        <span className="text-emerald-500">✓</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-4">{t.missingRequirements}</p>
                  <ul className="space-y-3">
                    {viewingAudit.missingPoints.map((p, i) => (
                      <li key={i} className="text-sm font-medium text-slate-300 flex gap-3">
                        <span className="text-rose-500">!</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.critique}</p>
                <div className="p-8 bg-black/40 text-slate-300 rounded-3xl text-sm leading-relaxed font-medium italic border border-white/5">
                  "{viewingAudit.detailedCritique}"
                </div>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adherence Score</span>
                <span className="text-4xl font-black text-purple-accent">{viewingAudit.adherenceScore}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase">{t.assignments}</h1>
          <p className="text-purple-accent font-bold text-[10px] uppercase tracking-[0.3em] mt-2 opacity-80">{t.assignmentsDesc}</p>
        </div>
        
        <div className="flex items-center gap-4">
          {role === UserRole.PROFESSOR && selectedTaskIds.length > 0 && (
            <button 
              onClick={() => setShowDeleteConfirm('bulk')}
              className="px-8 py-3 bg-rose-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-700 transition-all animate-in slide-in-from-right-4"
            >
              🗑️ {t.deleteSelected} ({selectedTaskIds.length})
            </button>
          )}
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-3">{t.filter}:</span>
            <select 
              className="bg-transparent font-bold text-xs text-white outline-none pr-4 cursor-pointer"
              value={filterSubjectId}
              onChange={(e) => setFilterSubjectId(e.target.value)}
            >
              <option value="" className="bg-charcoal">{t.allSubjects}</option>
              {subjects.map(s => <option key={s.id} value={s.id} className="bg-charcoal">{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Task Creation Form */}
        <div className="lg:col-span-4 space-y-8">
          {role === UserRole.PROFESSOR && (
            <div className="glass rounded-[40px] p-10 space-y-8 border border-white/10 shadow-2xl sticky top-8">
              <div className="space-y-2">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                  {editingTaskId ? t.edit : t.createAssignment}
                </h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Define new academic goals</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.selectSubject}</label>
                  <select className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-purple-accent/50 transition-all appearance-none cursor-pointer" value={targetSubjectId} onChange={e => setTargetSubjectId(e.target.value)}>
                    <option value="" className="bg-charcoal">{t.selectSubject}</option>
                    {subjects.filter(s => s.professorId === userEmail).map(s => <option key={s.id} value={s.id} className="bg-charcoal">{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.selectGroup}</label>
                  <select className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-purple-accent/50 transition-all appearance-none cursor-pointer" value={targetGroupId} onChange={e => setTargetGroupId(e.target.value)}>
                    <option value="" className="bg-charcoal">{t.selectGroup}</option>
                    {groups.map(g => <option key={g.id} value={g.id} className="bg-charcoal">{g.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.assignmentTitle}</label>
                  <input type="text" placeholder={t.assignmentTitle} className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-purple-accent/50 transition-all" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.gradingCriteria}</label>
                  <textarea placeholder={t.placeholderDesc} className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 text-white font-medium text-sm h-40 resize-none outline-none focus:ring-2 focus:ring-purple-accent/50 transition-all custom-scrollbar" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.deadline}</label>
                  <input type="datetime-local" className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-purple-accent/50 transition-all invert brightness-200" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.attachFile}</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-3 bg-white/5 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:border-purple-accent hover:text-white transition-all flex items-center justify-center gap-2">
                      {attachedFile ? '✓ ' + attachedFile.name : `📎 ${t.attachFile}`}
                    </button>
                    {attachedFile && <button onClick={() => setAttachedFile(null)} className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500/20 transition-all">✕</button>}
                  </div>
                </div>
                <input type="file" className="hidden" ref={fileInputRef} onChange={e => handleFileUpload(e, setAttachedFile)} />
                
                <div className="flex gap-3 pt-4">
                  <button onClick={handleCreateTask} className="flex-1 py-5 bg-purple-accent text-white font-black rounded-2xl hover:bg-purple-600 shadow-xl shadow-purple-500/20 transition-all uppercase text-[11px] tracking-widest">
                    {editingTaskId ? t.saveChanges : t.createAssignment}
                  </button>
                  {editingTaskId && (
                    <button onClick={() => {
                      setEditingTaskId(null);
                      setNewTitle(''); setNewDesc(''); setTargetGroupId(''); setTargetSubjectId(''); setAttachedFile(null); setNewDeadline('');
                    }} className="w-14 h-14 bg-white/5 text-slate-400 rounded-2xl font-black hover:bg-white/10 transition-all flex items-center justify-center border border-white/5">✕</button>
                  )}
                </div>
              </div>
            </div>
          )}

          {role === UserRole.STUDENT && (
            <div className="glass rounded-[40px] p-10 space-y-8 border border-white/10 shadow-2xl sticky top-8">
              <div className="w-20 h-20 rounded-3xl bg-purple-accent/10 text-purple-accent flex items-center justify-center text-4xl border border-purple-accent/20">🎓</div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Student Profile</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-80">Academic Identity</p>
              </div>
              <div className="space-y-4">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Full Name</span>
                  <p className="text-lg font-black text-white">{userName}</p>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Academic Group</span>
                  <p className="text-lg font-black text-purple-accent">{studentGroup?.name}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Tasks List */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">{t.activeAssignments}</h2>
            <div className="h-px flex-1 bg-white/5"></div>
            <span className="text-[10px] font-black text-purple-accent bg-purple-accent/10 px-3 py-1 rounded-full border border-purple-accent/20">{filteredTasks.length} Total</span>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="glass p-24 rounded-[48px] border border-white/5 text-center space-y-4">
              <div className="text-6xl opacity-20">📭</div>
              <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No assignments found in this sector</p>
            </div>
          ) : (
            Object.entries(
              filteredTasks.reduce((acc, task) => {
                const subjectName = subjects.find(s => s.id === task.subjectId)?.name || 'Other';
                if (!acc[subjectName]) acc[subjectName] = [];
                acc[subjectName].push(task);
                return acc;
              }, {} as Record<string, AssignmentTask[]>)
            ).map(([subjectName, subjectTasks]) => (
              <div key={subjectName} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-purple-accent shadow-lg shadow-purple-500/50"></div>
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">{subjectName}</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {subjectTasks.map(task => {
                    const taskGroup = groups.find(g => String(g.id) === String(task.groupId));
                    const taskSubs = submissions.filter(s => String(s.taskId) === String(task.id));
                    const isViewing = viewingSubsForId === task.id;
                    const studentSub = role === UserRole.STUDENT ? taskSubs.find(s => s.studentEmail.trim().toLowerCase() === userEmail.trim().toLowerCase()) : null;
                    const isOverdue = task.deadline && Date.now() > task.deadline;
                    const isSelected = selectedTaskIds.includes(task.id);

                    return (
                      <div key={task.id} className={`glass-dark rounded-[40px] border transition-all duration-500 overflow-hidden group ${isSelected ? 'border-purple-accent ring-1 ring-purple-accent/50' : 'border-white/5 hover:border-white/10'}`}>
                        <div className="p-10 space-y-8">
                          <div className="flex justify-between items-start gap-6">
                            <div className="flex items-start gap-6">
                              {role === UserRole.PROFESSOR && (
                                <div className="pt-1.5">
                                  <input 
                                    type="checkbox" 
                                    className="w-6 h-6 rounded-lg border-white/10 bg-white/5 text-purple-accent focus:ring-purple-accent cursor-pointer transition-all"
                                    checked={isSelected}
                                    onChange={() => toggleTaskSelection(task.id)}
                                  />
                                </div>
                              )}
                              <div className="space-y-3">
                                <div className="flex flex-wrap gap-3 items-center">
                                  <span className="px-3 py-1 bg-purple-accent/10 text-purple-accent rounded-full text-[9px] font-black uppercase tracking-widest border border-purple-accent/20">
                                    {taskGroup?.name}
                                  </span>
                                  {task.deadline && (
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${isOverdue ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-white/5 text-slate-400 border border-white/5'}`}>
                                      <span className="text-xs">⏰</span> {t.deadline}: {new Date(task.deadline).toLocaleString()}
                                    </span>
                                  )}
                                  {role === UserRole.STUDENT && studentSub && (
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${studentSub.finalGrade !== undefined ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-purple-accent/10 text-purple-accent border border-purple-accent/20'}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${studentSub.finalGrade !== undefined ? 'bg-emerald-400' : 'bg-purple-accent animate-pulse'}`}></span>
                                      {studentSub.finalGrade !== undefined ? t.gradedStatus : t.submittedStatus}
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tight leading-tight group-hover:text-purple-accent transition-colors">{task.title}</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Published {new Date(task.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            
                            {(role === UserRole.PROFESSOR || role === UserRole.ADMIN) && (
                              <div className="flex gap-3">
                                <button 
                                  onClick={() => startEditing(task)}
                                  className="w-12 h-12 bg-white/5 text-slate-400 rounded-2xl border border-white/5 hover:bg-white/10 hover:text-white transition-all active:scale-90 flex items-center justify-center"
                                  title={t.edit}
                                >
                                  ✏️
                                </button>
                                <button 
                                  onClick={() => setShowDeleteConfirm(task.id)}
                                  className="w-12 h-12 bg-rose-500/5 text-rose-400 rounded-2xl border border-rose-500/10 hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-90 flex items-center justify-center"
                                  title={t.delete}
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="p-8 bg-white/5 rounded-[32px] border border-white/5 relative group/desc">
                            <p className="text-slate-300 text-sm leading-relaxed font-medium">
                              {task.description}
                            </p>
                            <div className="absolute top-4 right-4 text-white/5 text-4xl font-black select-none group-hover/desc:text-purple-accent/10 transition-colors">"</div>
                          </div>

                          <div className="flex flex-wrap gap-4 pt-2">
                            {(role === UserRole.PROFESSOR || role === UserRole.ADMIN) && (
                              <button 
                                onClick={() => setViewingSubsForId(isViewing ? null : task.id)}
                                className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${isViewing ? 'bg-purple-accent text-white shadow-purple-500/20' : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white'}`}
                              >
                                📁 {t.viewSubmissions} • {taskSubs.length} / {taskGroup?.students.length || 0}
                              </button>
                            )}
                            
                            {task.fileData && (
                              <button onClick={() => previewFile(task.fileData!, task.fileName!)} className="px-8 py-3.5 bg-white/5 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2">
                                📎 Resource Document
                              </button>
                            )}
                          </div>

                          {role === UserRole.STUDENT && studentSub && studentSub.finalGrade !== undefined && (
                            <div className="mt-8 p-10 bg-emerald-500/5 rounded-[40px] border border-emerald-500/10 flex items-center justify-between shadow-2xl relative overflow-hidden">
                              <div className="absolute -right-10 -bottom-10 text-emerald-500/5 text-[120px] font-black select-none">SCORE</div>
                              <div className="flex items-center gap-6 relative z-10">
                                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-[32px] flex items-center justify-center text-4xl border border-emerald-500/20 shadow-inner">🏆</div>
                                <div>
                                  <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.3em] mb-1">{t.gradedStatus}</p>
                                  <p className="text-2xl font-black text-white tracking-tight">{t.scoreReceived}</p>
                                </div>
                              </div>
                              <div className="text-right relative z-10">
                                <span className="text-7xl font-black text-emerald-400 tracking-tighter">{studentSub.finalGrade}</span>
                                <span className="text-sm font-black text-emerald-500/40 ml-2 uppercase tracking-widest">{t.points}</span>
                              </div>
                            </div>
                          )}

                          {role === UserRole.STUDENT && !studentSub && (
                            <div className="mt-8 p-10 bg-purple-accent/5 rounded-[40px] border border-purple-accent/10 space-y-8">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-purple-accent/10 text-purple-accent flex items-center justify-center text-xl border border-purple-accent/20">📤</div>
                                <h4 className="text-xs font-black text-white uppercase tracking-widest">
                                  {t.submitWork}
                                </h4>
                              </div>
                              <div className="space-y-4">
                                <label className={`w-full py-20 border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center gap-4 transition-all duration-500 cursor-pointer group/upload ${isSubmittingId === task.id ? 'opacity-50 cursor-wait border-white/5' : 'border-white/5 hover:border-purple-accent/50 hover:bg-purple-accent/5'}`}>
                                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-4xl group-hover/upload:scale-110 transition-transform">
                                    {isSubmittingId === task.id ? '⏳' : '📁'}
                                  </div>
                                  <div className="text-center space-y-1">
                                    <span className="block text-[11px] font-black uppercase tracking-widest text-white">
                                      {isSubmittingId === task.id ? t.uploading : t.uploadWorkFile}
                                    </span>
                                    <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-widest">PDF or Text Document • Max 10MB</span>
                                  </div>
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    disabled={isSubmittingId !== null}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleDirectSubmit(task.id, file);
                                    }} 
                                  />
                                </label>
                              </div>
                            </div>
                          )}

                          {isViewing && (
                            <div className="mt-10 space-y-4 animate-in slide-in-from-top-4">
                              <div className="flex items-center gap-4 mb-6">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Submission Roster</h4>
                                <div className="h-px flex-1 bg-white/5"></div>
                              </div>
                              <div className="grid grid-cols-1 gap-4">
                                {taskGroup?.students.map(student => {
                                  const sub = taskSubs.find(s => s.studentEmail.trim().toLowerCase() === student.email.trim().toLowerCase());
                                  return (
                                    <div key={student.id} className={`p-6 rounded-[32px] border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 ${sub ? 'bg-white/5 border-white/10' : 'bg-black/20 border-white/5 opacity-40'}`}>
                                      <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border ${sub ? 'bg-purple-accent/10 text-purple-accent border-purple-accent/20' : 'bg-white/5 text-slate-600 border-white/5'}`}>
                                          {student.name.charAt(0)}
                                        </div>
                                        <div>
                                          <p className="font-black text-white text-base tracking-tight">{student.name}</p>
                                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{sub ? `Timestamp: ${new Date(sub.submittedAt).toLocaleTimeString()}` : 'Awaiting Submission'}</p>
                                        </div>
                                      </div>

                                      {sub && (
                                        <div className="flex flex-wrap gap-2">
                                          <button onClick={() => previewFile(sub.fileData, sub.fileName)} className="px-4 py-2 bg-white/5 text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all">👁️ {t.viewBtn}</button>
                                          <button onClick={() => runAiGrading(sub)} className="px-4 py-2 bg-purple-accent/10 text-purple-accent rounded-xl text-[9px] font-black uppercase tracking-widest border border-purple-accent/20 hover:bg-purple-accent hover:text-white transition-all">
                                            {isGradingId === sub.id ? '...' : `🤖 ${t.aiGrade}`}
                                          </button>
                                          <button onClick={() => checkAntiPlagiarism(sub)} className="px-4 py-2 bg-white/5 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/10 hover:text-white transition-all">
                                            {isCheckingPlagiarismId === sub.id ? '...' : `🛡️ ${t.plagiarism}`}
                                          </button>
                                          <button 
                                            onClick={() => sub.individualAudit ? setViewingAudit(sub.individualAudit) : runIndividualAudit(sub)} 
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${sub.individualAudit ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'}`}
                                          >
                                            {auditingSubId === sub.id ? '...' : sub.individualAudit ? `📊 ${t.viewAudit}` : `🔍 ${t.auditBtn}`}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
