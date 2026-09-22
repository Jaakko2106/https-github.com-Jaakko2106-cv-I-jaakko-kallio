
import React from 'react';
import AnimatedBackground from './AnimatedBackground';
import { useLanguage } from '../contexts/LanguageContext';

const EducationItem: React.FC<{ degree: string; university: string; period: string; description?: string; direction: 'fade-in-left' | 'fade-in-right' }> = ({ degree, university, period, description, direction }) => (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 animate-on-scroll ${direction} border border-transparent dark:border-gray-700/50`}>
        <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-400">{degree}</h3>
        <p className="text-gray-600 dark:text-gray-300 font-semibold">{university}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{period}</p>
        {description && <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>}
    </div>
);

const EducationSection: React.FC = () => {
    const { t } = useLanguage();

    return (
        <section id="education" className="py-20 px-8 relative overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-300">
            <AnimatedBackground />
            <div className="relative z-10 container mx-auto max-w-4xl">
                <h2 className="text-3xl font-bold text-center mb-12 text-indigo-700 dark:text-indigo-400 animate-on-scroll zoom-in">{t.education.title}</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <EducationItem 
                        degree={t.education.schools[0].degree}
                        university={t.education.schools[0].university}
                        description={t.education.schools[0].description}
                        period={t.education.schools[0].period}
                        direction="fade-in-left"
                    />
                    <EducationItem 
                        degree={t.education.schools[1].degree}
                        university={t.education.schools[1].university}
                        description={t.education.schools[1].description}
                        period={t.education.schools[1].period}
                        direction="fade-in-right"
                    />
                </div>
            </div>
        </section>
    );
};

export default EducationSection;
