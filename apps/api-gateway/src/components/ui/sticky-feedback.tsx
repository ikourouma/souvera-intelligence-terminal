"use client";

import React, { useState, useRef } from "react";
import { MessageSquare, X, Send, Activity, Star } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { supabase } from "@/lib/supabase";

export function StickyFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [managed, setManaged] = useState({
    trigger_label: "Pulse",
    title: "Market Pulse",
    description: "Your intelligence directly refines the AfDEC operational model. Please rate your experience and provide direct operational feedback.",
    question_1: "1. Operational Execution Rating",
    question_2: "2. How can we serve you better?",
    placeholder: "Detail institutional requirements or bottlenecks..."
  });
  
  const panelRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    async function loadManaged() {
      const { data } = await supabase.from('managed_content').select('content').eq('slug', 'sticky_pulse_config').single();
      if (data?.content) {
        setManaged(data.content as any);
      }
    }
    loadManaged();
  }, []);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useGSAP(() => {
    if (isOpen && panelRef.current) {
      gsap.to(panelRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
        display: "block"
      });
      // Hide the trigger when panel is open
      gsap.to(triggerRef.current, { x: -50, opacity: 0, duration: 0.2 });
    } else if (!isOpen && panelRef.current) {
      gsap.to(panelRef.current, {
        x: -400,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        display: "none"
      });
      // Show the trigger 
      gsap.to(triggerRef.current, { x: 0, opacity: 1, duration: 0.3, delay: 0.2 });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (score === 0) return; // Prevent empty scores
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('market_sentiments').insert({
        sentiment_score: score,
        improvement_feedback: feedback,
        page_context: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
        session_id: 'anonymous_user'
      });
      
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setTimeout(() => { setSuccess(false); setScore(0); setFeedback(""); }, 500);
      }, 2000);
      
    } catch (err: any) {
      console.error("Telemetry failure", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(true)}
        className="fixed top-1/2 left-0 z-[100] -translate-y-1/2 bg-zinc-900 border border-zinc-800 border-l-0 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors p-3 rounded-r-md shadow-xl flex flex-col items-center justify-center space-y-2 group"
      >
        <Activity className="w-5 h-5 text-blue-500 group-hover:text-blue-400" />
        {/* Vertical Text */}
        <span className="[writing-mode:vertical-lr] rotate-180 text-xs font-bold uppercase tracking-widest mt-2">
          Pulse
        </span>
      </button>

      {/* Feedback Panel */}
      <div 
        ref={panelRef}
        className="fixed top-0 left-0 bottom-0 w-80 md:w-96 bg-zinc-950 border-r border-zinc-800 shadow-2xl z-[150] flex flex-col hidden -translate-x-full"
      >
        <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-lg">{managed.title}</h3>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-zinc-500 hover:text-white p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {success ? (
             <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in space-y-4">
               <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                 <Activity className="w-8 h-8 text-emerald-500" />
               </div>
               <h3 className="text-xl font-bold text-white tracking-tight">Telemetry Received.</h3>
               <p className="text-zinc-400 text-sm">Data transmitted successfully to AfDEC central command.</p>
             </div>
          ) : (
             <>
                <p className="text-sm text-zinc-400 mb-8 leading-relaxed font-medium">
                  {managed.description}
                </p>

                <form className="space-y-8" onSubmit={handleSubmit}>
                  
                  {/* Score Question */}
                  <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500">
                      {managed.question_1}
                    </label>
                    <div className="flex justify-between items-center bg-zinc-900/50 p-3 rounded-sm border border-zinc-800">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setScore(star)}
                          className={`p-2 transition-all duration-300 rounded ${score >= star ? 'text-amber-400 bg-amber-400/10 scale-110' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Text Area */}
                  <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500">
                      {managed.question_2}
                    </label>
                    <textarea 
                      required
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={5} 
                      className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-200 text-sm p-4 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-sm resize-none transition-colors outline-none"
                      placeholder={managed.placeholder}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting || score === 0}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-widest uppercase text-xs py-4 rounded-sm transition-all focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <span>{isSubmitting ? "Encrypting..." : "Inject Telemetry"}</span>
                    {!isSubmitting && <Send className="w-4 h-4 ml-2" />}
                  </button>
                </form>
             </>
          )}
        </div>
      </div>
      
      {/* Optional dark overlay when panel is open */}
      <div 
        className={`fixed inset-0 bg-black/40 z-[140] transition-opacity duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />
    </>
  );
}
