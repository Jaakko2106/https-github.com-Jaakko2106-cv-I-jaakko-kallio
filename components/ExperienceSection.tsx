
import React, { useState } from 'react';
import AnimatedBackground from './AnimatedBackground';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Briefcase, Calendar, Building2, CheckCircle2, Sparkles } from 'lucide-react';

interface JobData {
    title: string;
    company: string;
    period: string;
    description: string;
    detailedDescription?: string;
    responsibilities?: string[];
    skills?: string[];
}

interface ExperienceItemProps {
    job: JobData;
    isOpen: boolean;
    onToggle: () => void;
    labels: {
        showMore: string;
        showLess: string;
        responsibilities: string;
        skillsUsed: string;
    };
    isLast: boolean;
    index: number;
}

const ExperienceItem: React.FC<ExperienceItemProps> = ({
    job,
    isOpen,
    onToggle,
    labels,
    isLast,
    index
}) => {
    return (
        <div className="relative pl-8 sm:pl-12 pb-10 group last:pb-2">
            {/* Continuous timeline line */}
            {!isLast && (
                <div className="absolute left-0 top-3 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-indigo-300 to-indigo-100 dark:from-indigo-400 dark:via-indigo-800 dark:to-indigo-950 transition-colors" />
            )}

            {/* Timeline node icon */}
            <div 
                className={`absolute left-[-11px] top-2 w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center cursor-pointer ${
                    isOpen 
                        ? 'bg-indigo-600 border-white dark:border-gray-900 shadow-md ring-4 ring-indigo-200 dark:ring-indigo-900/60 scale-110' 
                        : 'bg-white dark:bg-gray-800 border-indigo-400 dark:border-indigo-500 group-hover:border-indigo-600 group-hover:bg-indigo-50 dark:group-hover:bg-gray-700'
                }`}
                onClick={onToggle}
            >
                <div className={`w-2 h-2 rounded-full transition-colors ${isOpen ? 'bg-white' : 'bg-indigo-500 group-hover:bg-indigo-600'}`} />
            </div>

            {/* Main Interactive Card */}
            <div 
                className={`rounded-2xl border transition-all duration-300 backdrop-blur-sm overflow-hidden ${
                    isOpen 
                        ? 'bg-white/95 dark:bg-gray-800/95 border-indigo-200 dark:border-indigo-700/60 shadow-xl ring-1 ring-indigo-500/20' 
                        : 'bg-white/70 dark:bg-gray-800/70 border-gray-200/80 dark:border-gray-700/60 hover:bg-white dark:hover:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600/50 shadow-sm hover:shadow-md'
                }`}
            >
                {/* Clickable Header */}
                <button
                    type="button"
                    onClick={onToggle}
                    aria-expanded={isOpen}
                    className="w-full text-left p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl transition-colors cursor-pointer"
                >
                    <div className="flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {job.title}
                            </h3>
                            {isOpen && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                                    <Sparkles className="w-3 h-3" />
                                    Active
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                            <span className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                                <Building2 className="w-4 h-4 opacity-80" />
                                {job.company}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                <Calendar className="w-4 h-4 opacity-80" />
                                {job.period}
                            </span>
                        </div>

                        {/* Brief summary teaser */}
                        <p className="text-sm text-gray-600 dark:text-gray-300 pt-1 leading-relaxed line-clamp-2">
                            {job.description}
                        </p>
                    </div>

                    {/* Action button / Toggle indicator */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline">
                            {isOpen ? labels.showLess : labels.showMore}
                        </span>
                        <div className={`p-2 rounded-full transition-transform duration-300 ${
                            isOpen 
                                ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 rotate-180' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                        }`}>
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>
                </button>

                {/* Collapsible Details Content */}
                <AnimatePresence initial={false}>
                    {isOpen && (
                        <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] }}
                            className="overflow-hidden"
                        >
                            <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-gray-100 dark:border-gray-700/60 space-y-5">
                                {/* Detailed overview paragraph */}
                                {job.detailedDescription && (
                                    <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-100/60 dark:border-indigo-900/40">
                                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 leading-relaxed">
                                            {job.detailedDescription}
                                        </p>
                                    </div>
                                )}

                                {/* Key Responsibilities */}
                                {job.responsibilities && job.responsibilities.length > 0 && (
                                    <div className="space-y-2.5">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                                            <Briefcase className="w-3.5 h-3.5" />
                                            {labels.responsibilities}
                                        </h4>
                                        <ul className="space-y-2">
                                            {job.responsibilities.map((resp, i) => (
                                                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                    <span>{resp}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Skills & Methodologies Tags */}
                                {job.skills && job.skills.length > 0 && (
                                    <div className="space-y-2 pt-1">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            {labels.skillsUsed}
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {job.skills.map((skill, i) => (
                                                <span 
                                                    key={i}
                                                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700/80 text-gray-700 dark:text-gray-200 border border-gray-200/60 dark:border-gray-600/40 transition-colors hover:border-indigo-300 dark:hover:border-indigo-500"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const ExperienceSection: React.FC = () => {
    const { t } = useLanguage();
    // Default open first item so user immediately notices the interactive rich format
    const [openIndices, setOpenIndices] = useState<number[]>([0]);

    const toggleItem = (index: number) => {
        setOpenIndices(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index) 
                : [...prev, index]
        );
    };

    const jobs = (t.experience.jobs as unknown as JobData[]) || [];

    const labels = {
        showMore: (t.experience as any).showMore || 'Show details',
        showLess: (t.experience as any).showLess || 'Hide details',
        responsibilities: (t.experience as any).responsibilities || 'Key Responsibilities & Highlights',
        skillsUsed: (t.experience as any).skillsUsed || 'Skills & Methodologies'
    };

    return (
        <section id="experience" className="py-20 px-4 sm:px-8 relative overflow-hidden bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
            <AnimatedBackground />
            <div className="relative z-10 container mx-auto max-w-3xl">
                <div className="text-center mb-12 animate-on-scroll zoom-in">
                    <h2 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">
                        {t.experience.title}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {(t.experience as any).clickToExpand || 'Click any role to view detailed responsibilities and skills'}
                    </p>
                </div>

                <div className="relative mt-8">
                    {jobs.map((job, index) => (
                        <ExperienceItem 
                            key={`${job.company}-${index}`}
                            job={job}
                            isOpen={openIndices.includes(index)}
                            onToggle={() => toggleItem(index)}
                            labels={labels}
                            isLast={index === jobs.length - 1}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ExperienceSection;

