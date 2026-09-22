
import React, { useState, useMemo, useRef } from 'react';
import { Project } from '../types';
import AnimatedBackground from './AnimatedBackground';
import { useLanguage } from '../contexts/LanguageContext';
import EditableImage from './EditableImage';
import { isVideoUrl, isGifUrl } from '../utils/mediaUtils';
import { Film, Sparkles } from 'lucide-react';

interface WorksSectionProps {
    projects: Project[];
    onProjectClick: (project: Project) => void;
}

const WorksSection: React.FC<WorksSectionProps> = ({ projects, onProjectClick }) => {
    const { t } = useLanguage();
    const [activeFilter, setActiveFilter] = useState('All');
    const sectionRef = useRef<HTMLElement>(null);

    const categories = useMemo(() => {
        const types = projects
            .map(p => p.projectType)
            .filter((type): type is string => !!type);
        return ['All', ...Array.from(new Set(types))];
    }, [projects]);

    const filteredProjects = useMemo(() => {
        if (activeFilter === 'All') return projects;
        return projects.filter(project => project.projectType === activeFilter);
    }, [projects, activeFilter]);

    const getDirectionClass = (index: number) => {
        // Simple logic for entrance animations
        const col = index % 3;
        if (col === 0) return 'fade-in-left';
        if (col === 1) return 'fade-in-up';
        return 'fade-in-right';
    };

    const handleKeyDown = (e: React.KeyboardEvent, project: Project) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onProjectClick(project);
        }
    };

    return (
        <section id="works" ref={sectionRef} className="py-16 sm:py-24 px-4 sm:px-8 relative overflow-hidden bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
            <AnimatedBackground />
            <div className="relative z-10 container mx-auto max-w-6xl">
                <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-indigo-700 dark:text-indigo-400 animate-on-scroll zoom-in">{t.works.title}</h2>
                
                {/* Filter buttons with better touch padding and scrolling on mobile if needed */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-16 animate-on-scroll fade-in-up">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveFilter(category)}
                            className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                                activeFilter === category
                                    ? 'bg-indigo-600 text-white shadow-lg scale-105'
                                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-400 shadow-sm'
                            }`}
                            aria-pressed={activeFilter === category}
                            aria-label={`Filter by ${category}`}
                        >
                            {category === 'All' ? t.works.filterAll : category}
                        </button>
                    ))}
                </div>

                {/* Grid layout that adapts from 1 to 3 columns smoothly */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 min-h-[400px]" role="list">
                    {filteredProjects.map((project, index) => (
                        <div
                            key={project.id} 
                            onClick={() => onProjectClick(project)}
                            onKeyDown={(e) => handleKeyDown(e, project)}
                            tabIndex={0}
                            role="button"
                            aria-label={`${t.works.viewAll}: ${project.title}`}
                            className={`work-item group rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500 ease-out relative animate-on-scroll ${getDirectionClass(index)} w-full text-left bg-white dark:bg-gray-900 cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-500/50`}
                        >
                            {/* Using aspect-ratio for consistent card dimensions across device widths */}
                            <div className="relative aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-gray-200 dark:bg-gray-700">
                                <EditableImage 
                                    storageKey={`project-cover-${project.id}`}
                                    defaultSrc={project.coverImage}
                                    alt=""
                                    wrapperClassName="w-full h-full"
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-in-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-40 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />
                                
                                {(isVideoUrl(project.coverImage) || project.images?.some(img => isVideoUrl(img.url, img.type))) ? (
                                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white border border-white/20 shadow-md">
                                        <Film className="w-3 h-3 text-indigo-400" />
                                        <span>MP4</span>
                                    </div>
                                ) : (isGifUrl(project.coverImage) || project.images?.some(img => isGifUrl(img.url))) ? (
                                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-fuchsia-950/70 backdrop-blur-md rounded-full text-[10px] font-bold text-fuchsia-200 border border-fuchsia-400/30 shadow-md">
                                        <Sparkles className="w-3 h-3 text-fuchsia-400" />
                                        <span>GIF</span>
                                    </div>
                                ) : null}
                            </div>
                            
                            {/* Hover/Active Overlay */}
                            <div 
                                className="absolute inset-0 bg-indigo-950/85 backdrop-blur-[4px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 p-6 pointer-events-none"
                            >
                                <h3 className="text-white text-xl sm:text-2xl font-bold text-center mb-3 transform translate-y-6 group-hover:translate-y-0 transition-all duration-500 ease-out">
                                    {project.title}
                                </h3>
                                
                                {project.projectType && (
                                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-indigo-100 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 delay-75 ease-out">
                                        {project.projectType}
                                    </span>
                                )}
                                
                                <div className="mt-8 transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-150">
                                    <div className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white bg-white/5 group-hover:bg-white group-hover:text-indigo-900 transition-all duration-300 shadow-xl">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Mobile-visible title if not hovering (optional, but helps clarity on small devices) */}
                            <div className="p-4 sm:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                                <h3 className="text-gray-900 dark:text-white font-bold truncate">{project.title}</h3>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{project.projectType}</p>
                            </div>
                        </div>
                    ))}
                    
                    {filteredProjects.length === 0 && (
                        <div className="col-span-full text-center py-20 animate-on-scroll fade-in-up">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/20 mb-6 text-indigo-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">{t.works.noProjects}</p>
                            <button 
                                onClick={() => setActiveFilter('All')}
                                className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md"
                            >
                                {t.works.viewAll}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default WorksSection;
