
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import OffCanvasMenu from './components/OffCanvasMenu';
import HomeSection from './components/HomeSection';
import AboutSection from './components/AboutSection';
import ExperienceSection from './components/ExperienceSection';
import EducationSection from './components/EducationSection';
import WorksSection from './components/WorksSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import ProjectModal from './components/ProjectModal';
import ScrollToTopButton from './components/ScrollToTopButton';
import OfflineIndicator from './components/OfflineIndicator';
import { Project } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

const getProjectsData = (lang: 'en' | 'fi'): Project[] => {
    const isFi = lang === 'fi';
    const baseProjects: Project[] = [
        {
            id: '1',
            title: isFi ? "Brändi-identiteetin Suunnittelu" : "Brand Identity Design",
            description: isFi 
                ? "Täydellinen brändiuudistus teknologia-startupille, sisältäen logon, väripaletin ja typografian. Projekti keskittyi modernin ja luotettavan brändipreesensin luomiseen."
                : "A complete brand overhaul for a tech startup, including logo, color palette, and typography. This project focused on creating a modern and trustworthy brand presence.",
            images: [
                {
                    url: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Helsinki_logo.svg',
                    caption: isFi ? 'Lopullinen logosuunnitelma' : 'Final Logo Design'
                },
                {
                    url: 'https://placehold.co/600x400/C3C3FF/3F51B5?text=Logo+Exploration',
                    caption: isFi ? 'Alustava konseptointi' : 'Initial Concept Exploration'
                },
                {
                    url: 'https://placehold.co/600x400/AEAEFF/3F51B5?text=Final+Styleguide',
                    caption: isFi ? 'Kattava brändiohjeisto' : 'Comprehensive Brand Guidelines'
                }
            ],
            coverImage: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Helsinki_logo.svg',
            client: "Nordic Tech Solutions",
            projectType: isFi ? "Brändäys & Identiteetti" : "Branding & Identity",
            tools: ["Illustrator", "Photoshop", "InDesign"]
        },
        {
            id: '2',
            title: isFi ? "Julia 1&2 Verkkosivusto" : "Julia 1&2 Website",
            description: isFi
                ? "Suunnittelin ja ylläpidin verkkosivustoa elokuvateatteri Julia 1&2:lle. Sivusto tarjoaa selkeän näkymän elokuvaohjelmistoon, tuleviin ensi-iltoihin ja teatterin tietoihin, heijastaen teatterin brändiä."
                : "Designed and maintained the website for Movie Theatre Julia 1&2. The site provides a clear view of movie listings, upcoming premieres, and theatre information, reflecting the theatre's brand identity.",
            images: [
                {
                    url: '/src/assets/images/julia_theater_placeholder_1786386933483.jpg',
                    caption: isFi ? 'Etusivun näkymä työpöydällä' : 'Homepage Desktop View'
                },
                {
                    url: 'https://placehold.co/1200x800/FAF9F6/7B1F22?text=Movie+Details+Page',
                    caption: isFi ? 'Elokuvan tietosivu' : 'Movie Details Page'
                },
                {
                    url: 'https://placehold.co/600x1200/FAF9F6/7B1F22?text=Mobile+View',
                    caption: isFi ? 'Mobiiliresponsiivisuus' : 'Mobile Responsive View'
                }
            ],
            coverImage: '/src/assets/images/julia_theater_placeholder_1786386933483.jpg',
            client: "Julia 1&2",
            projectType: isFi ? "Web-suunnittelu" : "Web Design",
            tools: ["HTML", "CSS", "JavaScript"]
        },
        {
            id: '3',
            title: isFi ? "Digitaalinen Kuvitussarja" : "Digital Illustration Series",
            description: isFi
                ? "Sarja digitaalisia kuvituksia lastenkirjaan, hahmojen herättäminen eloon eloisilla väreillä ja kiinnostavilla persoonilla."
                : "A series of digital illustrations for a children's book, bringing characters to life with vibrant colors and engaging characters.",
            images: [
                {
                    url: 'https://placehold.co/600x400/B8B8FF/3F51B5?text=Character+Sketch',
                    caption: isFi ? 'Alustavat hahmoluonnokset' : 'Initial Character Sketches'
                },
                {
                    url: 'https://placehold.co/600x400/C3C3FF/3F51B5?text=Scene+Illustration',
                    caption: isFi ? 'Kokonaisen kohtauksen renderöinti' : 'Full Scene Rendering'
                },
                {
                    url: 'https://placehold.co/600x400/AEAEFF/3F51B5?text=Book+Cover+Art',
                    caption: isFi ? 'Lopullinen kirjan kansikuva' : 'Final Book Cover Art'
                }
            ],
            coverImage: 'https://placehold.co/600x400/B8B8FF/3F51B5?text=Illustration+Project',
            client: "Little Dreamers Publishing",
            projectType: isFi ? "Kuvitus" : "Illustration",
            tools: ["Procreate", "Photoshop", "After Effects"]
        }
    ];

    // Override with user uploaded images from LocalStorage
    if (typeof window !== 'undefined') {
        return baseProjects.map(p => {
            const storedCover = localStorage.getItem(`project-cover-${p.id}`);
            const storedImages = p.images.map((img, idx) => {
                const storedImg = localStorage.getItem(`project-image-${p.id}-${idx}`);
                return storedImg ? { ...img, url: storedImg } : img;
            });
            const storedDataStr = localStorage.getItem(`project-data-${p.id}`);
            let storedData = null;
            try {
                if (storedDataStr) storedData = JSON.parse(storedDataStr);
            } catch (e) {}

            return {
                ...p,
                coverImage: storedData?.coverImage || storedCover || p.coverImage,
                images: (storedData?.images && Array.isArray(storedData.images) && storedData.images.length > 0) 
                    ? storedData.images 
                    : storedImages,
                title: storedData?.title || p.title,
                description: storedData?.description || p.description,
                client: storedData?.client || p.client,
                projectType: storedData?.projectType || p.projectType,
                tools: storedData?.tools || p.tools
            };
        });
    }

    return baseProjects;
}

import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './src/firebase';

const AppContent: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            if (saved) return saved as 'light' | 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });
    const observerRef = useRef<IntersectionObserver | null>(null);
    const { language } = useLanguage();
    
    // State to hold projects to ensure they update on storage events
    const [projectsData, setProjectsData] = useState<Project[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    // Sync all site_data from Firestore to localStorage
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'site_data'), (snapshot) => {
            let changed = false;
            snapshot.forEach((doc) => {
                const key = doc.id;
                const value = doc.data().value;
                if (localStorage.getItem(key) !== value) {
                    localStorage.setItem(key, value);
                    changed = true;
                }
            });
            if (changed) {
                setRefreshKey(prev => prev + 1);
                window.dispatchEvent(new CustomEvent('image-updated'));
            }
        });
        return () => unsubscribe();
    }, []);

    // Fetch projects when language changes or refresh triggered
    useEffect(() => {
        setProjectsData(getProjectsData(language));
    }, [language, refreshKey]);

    // Listen for image updates from EditableImage component
    useEffect(() => {
        const handleImageUpdate = () => {
            setRefreshKey(prev => prev + 1);
        };
        window.addEventListener('image-updated', handleImageUpdate);
        window.addEventListener('project-updated', handleImageUpdate);
        return () => {
            window.removeEventListener('image-updated', handleImageUpdate);
            window.removeEventListener('project-updated', handleImageUpdate);
        };
    }, []);

    // Derive selected project from ID to ensure we always have the latest data (including new images)
    const selectedProject = projectsData.find(p => p.id === selectedProjectId) || null;

    useEffect(() => {
        // Apply theme to document
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const setupObserver = () => {
            const options = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const callback: IntersectionObserverCallback = (entries) => {
                const groups = new Map<Element, Element[]>();

                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const parent = el.closest('section') || el.parentElement || document.body;
                        
                        if (!groups.has(parent)) {
                            groups.set(parent, []);
                        }
                        groups.get(parent)?.push(el);
                        observerRef.current?.unobserve(el);
                    }
                });

                groups.forEach((elements) => {
                    elements.forEach((el, index) => {
                        setTimeout(() => {
                            el.classList.add('is-visible');
                        }, index * 120);
                    });
                });
            };

            observerRef.current = new IntersectionObserver(callback, options);
            const elements = document.querySelectorAll('.animate-on-scroll');
            elements.forEach(el => observerRef.current?.observe(el));
        };

        setupObserver();

        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node instanceof HTMLElement) {
                        if (node.classList.contains('animate-on-scroll')) {
                            observerRef.current?.observe(node);
                        }
                        const children = node.querySelectorAll('.animate-on-scroll');
                        children.forEach(child => observerRef.current?.observe(child));
                    }
                });
            });
        });

        mutationObserver.observe(document.body, { childList: true, subtree: true });

        return () => {
            observerRef.current?.disconnect();
            mutationObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        if (isMenuOpen || selectedProject) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isMenuOpen, selectedProject]);
    
    const handleMenuToggle = () => setIsMenuOpen(!isMenuOpen);
    const handleMenuClose = () => setIsMenuOpen(false);
    const handleProjectClick = (project: Project) => setSelectedProjectId(project.id);
    const handleModalClose = () => setSelectedProjectId(null);
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    return (
        <>
            <Header 
                onMenuToggle={handleMenuToggle} 
                isMenuOpen={isMenuOpen} 
                theme={theme}
                onThemeToggle={toggleTheme}
            />
            <OffCanvasMenu isOpen={isMenuOpen} onClose={handleMenuClose} />
            <div id="overlay" className={`overlay fixed inset-0 z-40 ${isMenuOpen ? 'open' : ''}`} onClick={handleMenuClose} aria-hidden="true"></div>

            <main className="bg-white dark:bg-gray-900 transition-colors duration-300">
                <HomeSection />
                <AboutSection />
                <ExperienceSection />
                <EducationSection />
                <WorksSection projects={projectsData} onProjectClick={handleProjectClick} />
                <ContactSection />
            </main>

            <Footer />

            <ScrollToTopButton />
            <OfflineIndicator />

            {selectedProject && (
                <ProjectModal
                    isOpen={!!selectedProject}
                    onClose={handleModalClose}
                    project={selectedProject}
                />
            )}
        </>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <LanguageProvider>
                <AppContent />
            </LanguageProvider>
        </AuthProvider>
    );
};

export default App;
