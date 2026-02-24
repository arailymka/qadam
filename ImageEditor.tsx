
import React, { useState, useRef } from 'react';
import { Language, translations } from '../types';
import { GeminiService } from '../services/geminiService';

export const ImageEditor: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang];
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const gemini = useRef(new GeminiService());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!image || !prompt) return;
    setIsProcessing(true);
    try {
      const base64Data = image.split(',')[1];
      const result = await gemini.current.editImage(base64Data, prompt);
      if (result) setImage(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-10 space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="border-b border-white/5 pb-10">
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase">{t.imageEditor}</h2>
        <p className="text-purple-accent font-bold text-sm mt-2 tracking-widest uppercase opacity-80">Create visual materials or analyze informatics diagrams using Gemini 2.5 Flash Image.</p>
      </div>

      <div className="glass-dark p-10 rounded-[40px] shadow-2xl border border-white/5">
        <div className="flex flex-col gap-10">
          <div className="relative group">
            {image ? (
              <div className="relative aspect-video rounded-[32px] overflow-hidden border border-white/10 bg-white/5 shadow-2xl">
                <img src={image} alt="Target" className="w-full h-full object-contain" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute top-6 right-6 p-4 bg-rose-500 text-white rounded-2xl shadow-2xl hover:bg-rose-600 transition-all border border-rose-400/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-video rounded-[32px] border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                <div className="w-24 h-24 bg-purple-accent/10 text-purple-accent rounded-[32px] flex items-center justify-center text-5xl mb-6 group-hover:scale-110 transition-transform border border-purple-accent/20">🖼️</div>
                <span className="text-white font-black uppercase tracking-widest text-sm">Click to upload an image or diagram</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            )}
          </div>

          <div className="space-y-6">
            <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">How should the AI edit or describe this?</label>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                className="flex-1 p-6 rounded-[24px] border border-white/10 outline-none font-black bg-white/5 text-white focus:bg-white/10 placeholder:text-white/20 transition-all"
                placeholder="e.g. 'Add a network server icon next to the router' or 'Apply a blueprint aesthetic'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button
                onClick={handleEdit}
                disabled={isProcessing || !image || !prompt}
                className="px-12 bg-purple-accent hover:bg-purple-600 text-white font-black rounded-[24px] transition-all shadow-2xl shadow-purple-accent/20 disabled:opacity-50 whitespace-nowrap flex items-center justify-center gap-4 uppercase text-xs tracking-widest"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>🪄 {t.generateBtn}</>
                )}
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {['Make it high contrast', 'Convert to dark mode', 'Add labels', 'Fix diagram clarity'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setPrompt(tag)}
                  className="px-5 py-2 bg-white/5 hover:bg-purple-accent/20 text-white/40 hover:text-purple-accent rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 hover:border-purple-accent/20"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
