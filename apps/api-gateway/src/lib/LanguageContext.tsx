"use client";
import React, { createContext, useContext } from 'react';

// Simplified stub for AfDEC components
const LanguageContext = createContext({
  language: 'en',
  setLanguage: (lang: string) => {},
  t: (key: string) => key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <LanguageContext.Provider value={{ language: 'en', setLanguage: () => {}, t: (k) => k }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
