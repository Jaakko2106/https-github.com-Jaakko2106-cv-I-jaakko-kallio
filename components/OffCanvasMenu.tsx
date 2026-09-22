
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface OffCanvasMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

interface MenuItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

const OffCanvasMenu: React.FC<OffCanvasMenuProps> = ({ isOpen, onClose }) => {
    const { t, language, setLanguage } = useLanguage();
    const { user, isAdmin, signIn, logOut } = useAuth();
    const [avatarUrl, setAvatarUrl] = useState("https://lh3.googleusercontent.com/a/ACg8ocIbYAtYBynI5k_UqBs1sOOl8RnaqJ3VHv89wBhQZTyr4OOJ2EtFHQ=s288-c-no");

    useEffect(() => {
        const saved = localStorage.getItem('home-avatar');
        if (saved) setAvatarUrl(saved);

        const handleUpdate = () => {
            const updated = localStorage.getItem('home-avatar');
            if (updated) setAvatarUrl(updated);
        };

        window.addEventListener('image-updated', handleUpdate);
        return () => window.removeEventListener('image-updated', handleUpdate);
    }, []);

    const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        const targetId = event.currentTarget.getAttribute('href')?.substring(1);
        if (targetId) {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
        onClose();
    };

    const handlePrint = () => {
        window.print();
    };

    const menuItems: MenuItem[] = [
        {
            href: "#home",
            label: t.menu.home,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        },
        {
            href: "#about",
            label: t.menu.about,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        },
        {
            href: "#experience",
            label: t.menu.experience,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3" aria-hidden="true"><path d="M12 12h.01"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M22 13a10 10 0 0 1-10 10c-4.42 0-8-3.13-8-7a10 10 0 0 1 10-10c4.42 0 8 3.13 8 7"/><path d="M12 12h.01"/></svg>
        },
        {
            href: "#education",
            label: t.menu.education,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3" aria-hidden="true"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.084a1 1 0 0 0 0 1.838l8.57 3.838a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>
        },
        {
            href: "#works",
            label: t.menu.works,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M17.5 6.5 17 7l-1.75 1.75A.5.5 0 0 1 13.75 9l-1.5-1.5a.5.5 0 0 1-.13-.45c-.3-.83-.98-1.5-1.82-1.82a.5.5 0 0 1-.45-.13L7 7.5l.5-.5"/><path d="M4.6 9.4a5.5 5.5 0 0 0 0 7.2L9.4 19"/><path d="M14.6 19.4a5.5 5.5 0 0 0 7.2 0L19.4 14.6"/><path d="M19.4 9.4a5.5 5.5 0 0 0-7.2 0L14.6 4.6"/></svg>
        },
        {
            href: "#contact",
            label: t.menu.contact,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        }
    ];

    return (
        <div 
            id="off-canvas-menu" 
            className={`off-canvas-menu fixed top-0 left-0 h-full w-72 text-white shadow-2xl p-6 pt-24 z-50 flex flex-col backdrop-blur-xl bg-indigo-900/80 ${isOpen ? 'open' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            aria-hidden={!isOpen}
        >
            {/* Logo at the top */}
            <div className="absolute top-6 left-6 flex items-center">
                <div className="mr-3 flex-shrink-0 bg-white text-indigo-900 w-8 h-8 rounded flex items-center justify-center font-bold text-sm">
                    J
                </div>
                <span className="text-lg font-bold text-white whitespace-nowrap">Valikko <span className="text-white/40 font-normal">| CV</span></span>
            </div>

            <button 
                id="close-menu" 
                onClick={onClose} 
                className="absolute top-4 right-4 p-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label={t.header.menuClose}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
            
            <nav className="flex flex-col space-y-2 mb-8">
                {menuItems.map((item) => (
                    <a 
                        key={item.href}
                        href={item.href} 
                        onClick={handleLinkClick} 
                        className="group flex items-center px-4 py-3.5 text-base font-medium rounded-lg transition-all duration-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 min-h-[44px]"
                        tabIndex={isOpen ? 0 : -1}
                    >
                         <span className="text-white/70 group-hover:text-white transition-colors">
                             {item.icon}
                         </span>
                         <span>{item.label}</span>
                    </a>
                ))}
            </nav>

            <div className="mt-auto space-y-4">
                {/* Download Button in Menu */}
                <button 
                    onClick={handlePrint}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition duration-300 shadow-lg flex items-center justify-center gap-2 group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-y-0.5 transition-transform"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    {t.header.downloadCv}
                </button>

                {/* Profile Info Card - Bottom Rectangle */}
                <div className="bg-indigo-950/40 border border-white/10 rounded-xl p-3 flex flex-col gap-3 backdrop-blur-sm shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/20 shadow-inner">
                            <img 
                                src={avatarUrl} 
                                alt="Jaakko" 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm text-white leading-tight truncate">Jaakko Kallio</p>
                            <p className="text-[10px] text-indigo-200 truncate">{t.home.role}</p>
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-indigo-300 hover:text-indigo-100 transition-colors cursor-default">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><rect width="20" height="16" x="2" y="4" rx="2"/></svg>
                                <span className="truncate">jaakko.kkallio@gmail.com</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-t border-white/10 pt-2 flex flex-col gap-2">
                        {user ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20">
                                        {user.photoURL && <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-white/70 truncate max-w-[100px]">{user.email}</span>
                                        {isAdmin && <span className="text-[9px] text-green-400 font-bold uppercase tracking-wider">Admin</span>}
                                    </div>
                                </div>
                                <button 
                                    onClick={logOut}
                                    className="text-[10px] bg-white/10 hover:bg-white/20 text-white py-1 px-2 rounded transition-colors"
                                >
                                    Log Out
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={signIn}
                                className="w-full flex items-center justify-center gap-2 bg-white text-indigo-900 text-xs font-bold py-1.5 px-3 rounded hover:bg-indigo-50 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                                Admin Login
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Language Toggle */}
                <div className="flex gap-2 justify-center text-[10px] uppercase font-bold tracking-wider pt-2 border-t border-white/5">
                    <button 
                        onClick={() => setLanguage('fi')}
                        className={`px-2 py-1 rounded transition-colors ${language === 'fi' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                    >
                        FI
                    </button>
                    <span className="text-white/10">|</span>
                    <button 
                        onClick={() => setLanguage('en')}
                        className={`px-2 py-1 rounded transition-colors ${language === 'en' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                    >
                        EN
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default OffCanvasMenu;
