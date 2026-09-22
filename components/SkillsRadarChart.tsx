import React, { useState, useEffect, useMemo } from 'react';
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Tooltip,
    Legend
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { Sparkles, Layers, Sliders, CheckCircle2 } from 'lucide-react';

export interface SkillItem {
    name: string;
    level: number;
    description?: string;
}

interface Props {
    softwareSkills: SkillItem[];
    designSkills: SkillItem[];
}

const toolDescriptionsEn: Record<string, string> = {
    "Adobe Photoshop": "Expert image retouching, photo manipulation, complex compositing, and raster graphic creation.",
    "Adobe Illustrator": "Precision vector illustration, icon design, brand identity systems, and scalable artwork.",
    "Adobe InDesign": "High-end editorial layouts, multi-page print publications, typography, and prepress prep.",
    "Figma / Sketch": "Modern UI/UX prototyping, design systems, wireframing, and interactive components.",
    "After Effects": "Motion graphics, title sequences, visual effects, and animated micro-interactions.",
    "Premiere Pro": "Video editing, narrative sequencing, color grading, audio synchronization, and export workflows.",
    "UI/UX Design": "User-centered design architecture, wireframing, user journeys, usability testing, and intuitive interfaces.",
    "Brand Identity": "Comprehensive visual identity design, logo marks, typography scales, color theory, and style guides.",
    "Web Design": "Modern, responsive layouts designed with mobile-first usability and aesthetic accessibility.",
    "Print Media": "Commercial printing expertise, CMYK separation, print proofs, paper stocks, and finishings.",
    "Visual Storytelling": "Translating complex ideas and emotions into compelling, coherent visual design narratives."
};

const toolDescriptionsFi: Record<string, string> = {
    "Adobe Photoshop": "Kuvankäsittely, valokuvien retusointi, monimutkaiset sommittelut ja rasterigrafiikat.",
    "Adobe Illustrator": "Tarkka vektorikuvitus, ikonisuunnittelu, brändijärjestelmät ja skaalautuva grafiikka.",
    "Adobe InDesign": "Julkaisusuunnittelu, monisivuiset painotuotteet, typografia ja painovalmiit aineistot.",
    "Figma / Sketch": "Moderni UI/UX-prototyypitys, suunnittelujärjestelmät, rautalankamallit ja käyttöliittymät.",
    "After Effects": "Liikegrafiikka, animaatiot, visuaaliset tehosteet ja dynaaminen visuaalinen sisältö.",
    "Premiere Pro": "Videoleikkaus, narratiivinen rytmitys, värimäärittely ja ammattimainen jälkituotanto.",
    "UI/UX Design": "Käyttäjäkeskeinen suunnittelu, käyttäjäpolut, käytettävyystestaus ja intuitiiviset käyttöliittymät.",
    "Brand Identity": "Kokonaisvaltainen brändi-identiteetti, logot, typografia, väriteoria ja tyylioppaat.",
    "Web Design": "Responsiiviset ja saavutettavat verkkosivuasettelut modernilla esteettisyydellä.",
    "Print Media": "Ammattimainen painotekniikka, CMYK-erottelut, vedokset ja painomateriaalit.",
    "Visual Storytelling": "Monimutkaisten viestien ja tunteiden välittäminen kiehtovaksi visuaaliseksi tarinaksi."
};

export const SkillsRadarChart: React.FC<Props> = ({ softwareSkills, designSkills }) => {
    const { language } = useLanguage();
    const isFi = language === 'fi';

    const [activeTab, setActiveTab] = useState<'tools' | 'disciplines' | 'both'>('tools');
    const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    // Track dark mode changes for SVG canvas colors
    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };

        checkDarkMode();

        const observer = new MutationObserver(() => {
            checkDarkMode();
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    const descriptions = isFi ? toolDescriptionsFi : toolDescriptionsEn;

    // Format data for Recharts Radar
    const chartData = useMemo(() => {
        if (activeTab === 'tools') {
            return softwareSkills.map(skill => ({
                subject: skill.name,
                Proficiency: skill.level,
                fullMark: 100,
                description: descriptions[skill.name] || ''
            }));
        }

        if (activeTab === 'disciplines') {
            return designSkills.map(skill => ({
                subject: skill.name,
                Proficiency: skill.level,
                fullMark: 100,
                description: descriptions[skill.name] || ''
            }));
        }

        // Both / Combined comparison view
        // Align into a unified chart dataset
        const allKeys = Array.from(new Set([
            ...softwareSkills.map(s => s.name),
            ...designSkills.map(s => s.name)
        ]));

        return allKeys.map(key => {
            const toolSkill = softwareSkills.find(s => s.name === key);
            const designSkill = designSkills.find(s => s.name === key);

            return {
                subject: key,
                Tools: toolSkill ? toolSkill.level : 0,
                Disciplines: designSkill ? designSkill.level : 0,
                fullMark: 100,
                description: descriptions[key] || ''
            };
        });
    }, [activeTab, softwareSkills, designSkills, descriptions]);

    // Active hovered item info
    const activeSkillInfo = useMemo(() => {
        const targetName = hoveredSkill || chartData[0]?.subject;
        const toolItem = softwareSkills.find(s => s.name === targetName);
        const designItem = designSkills.find(s => s.name === targetName);
        const level = toolItem?.level ?? designItem?.level ?? 0;
        const desc = descriptions[targetName] || (isFi ? 'Suunnitteluosaamisen osa-alue.' : 'Core design proficiency domain.');

        return {
            name: targetName,
            level,
            desc,
            isTool: Boolean(toolItem)
        };
    }, [hoveredSkill, chartData, softwareSkills, designSkills, descriptions, isFi]);

    const getProficiencyLabel = (level: number) => {
        if (level >= 90) return isFi ? 'Mestari / Asiantuntija' : 'Expert Master';
        if (level >= 80) return isFi ? 'Edistynyt' : 'Advanced';
        if (level >= 70) return isFi ? 'Pätevä' : 'Proficient';
        return isFi ? 'Perusosaaminen' : 'Competent';
    };

    return (
        <div className="w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-100/80 dark:border-indigo-900/40 transition-colors">
            {/* Header with Title and Mode Switcher */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700/60">
                <div className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {isFi ? 'Design-työkalujen Osaamisprofiili' : 'Design Tools Proficiency Radar'}
                        </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {isFi 
                            ? 'Visuaalinen arviointi vahvuuksista eri suunnitteluohjelmistoissa ja menetelmissä'
                            : 'Visual proficiency distribution across creative software tools & methodologies'}
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-700/70 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300">
                    <button
                        type="button"
                        onClick={() => setActiveTab('tools')}
                        className={`px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                            activeTab === 'tools'
                                ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-sm font-bold'
                                : 'hover:text-indigo-600 dark:hover:text-white'
                        }`}
                    >
                        {isFi ? 'Työkalut' : 'Design Tools'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('disciplines')}
                        className={`px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                            activeTab === 'disciplines'
                                ? 'bg-white dark:bg-emerald-600 text-emerald-700 dark:text-white shadow-sm font-bold'
                                : 'hover:text-emerald-600 dark:hover:text-white'
                        }`}
                    >
                        {isFi ? 'Menetelmät' : 'Disciplines'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('both')}
                        className={`px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                            activeTab === 'both'
                                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-indigo-300 shadow-sm font-bold'
                                : 'hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        {isFi ? 'Vertailu' : 'Comparison'}
                    </button>
                </div>
            </div>

            {/* Main Visual: Chart + Live Info Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Radar Chart Container */}
                <div className="lg:col-span-8 w-full h-[360px] sm:h-[420px] relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                            <PolarGrid 
                                stroke={isDarkMode ? '#374151' : '#e2e8f0'} 
                                strokeDasharray="3 3" 
                            />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{
                                    fill: isDarkMode ? '#cbd5e1' : '#475569',
                                    fontSize: 12,
                                    fontWeight: 600,
                                }}
                            />
                            <PolarRadiusAxis
                                angle={90}
                                domain={[0, 100]}
                                tick={{
                                    fill: isDarkMode ? '#64748b' : '#94a3b8',
                                    fontSize: 10,
                                }}
                                stroke={isDarkMode ? '#475569' : '#cbd5e1'}
                            />

                            {/* Single Mode: Tools */}
                            {activeTab === 'tools' && (
                                <Radar
                                    name={isFi ? 'Työkalut' : 'Software Tools'}
                                    dataKey="Proficiency"
                                    stroke="#6366f1"
                                    fill="#6366f1"
                                    fillOpacity={isDarkMode ? 0.45 : 0.35}
                                    strokeWidth={2.5}
                                    dot={{
                                        r: 4,
                                        fill: '#4f46e5',
                                        stroke: '#ffffff',
                                        strokeWidth: 2
                                    }}
                                    activeDot={{
                                        r: 7,
                                        fill: '#4338ca',
                                        stroke: '#ffffff',
                                        strokeWidth: 2
                                    }}
                                />
                            )}

                            {/* Single Mode: Disciplines */}
                            {activeTab === 'disciplines' && (
                                <Radar
                                    name={isFi ? 'Menetelmät' : 'Design Disciplines'}
                                    dataKey="Proficiency"
                                    stroke="#10b981"
                                    fill="#10b981"
                                    fillOpacity={isDarkMode ? 0.45 : 0.35}
                                    strokeWidth={2.5}
                                    dot={{
                                        r: 4,
                                        fill: '#059669',
                                        stroke: '#ffffff',
                                        strokeWidth: 2
                                    }}
                                    activeDot={{
                                        r: 7,
                                        fill: '#047857',
                                        stroke: '#ffffff',
                                        strokeWidth: 2
                                    }}
                                />
                            )}

                            {/* Dual Mode: Both Overlaid */}
                            {activeTab === 'both' && (
                                <>
                                    <Radar
                                        name={isFi ? 'Ohjelmistot' : 'Tools'}
                                        dataKey="Tools"
                                        stroke="#6366f1"
                                        fill="#6366f1"
                                        fillOpacity={0.25}
                                        strokeWidth={2}
                                        dot={{ r: 3, fill: '#6366f1' }}
                                    />
                                    <Radar
                                        name={isFi ? 'Menetelmät' : 'Disciplines'}
                                        dataKey="Disciplines"
                                        stroke="#10b981"
                                        fill="#10b981"
                                        fillOpacity={0.25}
                                        strokeWidth={2}
                                        dot={{ r: 3, fill: '#10b981' }}
                                    />
                                    <Legend 
                                        wrapperStyle={{ paddingTop: 10 }}
                                        formatter={(value) => (
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                {value}
                                            </span>
                                        )}
                                    />
                                </>
                            )}

                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        const value = payload[0].value;
                                        return (
                                            <div className="bg-gray-900/95 text-white p-3 rounded-xl shadow-xl border border-gray-700 backdrop-blur-md max-w-xs text-xs">
                                                <div className="font-bold text-sm text-indigo-300 mb-1 flex items-center justify-between">
                                                    <span>{data.subject}</span>
                                                    <span className="bg-indigo-600/60 px-2 py-0.5 rounded text-[11px] text-white">
                                                        {value}%
                                                    </span>
                                                </div>
                                                {data.description && (
                                                    <p className="text-gray-300 text-[11px] leading-relaxed mt-1">
                                                        {data.description}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Right Side: Detailed Card for Selected / Hovered Skill */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-5 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm transition-all">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400">
                                {isFi ? 'Valittu Osaaminen' : 'Highlighted Capability'}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 shadow-xs border border-indigo-100 dark:border-indigo-800">
                                {getProficiencyLabel(activeSkillInfo.level)}
                            </span>
                        </div>

                        <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {activeSkillInfo.name}
                        </h5>

                        <div className="flex items-center gap-3 my-3">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${activeSkillInfo.level}%` }}
                                />
                            </div>
                            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                                {activeSkillInfo.level}%
                            </span>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed min-h-[48px]">
                            {activeSkillInfo.desc}
                        </p>
                    </div>

                    {/* Interactive Chips to quick-select and examine any tool */}
                    <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5" />
                            {isFi ? 'Pikavalinta työkaluille:' : 'Quick Select Tool:'}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            {chartData.map((item) => (
                                <button
                                    key={item.subject}
                                    type="button"
                                    onClick={() => setHoveredSkill(item.subject)}
                                    onMouseEnter={() => setHoveredSkill(item.subject)}
                                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all duration-150 cursor-pointer ${
                                        activeSkillInfo.name === item.subject
                                            ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300 dark:ring-indigo-700'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500'
                                    }`}
                                >
                                    {item.subject}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkillsRadarChart;
