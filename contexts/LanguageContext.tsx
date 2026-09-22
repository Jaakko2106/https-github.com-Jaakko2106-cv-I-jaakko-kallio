
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { translations } from '../utils/translations';

type Language = 'en' | 'fi';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        if (typeof window !== 'undefined') {
             const saved = localStorage.getItem('language');
             if (saved === 'en' || saved === 'fi') return saved;
             // Default to browser language if available, else English
             const browserLang = navigator.language.startsWith('fi') ? 'fi' : 'en';
             return browserLang;
        }
        return 'en';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
    }, [language]);

    const value = {
        language,
        setLanguage,
        t: translations[language]
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
