
import React, { useState, useRef, useEffect } from 'react';
import { Language, translations, TestQuestion, UserRole, Group, Test, TestResult, Student, Subject } from '../types';
import { GeminiService } from '../services/geminiService';

interface TestsProps {
  lang: Language;
}

export const Tests: React.FC<TestsProps> = ({ lang }) => {
  const t = translations[lang];
  const [role, setRole] = useState<UserRole>(UserRole.GUEST);
  const [userEmail, setUserEmail] = useState('');
  
  // Creation state
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(10);
  const [variants, setVariants] = useState(4);
  const [maxScore, setMaxScore] = useState(100);
  const [creationMode, setCreationMode] = useState<'ai' | 'manual'>('ai');
  const [deadline, setDeadline] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  
  // Manual creation temp state
  const [manualQuestions, setManualQuestions] = useState<TestQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState('');
  const [currentOptions, setCurrentOptions] = useState<string[]>(['', '', '', '']);
  const [currentCorrect, setCurrentCorrect] = useState(0);

  // General temp state
  const [tempQuestions, setTempQuestions] = useState<TestQuestion[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewingResultsForId, setViewingResultsForId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Global storage
  const [groups, setGroups] = useState<Group[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [publishedTests, setPublishedTests] = useState<Test[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  
  // Student taking test
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<number, number>>({});
  const [testCompleted, setTestCompleted] = useState<{score: number, total: number} | null>(null);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);

  const gemini = useRef(new GeminiService());

  useEffect(() => {
    const savedRole = localStorage.getItem('kaznpu_role') as UserRole;
    const savedEmail = localStorage.getItem('kaznpu_email') || '';
    if (savedRole) setRole(savedRole);
    if (savedEmail) setUserEmail(savedEmail);

    const fetchData = async () => {
      try {
        const res = await fetch('/api/db');
        const db = await res.json();
        
        if (db.groups) setGroups(db.groups);
        if (db.subjects) setSubjects(db.subjects);

        // Migration for tests
        const localTests = localStorage.getItem('kaznpu_published_tests');
        if (db.tests && db.tests.length === 0 && localTests) {
          const parsed = JSON.parse(localTests);
          if (parsed.length > 0) {
            setPublishedTests(parsed);
            saveTests(parsed);
          }
        } else if (db.tests) {
          setPublishedTests(db.tests);
        }

        // Migration for results
        const localResults = localStorage.getItem('kaznpu_test_results');
        if (db.testResults && db.testResults.length === 0 && localResults) {
          const parsed = JSON.parse(localResults);
          if (parsed.length > 0) {
            setTestResults(parsed);
            saveResults(parsed);
          }
        } else if (db.testResults) {
          setTestResults(db.testResults);
        }
      } catch (e) {
        console.error("Tests fetch error:", e);
      }
    };

    fetchData();
  }, []);

  const saveTests = async (updated: Test[]) => {
    setPublishedTests(updated);
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'tests', data: updated })
      });
    } catch (e) { console.error(e); }
  };

  const saveResults = async (updated: TestResult[]) => {
    setTestResults(updated);
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'testResults', data: updated })
      });
    } catch (e) { console.error(e); }
  };

  // Timer logic for students
  useEffect(() => {
    let interval: number;
    if (activeTest && activeTest.duration && timerRemaining !== null && timerRemaining > 0) {
      interval = window.setInterval(() => {
        setTimerRemaining(prev => {
          if (prev === null || prev <= 1) {
            handleFinishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTest, timerRemaining]);

  const handleGenerateAI = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const res = await gemini.current.generateTest(topic, count, variants, lang);
      setTempQuestions(res);
    } catch (err) {
      console.error(err);
      alert("Error generating test. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addManualQuestion = () => {
    if (!currentQ || currentOptions.some(o => !o)) return;
    const newQ: TestQuestion = {
      question: currentQ,
      options: [...currentOptions],
      correctAnswer: currentCorrect
    };
    setManualQuestions([...manualQuestions, newQ]);
    setCurrentQ('');
    setCurrentOptions(new Array(variants).fill(''));
    setCurrentCorrect(0);
  };

  const handlePublish = () => {
    const finalQuestions = creationMode === 'ai' ? tempQuestions : manualQuestions;
    if (!selectedGroupId || !selectedSubjectId || finalQuestions.length === 0) {
      alert("Please select group, subject and add questions.");
      return;
    }
    
    const newTest: Test = {
      id: Date.now().toString(),
      subjectId: selectedSubjectId,
      topic: topic || "Manual Test",
      questions: finalQuestions,
      maxScore: maxScore,
      assignedGroupId: selectedGroupId,
      createdAt: Date.now(),
      deadline: deadline ? new Date(deadline).getTime() : undefined,
      duration: duration > 0 ? duration : undefined
    };

    const updated = [...publishedTests, newTest];
    saveTests(updated);
    
    // Reset
    setTempQuestions([]);
    setManualQuestions([]);
    setTopic('');
    setSelectedGroupId('');
    setSelectedSubjectId('');
    setDeadline('');
    setDuration(0);
    alert('Test published successfully!');
  };

  const startTest = (test: Test) => {
    setActiveTest(test);
    setStudentAnswers({});
    if (test.duration) {
      setTimerRemaining(test.duration * 60);
    } else {
      setTimerRemaining(null);
    }
  };

  const handleFinishTest = () => {
    if (testCompleted) return;
    const testToGrade = activeTest;
    if (!testToGrade) return;

    let correctCount = 0;
    testToGrade.questions.forEach((q, i) => {
      if (studentAnswers[i] === q.correctAnswer) correctCount++;
    });
    const score = Math.round((correctCount / testToGrade.questions.length) * testToGrade.maxScore);
    const result: TestResult = {
      testId: testToGrade.id,
      studentEmail: userEmail,
      score: score,
      total: testToGrade.maxScore,
      timestamp: Date.now()
    };
    const updatedResults = [...testResults, result];
    saveResults(updatedResults);
    setTestCompleted({ score, total: testToGrade.maxScore });
    setTimerRemaining(null);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const deleteTest = (id: string) => {
    const updated = publishedTests.filter(t => t.id !== id);
    saveTests(updated);
    setShowDeleteConfirm(null);
  };

  const mySubjects = subjects.filter(s => s.professorId === userEmail);

  if (role === UserRole.STUDENT) {
    const studentGroup = groups.find(g => g.students.some(s => s.email === userEmail));
    const studentTests = publishedTests.filter(t => t.assignedGroupId === studentGroup?.id);

    return (
      <div className="max-w-[1600px] mx-auto p-4 md:p-10 space-y-10 animate-in fade-in duration-700 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10">
          <div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase">{t.tests}</h2>
            <p className="text-purple-accent font-bold text-sm mt-2 tracking-widest uppercase opacity-80">{t.availableTests}</p>
          </div>
        </div>

        {testCompleted ? (
          <div className="glass p-16 rounded-[40px] border border-white/10 text-center space-y-8 shadow-2xl">
            <div className="text-8xl animate-bounce">🎉</div>
            <h3 className="text-4xl font-black text-white tracking-tight">{t.testPassed}</h3>
            <div className="bg-white/5 inline-block px-12 py-8 rounded-[32px] border border-white/10 backdrop-blur-md">
              <p className="text-xs font-black text-purple-accent uppercase tracking-[0.2em] mb-2">{t.testScore}</p>
              <p className="text-7xl font-black text-white">{testCompleted.score} <span className="text-2xl text-white/30">/ {testCompleted.total}</span></p>
            </div>
            <button 
              onClick={() => {setTestCompleted(null); setActiveTest(null); setStudentAnswers({});}} 
              className="block mx-auto text-purple-accent font-black uppercase tracking-widest hover:text-white transition-colors"
            >
              Return to List
            </button>
          </div>
        ) : activeTest ? (
          <div className="space-y-10">
            <div className="flex justify-between items-center glass p-8 rounded-[32px] border border-white/10 sticky top-4 z-10 shadow-2xl backdrop-blur-xl">
               <div>
                <h4 className="text-2xl font-black text-white tracking-tight">{activeTest.topic}</h4>
                <div className="flex gap-6 mt-2">
                  <p className="text-xs text-white/40 font-black uppercase tracking-widest">{activeTest.questions.length} {t.questionLabel}s</p>
                  {timerRemaining !== null && (
                    <p className={`text-xs font-black uppercase tracking-[0.15em] ${timerRemaining < 60 ? 'text-rose-500 animate-pulse' : 'text-purple-accent'}`}>
                      {t.timeLeft}: {formatTime(timerRemaining)}
                    </p>
                  )}
                </div>
               </div>
               <button 
                 onClick={handleFinishTest} 
                 className="px-10 py-4 bg-purple-accent text-white font-black rounded-2xl shadow-lg shadow-purple-accent/20 hover:bg-purple-600 transition-all uppercase text-xs tracking-[0.2em]"
               >
                 {t.finishTest}
               </button>
            </div>
            <div className="grid grid-cols-1 gap-8">
              {activeTest.questions.map((q, qIdx) => (
                <div key={qIdx} className="glass-dark p-10 rounded-[40px] shadow-xl border border-white/5 space-y-8">
                   <p className="text-2xl font-black text-white leading-tight">
                     <span className="text-purple-accent mr-4 opacity-50">{t.questionLabel} {qIdx+1}.</span>
                     {q.question}
                   </p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {q.options.map((opt, oIdx) => (
                       <button
                          key={oIdx}
                          onClick={() => setStudentAnswers({...studentAnswers, [qIdx]: oIdx})}
                          className={`p-6 rounded-[24px] border-2 transition-all text-left flex items-center gap-5 group ${studentAnswers[qIdx] === oIdx ? 'bg-purple-accent border-purple-accent text-white shadow-lg shadow-purple-accent/20' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 text-white/70'}`}
                       >
                         <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${studentAnswers[qIdx] === oIdx ? 'bg-white/20 text-white' : 'bg-white/5 border border-white/10 text-white/30 group-hover:text-white/60'}`}>
                           {String.fromCharCode(65 + oIdx)}
                         </span>
                         <span className="font-bold text-lg">{opt}</span>
                       </button>
                     ))}
                   </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {studentTests.length === 0 ? (
              <div className="col-span-full glass p-32 text-center rounded-[40px] border border-white/5 text-white/20 font-black uppercase tracking-widest text-2xl italic">
                {t.testNotAssigned}
              </div>
            ) : (
              studentTests.map(test => {
                const result = testResults.find(r => r.testId === test.id && r.studentEmail === userEmail);
                const isExpired = test.deadline && Date.now() > test.deadline;
                
                return (
                  <div key={test.id} className="glass-dark p-8 rounded-[40px] shadow-xl border border-white/5 flex flex-col justify-between group hover:border-purple-accent/30 transition-all duration-500">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-3 py-1 bg-purple-accent/10 text-purple-accent border border-purple-accent/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {subjects.find(sub => sub.id === test.subjectId)?.name || 'Subject'}
                        </span>
                        {test.duration && (
                          <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                            ⏱️ {test.duration} {t.minutes}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-purple-accent transition-colors">{test.topic}</h3>
                      <div className="flex flex-wrap gap-4">
                        <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                          {test.questions.length} {t.questionLabel}s • Max {test.maxScore}
                        </span>
                      </div>
                      {test.deadline && (
                        <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isExpired ? 'text-rose-500' : 'text-amber-500'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {t.deadline}: {new Date(test.deadline).toLocaleString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                      {result ? (
                        <div>
                          <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1">{t.scoreLabel}</p>
                          <p className="text-3xl font-black text-white">{result.score}<span className="text-sm text-white/30 ml-1">/ {result.total}</span></p>
                        </div>
                      ) : isExpired ? (
                        <div className="text-rose-500 font-black text-[10px] uppercase tracking-widest border border-rose-500/20 px-4 py-2 rounded-xl bg-rose-500/5">
                          {t.testExpired}
                        </div>
                      ) : (
                        <button 
                          onClick={() => startTest(test)} 
                          className="w-full px-6 py-4 bg-purple-accent text-white font-black rounded-2xl hover:bg-purple-600 transition-all text-xs uppercase tracking-[0.2em] shadow-lg shadow-purple-accent/20"
                        >
                          Start Test 🚀
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  }

  // Professor View
  const renderResults = (test: Test) => {
    const group = groups.find(g => g.id === test.assignedGroupId);
    if (!group) return null;

    const groupResults = group.students.map(student => {
      const result = testResults.find(r => r.testId === test.id && r.studentEmail === student.email);
      return { student, result };
    });

    const submittedCount = groupResults.filter(gr => gr.result).length;

    return (
      <div className="mt-6 p-8 bg-white/5 rounded-[32px] border border-white/10 animate-in slide-in-from-top-4 backdrop-blur-md">
        <div className="flex justify-between items-center mb-8">
          <h4 className="text-xs font-black text-purple-accent uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-purple-accent shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
            {t.studentList} & {t.result}
          </h4>
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{submittedCount} / {group.students.length} {t.submittedStatus}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {groupResults.map(({ student, result }) => (
            <div key={student.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between group/item hover:bg-white/10 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-2.5 h-2.5 rounded-full ${result ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-rose-500/30 animate-pulse'}`}></div>
                <div>
                  <p className="text-sm font-black text-white group-hover/item:text-purple-accent transition-colors">{student.name}</p>
                  <p className="text-[10px] text-white/30 font-mono tracking-tight">{student.email}</p>
                </div>
              </div>
              <div className="text-right">
                {result ? (
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">{t.submittedStatus}</span>
                    <span className="text-lg font-black text-white">{result.score} <span className="text-[10px] text-white/20">/ {result.total}</span></span>
                  </div>
                ) : (
                  <span className="text-[9px] font-black text-rose-500/50 uppercase tracking-widest border border-rose-500/10 px-3 py-1 rounded-lg bg-rose-500/5">{t.notSubmittedStatus}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-10 space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="glass w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 border border-white/10">
            <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-[24px] flex items-center justify-center text-4xl mb-8 mx-auto border border-rose-500/20">⚠️</div>
            <h3 className="text-2xl font-black text-white text-center mb-3 tracking-tight">{t.confirmDeletion}</h3>
            <p className="text-white/40 text-center text-sm mb-10 leading-relaxed">
              {t.deleteAssignmentConfirm}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-4 bg-white/5 text-white font-black rounded-2xl hover:bg-white/10 transition-all uppercase text-xs tracking-widest"
              >
                {t.cancel}
              </button>
              <button 
                onClick={() => deleteTest(showDeleteConfirm)}
                className="flex-1 py-4 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all uppercase text-xs tracking-widest"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-white/5 pb-10">
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase">{t.tests}</h2>
        <p className="text-purple-accent font-bold text-sm mt-2 tracking-widest uppercase opacity-80">{t.testsDesc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Creation Panel */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass p-8 rounded-[40px] shadow-2xl border border-white/10 space-y-8">
            <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/10">
              <button 
                onClick={() => setCreationMode('ai')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${creationMode === 'ai' ? 'bg-purple-accent text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                {t.aiGeneration}
              </button>
              <button 
                onClick={() => setCreationMode('manual')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${creationMode === 'manual' ? 'bg-purple-accent text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                {t.manualInput}
              </button>
            </div>

            {creationMode === 'ai' ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">{t.selectSubject}</label>
                  <select className="w-full p-4 rounded-2xl border border-white/5 font-bold bg-white/5 text-white focus:ring-2 focus:ring-purple-accent/50 outline-none appearance-none cursor-pointer" value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)}>
                    <option value="" className="bg-charcoal">{t.selectSubject}</option>
                    {mySubjects.map(s => <option key={s.id} value={s.id} className="bg-charcoal">{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">{t.topicName}</label>
                  <input type="text" placeholder={t.topicName} className="w-full p-4 rounded-2xl border border-white/5 bg-white/5 text-white font-bold focus:ring-2 focus:ring-purple-accent/50 outline-none placeholder:text-white/20" value={topic} onChange={(e) => setTopic(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">{t.questionLabel}s</label>
                    <select className="w-full p-4 rounded-2xl border border-white/5 font-bold bg-white/5 text-white focus:ring-2 focus:ring-purple-accent/50 outline-none appearance-none cursor-pointer" value={count} onChange={(e) => setCount(Number(e.target.value))}>
                      {[5, 10, 15, 20].map(n => <option key={n} value={n} className="bg-charcoal">{n}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">{t.variantsLabel}</label>
                    <select className="w-full p-4 rounded-2xl border border-white/5 font-bold bg-white/5 text-white focus:ring-2 focus:ring-purple-accent/50 outline-none appearance-none cursor-pointer" value={variants} onChange={(e) => {
                      const v = Number(e.target.value);
                      setVariants(v);
                      setCurrentOptions(new Array(v).fill(''));
                    }}>
                      {[2, 3, 4, 5].map(v => <option key={v} value={v} className="bg-charcoal">{v} (A-{String.fromCharCode(64+v)})</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-purple-accent uppercase tracking-widest ml-1">{t.totalLabel} {t.scoreLabel}</label>
                    <input type="number" className="w-full p-4 rounded-2xl border border-white/5 bg-white/5 text-white font-bold focus:ring-2 focus:ring-purple-accent/50 outline-none" value={maxScore} onChange={(e) => setMaxScore(Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-purple-accent uppercase tracking-widest ml-1">{t.durationLabel} ({t.minutes})</label>
                    <input type="number" className="w-full p-4 rounded-2xl border border-white/5 bg-white/5 text-white font-bold focus:ring-2 focus:ring-purple-accent/50 outline-none placeholder:text-white/20" placeholder={t.noLimit} value={duration || ''} onChange={(e) => setDuration(Number(e.target.value))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-purple-accent uppercase tracking-widest ml-1">{t.deadline}</label>
                  <input type="datetime-local" className="w-full p-4 rounded-2xl border border-white/5 bg-white/5 text-white font-bold focus:ring-2 focus:ring-purple-accent/50 outline-none [color-scheme:dark]" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>

                <button onClick={handleGenerateAI} disabled={isGenerating || !topic} className="w-full py-5 bg-purple-accent text-white font-black rounded-2xl hover:bg-purple-600 disabled:opacity-50 transition-all flex justify-center items-center gap-3 uppercase text-xs tracking-[0.2em] shadow-xl shadow-purple-accent/20">
                  {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>✨ {t.generateBtn}</>}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">{t.selectSubject}</label>
                  <select className="w-full p-4 rounded-2xl border border-white/5 font-bold bg-white/5 text-white focus:ring-2 focus:ring-purple-accent/50 outline-none appearance-none cursor-pointer" value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)}>
                    <option value="" className="bg-charcoal">{t.selectSubject}</option>
                    {mySubjects.map(s => <option key={s.id} value={s.id} className="bg-charcoal">{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">{t.topicName}</label>
                  <input type="text" placeholder={t.topicName} className="w-full p-4 rounded-2xl border border-white/5 bg-white/5 text-white font-bold focus:ring-2 focus:ring-purple-accent/50 outline-none placeholder:text-white/20" value={topic} onChange={(e) => setTopic(e.target.value)} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder={t.totalLabel + " " + t.scoreLabel} className="w-full p-4 rounded-2xl border border-white/5 bg-white/5 text-white font-bold focus:ring-2 focus:ring-purple-accent/50 outline-none placeholder:text-white/20" value={maxScore} onChange={(e) => setMaxScore(Number(e.target.value))} />
                  <input type="number" placeholder={t.durationLabel + " (" + t.minutes + ")"} className="w-full p-4 rounded-2xl border border-white/5 bg-white/5 text-white font-bold focus:ring-2 focus:ring-purple-accent/50 outline-none placeholder:text-white/20" value={duration || ''} onChange={(e) => setDuration(Number(e.target.value))} />
                </div>
                <input type="datetime-local" className="w-full p-4 rounded-2xl border border-white/5 bg-white/5 text-white font-bold focus:ring-2 focus:ring-purple-accent/50 outline-none [color-scheme:dark]" value={deadline} onChange={(e) => setDeadline(e.target.value)} />

                <div className="p-6 bg-white/5 rounded-[32px] border border-white/10 space-y-6">
                  <textarea placeholder={t.questionText} className="w-full p-4 rounded-2xl border border-white/5 text-sm resize-none h-24 bg-white/5 text-white outline-none focus:ring-2 focus:ring-purple-accent/50 placeholder:text-white/20" value={currentQ} onChange={(e) => setCurrentQ(e.target.value)} />
                  <div className="space-y-3">
                    {currentOptions.map((opt, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <input type="radio" checked={currentCorrect === i} onChange={() => setCurrentCorrect(i)} className="w-4 h-4 accent-purple-accent cursor-pointer" />
                        <input type="text" placeholder={`${t.variantsLabel} ${String.fromCharCode(65+i)}`} className="flex-1 p-3 rounded-xl border border-white/5 text-sm bg-white/5 text-white outline-none focus:ring-2 focus:ring-purple-accent/50 placeholder:text-white/20" value={opt} onChange={(e) => {
                          const newOps = [...currentOptions];
                          newOps[i] = e.target.value;
                          setCurrentOptions(newOps);
                        }} />
                      </div>
                    ))}
                  </div>
                  <button onClick={addManualQuestion} className="w-full py-3 bg-white/5 text-purple-accent font-black rounded-xl hover:bg-white/10 transition-all text-[10px] uppercase tracking-widest border border-purple-accent/20">+ {t.addQuestion}</button>
                </div>
              </div>
            )}
          </div>

          {(tempQuestions.length > 0 || manualQuestions.length > 0) && (
            <div className="glass p-8 rounded-[40px] shadow-2xl space-y-8 animate-in slide-in-from-left-4 border border-purple-accent/20">
              <h3 className="text-[10px] font-black text-purple-accent uppercase tracking-[0.2em] flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-purple-accent"></span>
                {t.assignTest}
              </h3>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">{t.selectGroup}</label>
                <select className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 text-white font-bold outline-none focus:ring-2 focus:ring-purple-accent/50 appearance-none cursor-pointer" value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)}>
                  <option value="" className="bg-charcoal">{t.selectGroup}...</option>
                  {groups.map(g => <option key={g.id} value={g.id} className="bg-charcoal">{g.name}</option>)}
                </select>
              </div>
              <button onClick={handlePublish} disabled={!selectedGroupId || !selectedSubjectId} className="w-full py-5 bg-purple-accent text-white font-black rounded-2xl hover:bg-purple-600 transition-all disabled:opacity-50 uppercase text-xs tracking-[0.2em] shadow-xl shadow-purple-accent/20">{t.publishTest}</button>
            </div>
          )}
        </div>

        {/* Content Preview */}
        <div className="lg:col-span-8">
          {(tempQuestions.length > 0 || manualQuestions.length > 0) ? (
            <div className="space-y-8">
              <div className="flex justify-between items-center glass p-8 rounded-[40px] border border-white/10 shadow-2xl">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">{topic || t.testPreview}</h3>
                  <div className="flex gap-4 mt-2">
                    {duration > 0 && <span className="text-[10px] font-black text-purple-accent uppercase tracking-widest">{duration} {t.minutes}</span>}
                    {deadline && <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{t.endLabel}: {new Date(deadline).toLocaleString()}</span>}
                  </div>
                </div>
                <span className="text-xs bg-purple-accent/10 text-purple-accent px-4 py-2 rounded-full font-black uppercase tracking-widest border border-purple-accent/20">{(creationMode === 'ai' ? tempQuestions : manualQuestions).length} Qs • {maxScore} pts</span>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {(creationMode === 'ai' ? tempQuestions : manualQuestions).map((q, idx) => (
                  <div key={idx} className="glass-dark p-8 rounded-[40px] shadow-xl border border-white/5 space-y-6 group hover:border-purple-accent/30 transition-all">
                     <p className="text-xl font-black text-white leading-tight">
                       <span className="text-purple-accent mr-3 opacity-50">{t.questionLabel} {idx+1}.</span>
                       {q.question}
                     </p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {q.options.map((opt, oIdx) => (
                         <div key={oIdx} className={`p-4 rounded-2xl border text-sm flex items-center gap-4 transition-all ${oIdx === q.correctAnswer ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/5 text-white/60'}`}>
                           <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${oIdx === q.correctAnswer ? 'bg-emerald-500 text-white' : 'bg-white/5 border border-white/10 text-white/30'}`}>
                             {String.fromCharCode(65 + oIdx)}
                           </span>
                           <span className="font-bold">{opt}</span>
                         </div>
                       ))}
                     </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-2">{t.publishedTests}</h3>
              <div className="grid grid-cols-1 gap-6">
                {publishedTests.length === 0 ? (
                  <div className="glass p-32 text-center rounded-[40px] border border-white/5 italic text-white/20 font-black uppercase tracking-widest text-2xl">
                    {t.noTestsPublished}
                  </div>
                ) : (
                  publishedTests.map(test => (
                    <div key={test.id} className="flex flex-col glass-dark rounded-[40px] shadow-xl border border-white/5 overflow-hidden group hover:border-purple-accent/30 transition-all duration-500">
                      <div className="p-8 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                          <div className="w-16 h-16 bg-purple-accent/10 text-purple-accent rounded-[24px] flex items-center justify-center text-2xl border border-purple-accent/20 group-hover:scale-110 transition-transform">✅</div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="px-3 py-1 bg-purple-accent/10 text-purple-accent rounded-full text-[9px] font-black uppercase tracking-widest border border-purple-accent/20">
                                {subjects.find(sub => sub.id === test.subjectId)?.name || t.subjects}
                              </span>
                              {test.deadline && (
                                <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${Date.now() > test.deadline ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                  {Date.now() > test.deadline ? t.expired : t.active}
                                </span>
                              )}
                            </div>
                            <h4 className="text-2xl font-black text-white tracking-tight group-hover:text-purple-accent transition-colors">{test.topic}</h4>
                            <div className="flex gap-4 items-center mt-2">
                              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                                {groups.find(g => g.id === test.assignedGroupId)?.name} • {test.questions.length} Qs
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => setViewingResultsForId(viewingResultsForId === test.id ? null : test.id)}
                            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${viewingResultsForId === test.id ? 'bg-purple-accent text-white shadow-xl shadow-purple-accent/20' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'}`}
                          >
                            {viewingResultsForId === test.id ? t.hideResults : t.viewResults}
                          </button>
                          <button 
                            onClick={() => setShowDeleteConfirm(test.id)}
                            className="w-12 h-12 flex items-center justify-center text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all border border-transparent hover:border-rose-500/20"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      {viewingResultsForId === test.id && renderResults(test)}
                    </div>
                  )))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
