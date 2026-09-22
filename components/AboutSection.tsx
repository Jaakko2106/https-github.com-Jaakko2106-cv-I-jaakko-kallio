
import React, { useState } from 'react';
import AnimatedBackground from './AnimatedBackground';
import { useLanguage } from '../contexts/LanguageContext';
import EditableImage from './EditableImage';
import InteractiveSkillNetwork from './InteractiveSkillNetwork';
import SkillsRadarChart from './SkillsRadarChart';
import { Compass, Share2 } from 'lucide-react';

interface Skill {
    name: string;
    level: number;
}

interface SoftSkill {
    id: string; 
    name: string;
    value: number;
    color: string;
}

const softwareSkills: Skill[] = [
    { name: "Adobe Photoshop", level: 95 },
    { name: "Adobe Illustrator", level: 90 },
    { name: "Adobe InDesign", level: 85 },
    { name: "Figma / Sketch", level: 90 },
    { name: "After Effects", level: 75 },
    { name: "Premiere Pro", level: 70 },
];

const designSkills: Skill[] = [
    { name: "UI/UX Design", level: 90 },
    { name: "Brand Identity", level: 85 },
    { name: "Web Design", level: 80 },
    { name: "Print Media", level: 95 },
    { name: "Visual Storytelling", level: 85 },
];

const SkillBar: React.FC<{ skill: Skill; delay?: string }> = ({ skill, delay = '0s' }) => (
    <div 
        className="w-full mb-4 animate-on-scroll fade-in-up group/skill" 
        style={{ transitionDelay: delay, '--target-width': `${skill.level}%` } as React.CSSProperties}
    >
        <div className="flex justify-between mb-1">
            <span className="text-base font-medium text-gray-700 dark:text-gray-300">{skill.name}</span>
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{skill.level}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 relative group/tooltip cursor-pointer">
            <div 
                className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full transition-all duration-1000 ease-out w-0 group-[.is-visible]/skill:w-[var(--target-width)]" 
                aria-valuenow={skill.level}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
            ></div>

            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                <div className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-xs rounded py-1 px-2 relative shadow-lg whitespace-nowrap">
                    {skill.name}: {skill.level}%
                    <div className="absolute w-2 h-2 bg-gray-800 dark:bg-gray-200 rotate-45 left-1/2 -translate-x-1/2 -bottom-1"></div>
                </div>
            </div>
        </div>
    </div>
);

const DonutChart: React.FC<{ data: SoftSkill[] }> = ({ data }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const { t } = useLanguage();

    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    let cumulativeAngle = 0;

    const getCoordinates = (percent: number, radius: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x * radius, y * radius];
    };

    const slices = data.map((slice, index) => {
        const startAngle = cumulativeAngle;
        const sliceAngle = slice.value / total;
        cumulativeAngle += sliceAngle;
        const endAngle = cumulativeAngle;

        const [startX, startY] = getCoordinates(startAngle, 100);
        const [endX, endY] = getCoordinates(endAngle, 100);
        const [innerStartX, innerStartY] = getCoordinates(endAngle, 65);
        const [innerEndX, innerEndY] = getCoordinates(startAngle, 65);

        const largeArcFlag = sliceAngle > 0.5 ? 1 : 0;

        const pathData = [
            `M ${startX} ${startY}`,
            `A 100 100 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L ${innerStartX} ${innerStartY}`,
            `A 65 65 0 ${largeArcFlag} 0 ${innerEndX} ${innerEndY}`,
            'Z'
        ].join(' ');

        return { pathData, ...slice, index };
    });

    const activeItem = hoveredIndex !== null ? data[hoveredIndex] : null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 h-full">
            <div className="relative w-64 h-64 shrink-0">
                <svg viewBox="-110 -110 220 220" className="w-full h-full transform -rotate-90">
                    {slices.map((slice) => (
                        <path
                            key={slice.id}
                            d={slice.pathData}
                            fill={slice.color}
                            stroke="currentColor"
                            className="transition-all duration-300 ease-out cursor-pointer hover:opacity-90 text-white dark:text-gray-800"
                            strokeWidth="2"
                            style={{ 
                                transform: hoveredIndex === slice.index ? 'scale(1.05)' : 'scale(1)',
                                transformOrigin: 'center' 
                            }}
                            onMouseEnter={() => setHoveredIndex(slice.index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            aria-label={`${slice.name}: ${slice.value}%`}
                        />
                    ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <div className="transition-all duration-300 transform">
                        <span className="block text-3xl font-bold text-gray-800 dark:text-gray-100">
                            {activeItem ? `${activeItem.value}%` : ""}
                        </span>
                        <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2">
                            {activeItem ? activeItem.name : t.about.softSkills}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
                {data.map((item, index) => (
                    <div 
                        key={item.id} 
                        className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer ${hoveredIndex === index ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <div className="flex items-center gap-3">
                            <span 
                                className="w-3 h-3 rounded-full shadow-sm" 
                                style={{ backgroundColor: item.color }}
                            ></span>
                            <span className={`text-sm font-medium ${hoveredIndex === index ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                {item.name}
                            </span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold">{item.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AboutSection: React.FC = () => {
    const { t, language } = useLanguage();
    const [skillsView, setSkillsView] = useState<'radar' | 'network'>('radar');

    const softSkills: SoftSkill[] = [
        { id: "comm", name: t.about.softSkillsList.Communication, value: 25, color: "#4f46e5" }, 
        { id: "prob", name: t.about.softSkillsList.ProblemSolving, value: 25, color: "#818cf8" }, 
        { id: "team", name: t.about.softSkillsList.Teamwork, value: 20, color: "#c7d2fe" },    
        { id: "adapt", name: t.about.softSkillsList.Adaptability, value: 15, color: "#312e81" },
        { id: "create", name: t.about.softSkillsList.Creativity, value: 15, color: "#6366f1" },  
    ];

    const stats = [
        { value: t.about.stats.years, label: t.about.stats.yearsDesc },
        { value: t.about.stats.coffee, label: t.about.stats.coffeeDesc },
        { value: t.about.stats.awards, label: t.about.stats.awardsDesc },
        { value: t.about.stats.vip, label: t.about.stats.vipDesc },
    ];

    return (
        <section id="about" className="py-20 px-8 relative overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-300">
            <AnimatedBackground />
            <div className="relative z-10 container mx-auto max-w-5xl">
                <h2 className="text-3xl font-bold text-center mb-12 text-indigo-700 dark:text-indigo-400 animate-on-scroll zoom-in">{t.about.title}</h2>
                
                <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
                    <div className="md:w-5/12 w-full animate-on-scroll fade-in-left">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 ease-out group">
                            <div className="absolute inset-0 bg-indigo-600/10 dark:bg-indigo-900/20 group-hover:bg-transparent transition-colors z-10 pointer-events-none"></div>
                            <EditableImage 
                                storageKey="about-profile"
                                defaultSrc="/uusomakuva.png"
                                alt="Jaakko Profile"
                                wrapperClassName="w-full h-auto"
                                className="w-full h-auto object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                    <div className="md:w-7/12 w-full text-lg text-gray-700 dark:text-gray-300 space-y-4 animate-on-scroll fade-in-right">
                        <p>{t.about.p1}</p>
                        <p>{t.about.p2}</p>
                    </div>
                </div>

                {/* Random Numbers / Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 animate-on-scroll fade-in-up">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-b-4 border-indigo-500 text-center hover:-translate-y-1 transition-transform duration-300">
                             <div className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{stat.value}</div>
                             <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="w-full mb-16 animate-on-scroll fade-in-up">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                        <div className="text-center sm:text-left">
                            <h3 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                                {language === 'fi' ? 'Suunnittelu- ja Ohjelmisto-osaaminen' : 'Design & Software Skills'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {language === 'fi'
                                    ? 'Tutki osaamistasoja tarkassa Radar-kaaviossa tai interaktiivisessa verkossa'
                                    : 'Explore proficiency levels in the radar chart or interactive network'}
                            </p>
                        </div>

                        {/* View Switcher: Radar Chart (Recharts) vs Interactive Network */}
                        <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold shadow-xs">
                            <button
                                type="button"
                                onClick={() => setSkillsView('radar')}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                    skillsView === 'radar'
                                        ? 'bg-indigo-600 text-white shadow-sm font-bold'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white'
                                }`}
                            >
                                <Compass className="w-3.5 h-3.5" />
                                <span>{language === 'fi' ? 'Radar-kaavio' : 'Radar Chart'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSkillsView('network')}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                    skillsView === 'network'
                                        ? 'bg-indigo-600 text-white shadow-sm font-bold'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white'
                                }`}
                            >
                                <Share2 className="w-3.5 h-3.5" />
                                <span>{language === 'fi' ? 'Interaktiivinen verkko' : 'Interactive Network'}</span>
                            </button>
                        </div>
                    </div>

                    {skillsView === 'radar' ? (
                        <SkillsRadarChart softwareSkills={softwareSkills} designSkills={designSkills} />
                    ) : (
                        <InteractiveSkillNetwork softwareSkills={softwareSkills} designSkills={designSkills} />
                    )}
                </div>

                <div className="max-w-3xl mx-auto w-full">
                    <h3 className="text-2xl font-bold text-center mb-8 text-indigo-700 dark:text-indigo-400 animate-on-scroll fade-in">{t.about.softSkills}</h3>
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-indigo-50 dark:border-indigo-900/30 flex items-center justify-center animate-on-scroll zoom-in transition-colors" style={{ transitionDelay: '0.2s' }}>
                        <DonutChart data={softSkills} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
