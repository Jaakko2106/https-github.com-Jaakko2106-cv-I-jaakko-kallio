
import React, { useState } from 'react';
import AnimatedBackground from './AnimatedBackground';
import { useLanguage } from '../contexts/LanguageContext';

const ContactSection: React.FC = () => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        await new Promise(resolve => setTimeout(resolve, 1500));
        setFormData({ name: '', email: '', message: '' });
        setStatus('success');
    };

    return (
        <section id="contact" className="py-20 px-8 relative overflow-hidden bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
            <AnimatedBackground />
            <div className="relative z-10 container mx-auto max-w-2xl">
                <h2 className="text-3xl font-bold text-center mb-4 text-indigo-700 dark:text-indigo-400 animate-on-scroll zoom-in">{t.contact.title}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center animate-on-scroll fade-in" style={{ transitionDelay: '0.2s' }}>
                    {t.contact.subtitle}
                </p>

                <div className="flex justify-center gap-6 mb-10 animate-on-scroll fade-in" style={{ transitionDelay: '0.25s' }}>
                    {[
                        { icon: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></>, label: "LinkedIn", color: "hover:text-[#0077b5]" },
                        { icon: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>, label: "GitHub", color: "hover:text-gray-900 dark:hover:text-white" },
                        { icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>, label: "Facebook", color: "hover:text-[#1877f2]" }
                    ].map((item, idx) => (
                        <a 
                            key={idx}
                            href="#" 
                            className={`text-gray-500 dark:text-gray-400 transition-all duration-300 transform hover:scale-110 p-2 rounded-full hover:bg-white/50 dark:hover:bg-gray-700/50 ${item.color}`}
                            aria-label={item.label}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                {item.icon}
                            </svg>
                        </a>
                    ))}
                </div>
                
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-indigo-50 dark:border-indigo-900/30 animate-on-scroll zoom-in transition-all duration-300" style={{ transitionDelay: '0.3s' }}>
                    {status === 'success' ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-500 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t.contact.sentTitle}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{t.contact.sentDesc}</p>
                            <button 
                                onClick={() => setStatus('idle')}
                                className="mt-6 text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                            >
                                {t.contact.sendAnother}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.contact.form.name}</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white/50 dark:bg-gray-800/50 dark:text-gray-100"
                                    placeholder={t.contact.form.placeholderName}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.contact.form.email}</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white/50 dark:bg-gray-800/50 dark:text-gray-100"
                                    placeholder={t.contact.form.placeholderEmail}
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.contact.form.message}</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={4}
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white/50 dark:bg-gray-800/50 dark:text-gray-100 resize-none"
                                    placeholder={t.contact.form.placeholderMessage}
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className={`w-full bg-indigo-600 dark:bg-indigo-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-300 ease-in-out text-lg shadow-md flex justify-center items-center ${status === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {status === 'submitting' ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t.contact.form.sending}
                                    </>
                                ) : (
                                    t.contact.form.submit
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
