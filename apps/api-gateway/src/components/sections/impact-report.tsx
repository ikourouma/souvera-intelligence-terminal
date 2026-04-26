"use client";

import React, { useRef, useState } from "react";
import { Download, FileText, X, ArrowRight, CheckCircle2 } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ImpactReport() {
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useGSAP(() => {
    gsap.fromTo(
      ".report-card",
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        lazy: false,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
        }
      }
    );
  }, { scope: containerRef });

  useGSAP(() => {
    if (isModalOpen && modalRef.current) {
      gsap.to(modalRef.current, {
        opacity: 1,
        duration: 0.4,
        display: "flex",
        ease: "power2.out",
      });
      gsap.fromTo(
        ".modal-form",
        { scale: 0.95, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, delay: 0.1, ease: "back.out(1.5)" }
      );
    } else if (!isModalOpen && modalRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0,
        duration: 0.3,
        display: "none",
        ease: "power2.in"
      });
    }
  }, [isModalOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Normally you would send data to Supabase/API here.
    // The visual state will flip to a Download ready state.
  };

  return (
    <section className="bg-zinc-950 border-b border-zinc-900 border-t">
      <div ref={containerRef} className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        <div className="report-card bg-gradient-to-r from-zinc-900 via-zinc-800/80 to-zinc-900 border border-zinc-700/50 p-6 md:p-8 flex flex-col items-center justify-between gap-6 md:flex-row relative overflow-hidden group">
          
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-zinc-600/10 to-transparent group-hover:animate-[shimmer_2s_infinite]" />

          <div className="flex items-center space-x-6 relative z-10 w-full md:w-auto">
            <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">2026 Policy & Impact Report</h3>
              <p className="text-sm text-zinc-400">Comprehensive analysis of $500M in executed capital and strategic foresight.</p>
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto inline-flex items-center justify-center shrink-0 px-6 py-4 bg-white hover:bg-zinc-200 text-zinc-950 font-bold transition-colors shadow-xl z-10 focus:ring-4 focus:ring-white/50"
          >
            <Download className="w-5 h-5 mr-3" />
            Access Document
          </button>
        </div>
      </div>

      {/* GSAP Registration Modal */}
      <div 
        ref={modalRef} 
        className="fixed inset-0 z-[200] bg-zinc-950/90 backdrop-blur-md hidden flex-col items-center justify-center p-6"
        style={{ opacity: 0 }}
      >
        <div className="modal-form w-full max-w-xl bg-zinc-900 border border-zinc-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-500" />
          
          <button 
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {!isSubmitted ? (
            <div className="p-8 md:p-10">
              <h3 className="text-2xl font-bold text-white mb-2">Platform Registration</h3>
              <p className="text-zinc-400 text-sm mb-8">
                Access to the AfDEC Policy & Impact Report requires basic institutional registration to better tailor our services to your growth footprint.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">First Name</label>
                    <input required type="text" className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Last Name</label>
                    <input required type="text" className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Corporate Email</label>
                  <input required type="email" className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Organization</label>
                    <input required type="text" className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Industry Sector</label>
                    <select required className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors appearance-none">
                      <option value="">Select Sector...</option>
                      <option value="agriculture">Agriculture & Farming</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="finance">Financial Services</option>
                      <option value="tech">Technology / Software</option>
                      <option value="government">Government / Public</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 transition-colors shadow-lg flex items-center justify-center space-x-2 group">
                    <span>Submit & Access Target Document</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Registration Verified</h3>
              <p className="text-zinc-400 text-sm mb-8 max-w-sm">
                Your profile has been secured in the AfDEC terminal. You may now securely download the requested documentation.
              </p>
              <a 
                href="/files/dummy-report.pdf" 
                download
                onClick={() => setIsModalOpen(false)}
                className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold py-3 px-8 transition-colors flex items-center space-x-2 rounded-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF (2.4MB)</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
