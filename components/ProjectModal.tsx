import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Project, ProjectImage } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import EditableImage from './EditableImage';
import MediaViewer from './MediaViewer';
import MediaUploadModal, { AddedMediaResult } from './MediaUploadModal';
import { isVideoUrl, resolveMediaUrl, getMediaFormat, getFormatDescription } from '../utils/mediaUtils';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../src/firebase';
import { 
    Code2, Palette, FileJson, Layout, Database, Terminal, FileCode2, FileImage, 
    MonitorSmartphone, Hexagon, PenTool, Layers, Plus, Trash2, ArrowLeft, ArrowRight,
    Film, Star, Edit3, Check
} from 'lucide-react';

const getToolInfo = (toolName: string) => {
    const name = toolName.toLowerCase();
    
    const infoMap: Record<string, { desc: string; icon: any }> = {
        'html': { desc: 'Markup language for structure.', icon: FileCode2 },
        'css': { desc: 'Style sheet language for presentation.', icon: Layout },
        'javascript': { desc: 'Dynamic programming language.', icon: FileJson },
        'react': { desc: 'Library for building user interfaces.', icon: Hexagon },
        'tailwind': { desc: 'Utility-first CSS framework.', icon: Palette },
        'tailwind css': { desc: 'Utility-first CSS framework.', icon: Palette },
        'typescript': { desc: 'Typed superset of JavaScript.', icon: Code2 },
        'vite': { desc: 'Next generation frontend tooling.', icon: Terminal },
        'figma': { desc: 'Collaborative interface design tool.', icon: Palette },
        'node.js': { desc: 'JavaScript runtime environment.', icon: Database },
        'photoshop': { desc: 'Raster graphics editor.', icon: FileImage },
        'adobe photoshop': { desc: 'Raster graphics editor.', icon: FileImage },
        'illustrator': { desc: 'Vector graphics editor.', icon: PenTool },
        'adobe illustrator': { desc: 'Vector graphics editor.', icon: PenTool },
        'indesign': { desc: 'Desktop publishing software.', icon: Layers },
        'adobe indesign': { desc: 'Desktop publishing software.', icon: Layers },
        'web design': { desc: 'Responsive and aesthetic design.', icon: MonitorSmartphone },
        'ui/ux': { desc: 'User interface & experience design.', icon: Layout },
    };

    return infoMap[name] || { desc: 'Technology or skill used.', icon: Code2 };
};

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
}

const CarouselImage: React.FC<{ 
    src: string; 
    alt: string; 
    onClick: () => void;
    storageKey: string;
    isActive: boolean;
}> = ({ src, alt, onClick, storageKey, isActive }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div 
            className="relative w-full h-full group/image cursor-zoom-in overflow-hidden rounded-lg" 
            onClick={onClick}
            aria-hidden={!isActive}
        >
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 dark:bg-gray-800/50 rounded-lg pointer-events-none">
                    <svg className="w-8 h-8 text-indigo-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
            
            <EditableImage
                storageKey={storageKey}
                defaultSrc={src}
                alt={alt}
                clickToUpload={true}
                wrapperClassName="w-full h-full"
                className={`absolute block w-full h-full object-contain -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 rounded-lg transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) group-hover/image:scale-105 group-hover/image:brightness-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setIsLoaded(true)}
            />

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 pointer-events-none bg-black/10 backdrop-blur-[1px]">
                <div className="bg-black/40 backdrop-blur-md p-3 rounded-full text-white shadow-lg transform scale-75 group-hover/image:scale-100 transition-transform duration-300 border border-white/20">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                </div>
            </div>
        </div>
    );
};

const CarouselMedia: React.FC<{
    item: ProjectImage;
    alt: string;
    onClick: () => void;
    storageKey: string;
    isActive: boolean;
}> = ({ item, alt, onClick, storageKey, isActive }) => {
    const isVideo = isVideoUrl(item.url, item.type);

    if (isVideo) {
        return (
            <div className="relative w-full h-full cursor-zoom-in" onClick={onClick}>
                <MediaViewer
                    src={item.url}
                    type="video"
                    alt={alt}
                    isActive={isActive}
                    showBadge={true}
                    showControls={true}
                    onClick={onClick}
                    wrapperClassName="w-full h-full"
                    className="w-full h-full object-contain"
                />
            </div>
        );
    }

    return (
        <CarouselImage
            src={item.url}
            alt={alt}
            onClick={onClick}
            storageKey={storageKey}
            isActive={isActive}
        />
    );
};

const FullscreenMedia: React.FC<{ item: ProjectImage; alt: string }> = ({ item, alt }) => {
    const isVideo = isVideoUrl(item.url, item.type);
    const [resolvedUrl, setResolvedUrl] = useState(item.url);
    const [isLoaded, setIsLoaded] = useState(false);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        let isMounted = true;
        resolveMediaUrl(item.url).then((url) => {
            if (isMounted) setResolvedUrl(url);
        }).catch(() => {
            if (isMounted) setResolvedUrl(item.url);
        });
        setScale(1);
        setPosition({ x: 0, y: 0 });
        return () => { isMounted = false; };
    }, [item.url]);

    if (isVideo) {
        return (
            <div 
                className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <video
                    src={resolvedUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="max-w-full max-h-[85vh] md:max-h-[90vh] object-contain shadow-2xl rounded-xl border border-white/10"
                />
            </div>
        );
    }

    const handleZoomIn = (e: React.MouseEvent) => {
        e.stopPropagation();
        setScale(prev => Math.min(prev + 0.5, 4));
    };

    const handleZoomOut = (e: React.MouseEvent) => {
        e.stopPropagation();
        setScale(prev => {
            const newScale = Math.max(prev - 0.5, 1);
            if (newScale === 1) setPosition({ x: 0, y: 0 });
            return newScale;
        });
    };

    const handleReset = (e: React.MouseEvent) => {
        e.stopPropagation();
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale > 1) {
            setIsDragging(true);
            dragStartRef.current = {
                x: e.clientX - position.x,
                y: e.clientY - position.y
            };
            e.preventDefault();
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            setPosition({
                x: e.clientX - dragStartRef.current.x,
                y: e.clientY - dragStartRef.current.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (scale > 1) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
        } else {
            setScale(2);
        }
    };

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden" role="dialog" aria-label="Fullscreen view">
             {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <svg className="w-12 h-12 text-white/50 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
            
            <div 
                className="w-full h-full flex items-center justify-center p-2 md:p-8"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <img 
                    src={resolvedUrl} 
                    alt={alt} 
                    draggable={false}
                    onMouseDown={handleMouseDown}
                    onDoubleClick={handleDoubleClick}
                    onClick={(e) => e.stopPropagation()}
                    className={`max-w-full max-h-[85vh] md:max-h-[90vh] object-contain shadow-2xl rounded-lg transition-transform ease-out select-none ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                        transition: isDragging ? 'none' : 'transform 0.2s ease-out, opacity 0.3s ease'
                    }}
                    onLoad={() => setIsLoaded(true)}
                />
            </div>

            <div 
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[130] flex items-center gap-4 bg-gray-900/80 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10 shadow-xl" 
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={handleZoomOut} 
                    className="text-white hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-white transition-colors p-1" 
                    disabled={scale <= 1}
                    aria-label="Zoom out"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <span className="text-white font-mono text-sm min-w-[3ch] text-center select-none" aria-live="polite">Zoom: {Math.round(scale * 100)}%</span>
                <button 
                    onClick={handleZoomIn} 
                    className="text-white hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-white transition-colors p-1" 
                    disabled={scale >= 4}
                    aria-label="Zoom in"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <div className="w-px h-4 bg-white/20 mx-1"></div>
                <button 
                    onClick={handleReset} 
                    className="text-white hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-white transition-colors text-xs font-medium uppercase tracking-wider" 
                    disabled={scale === 1}
                    aria-label="Reset zoom"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, project }) => {
    const { t } = useLanguage();
    const { isAdmin } = useAuth();
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showInfoOverlay, setShowInfoOverlay] = useState(true);
    const [showCopyFeedback, setShowCopyFeedback] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    
    // Project editable state
    const [projectImages, setProjectImages] = useState<ProjectImage[]>(project.images || []);
    const [editedCoverImage, setEditedCoverImage] = useState<string>(project.coverImage);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

    const [editedProject, setEditedProject] = useState({
        title: '',
        description: '',
        client: '',
        projectType: '',
        tools: ''
    });
    const modalContentRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
    const touchEndY = useRef<number | null>(null);
    const isSwiping = useRef(false);
    const minSwipeDistance = 50;

    const currentImage = projectImages[currentSlideIndex] || { url: project.coverImage, caption: project.title };
    const isCurrentVideo = isVideoUrl(currentImage.url, currentImage.type);
    const currentFormat = getMediaFormat(currentImage.url, currentImage.type);

    // Technical media metadata
    const technicalData = useMemo(() => {
        if (isCurrentVideo) {
            return {
                resolution: "1920 x 1080 (Full HD / 60fps)",
                format: `${currentFormat} / H.264 Video Stream`,
                colorSpace: "Rec.709 (BT.709)",
                bitDepth: "8-bit Progressive",
                fileSize: "Progressive Web Stream"
            };
        }

        const resolutions = ["3840 x 2160 (4K)", "2560 x 1440 (2K)", "1920 x 1080 (HD)"];
        const colorSpaces = ["sRGB", "Display P3", "Adobe RGB (1998)"];
        const depths = ["8-bit", "16-bit", "32-bit"];
        
        return {
            resolution: currentFormat === 'SVG' ? "Vector (Scalable)" : resolutions[Math.floor(Math.random() * resolutions.length)],
            format: getFormatDescription(currentFormat),
            colorSpace: colorSpaces[Math.floor(Math.random() * colorSpaces.length)],
            bitDepth: currentFormat === 'SVG' ? "Vector Mathematical" : depths[Math.floor(Math.random() * depths.length)],
            fileSize: (0.8 + Math.random() * 4).toFixed(1) + " MB"
        };
    }, [currentSlideIndex, project.id, isCurrentVideo, currentFormat]);

    useEffect(() => {
        setProjectImages(project.images || []);
        setEditedCoverImage(project.coverImage);
        setEditedProject({
            title: project.title,
            description: project.description,
            client: project.client || '',
            projectType: project.projectType || '',
            tools: project.tools?.join(', ') || ''
        });
    }, [project, isEditMode]);

    const handleAddMedia = (newMedia: AddedMediaResult) => {
        if (replacingIndex !== null) {
            setProjectImages(prev => {
                const next = [...prev];
                next[replacingIndex] = {
                    url: newMedia.url,
                    caption: newMedia.caption,
                    type: newMedia.type,
                    title: newMedia.title
                };
                return next;
            });
            setReplacingIndex(null);
        } else {
            setProjectImages(prev => {
                const next = [
                    ...prev,
                    {
                        url: newMedia.url,
                        caption: newMedia.caption,
                        type: newMedia.type,
                        title: newMedia.title
                    }
                ];
                setCurrentSlideIndex(next.length - 1);
                return next;
            });
        }
    };

    const moveMedia = (index: number, direction: -1 | 1) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= projectImages.length) return;
        setProjectImages(prev => {
            const next = [...prev];
            const temp = next[index];
            next[index] = next[targetIndex];
            next[targetIndex] = temp;
            return next;
        });
        setCurrentSlideIndex(targetIndex);
    };

    const removeMedia = (index: number) => {
        if (projectImages.length <= 1) {
            alert('A project must have at least one media item.');
            return;
        }
        setProjectImages(prev => prev.filter((_, i) => i !== index));
        setCurrentSlideIndex(prev => Math.max(0, Math.min(prev, projectImages.length - 2)));
    };

    const handleSetCover = (url: string) => {
        setEditedCoverImage(url);
    };

    const handleReplaceMedia = (index: number) => {
        setReplacingIndex(index);
        setIsUploadModalOpen(true);
    };

    const handleSaveEdits = async () => {
        const newData = {
            ...editedProject,
            tools: editedProject.tools.split(',').map(t => t.trim()).filter(Boolean),
            images: projectImages,
            coverImage: editedCoverImage
        };
        const dataStr = JSON.stringify(newData);
        localStorage.setItem(`project-data-${project.id}`, dataStr);
        localStorage.setItem(`project-cover-${project.id}`, editedCoverImage);
        try {
            await setDoc(doc(db, 'site_data', `project-data-${project.id}`), { value: dataStr });
            await setDoc(doc(db, 'site_data', `project-cover-${project.id}`), { value: editedCoverImage });
        } catch(e) {
            console.error("Failed to save to firestore", e);
        }
        window.dispatchEvent(new CustomEvent('project-updated'));
        window.dispatchEvent(new CustomEvent('image-updated'));
        setIsEditMode(false);
    };

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                setIsVisible(true);
                setCurrentSlideIndex(0);
                setIsFullscreen(false);
                setShowCopyFeedback(false);
                modalContentRef.current?.focus();
            }, 10);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleFullscreenClose = () => {
        setIsFullscreen(false);
    };

    const nextSlide = () => {
        setCurrentSlideIndex((prevIndex) => 
            prevIndex === projectImages.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setCurrentSlideIndex((prevIndex) => 
            prevIndex === 0 ? projectImages.length - 1 : prevIndex - 1
        );
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const handleShare = async () => {
        const shareData = {
            title: `Jaakko Kallio - ${project.title}`,
            text: project.description,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                setShowCopyFeedback(true);
                setTimeout(() => setShowCopyFeedback(false), 2000);
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key.toLowerCase() === 'i') {
                if (isFullscreen) {
                    e.preventDefault();
                    setShowInfoOverlay(prev => !prev);
                    return;
                }
            }

            if (isFullscreen) {
                if (e.key === 'Escape') {
                    handleFullscreenClose();
                } else if (e.key === 'ArrowRight') {
                    nextSlide();
                } else if (e.key === 'ArrowLeft') {
                    prevSlide();
                }
                return;
            }

            if (e.key === 'Escape') {
                handleClose();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'Tab') {
                if (!modalContentRef.current) return;
                
                const focusableElements = modalContentRef.current.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement?.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement?.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isFullscreen, projectImages.length]);

    // Touch handlers for carousel swipe
    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchStartY.current = e.targetTouches[0].clientY;
        touchEndX.current = null;
        touchEndY.current = null;
        isSwiping.current = false;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
        touchEndY.current = e.targetTouches[0].clientY;
        
        if (touchStartX.current !== null && touchEndX.current !== null) {
            const diffX = Math.abs(touchStartX.current - touchEndX.current);
            const diffY = Math.abs((touchStartY.current || 0) - (touchEndY.current || 0));
            
            if (diffX > diffY && diffX > 10) {
                isSwiping.current = true;
            }
        }
    };

    const onTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current || !isSwiping.current) return;
        
        const distance = touchStartX.current - touchEndX.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            nextSlide();
        } else if (isRightSwipe) {
            prevSlide();
        }

        touchStartX.current = null;
        touchStartY.current = null;
        touchEndX.current = null;
        touchEndY.current = null;
        isSwiping.current = false;
    };

    const swipeHandlers = {
        onTouchStart,
        onTouchMove,
        onTouchEnd,
    };

    if (!isOpen) return null;

    return (
        <div 
            className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            role="presentation"
        >
            <div 
                ref={modalContentRef}
                className={`relative w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl overflow-y-auto overflow-x-hidden transition-all duration-300 ease-out p-4 sm:p-6 md:p-8 border border-gray-100 dark:border-gray-800 ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-project-title"
                tabIndex={-1}
            >
                <div className="flex items-center justify-between pb-4 sm:pb-6 mb-4 sm:mb-6 border-b border-gray-100 dark:border-gray-800 gap-2">
                    <div className="flex-1 min-w-0 pr-2">
                        {isEditMode ? (
                            <input
                                type="text"
                                value={editedProject.title}
                                onChange={(e) => setEditedProject({ ...editedProject, title: e.target.value })}
                                className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-b border-indigo-500 w-full focus:outline-none"
                                placeholder="Project Title"
                            />
                        ) : (
                            <h3 id="modal-project-title" className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">
                                {project.title}
                            </h3>
                        )}
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        {isAdmin && (
                            isEditMode ? (
                                <button
                                    onClick={handleSaveEdits}
                                    className="p-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-colors flex items-center gap-1 text-xs px-3 shadow"
                                    title="Save project"
                                >
                                    <Check className="w-4 h-4" />
                                    <span className="font-semibold">Save</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsEditMode(true)}
                                    className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    title="Edit project & media"
                                >
                                    <Edit3 className="w-5 h-5" />
                                </button>
                            )
                        )}
                        <div className="relative">
                            <button 
                                onClick={handleShare}
                                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                aria-label={t.projectModal.share}
                                title={t.projectModal.share}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            </button>
                            {showCopyFeedback && (
                                <div className="absolute right-0 top-full mt-1 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap animate-fade-in z-20">
                                    Link copied!
                                </div>
                            )}
                        </div>
                        <button 
                            ref={closeButtonRef}
                            onClick={handleClose}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label={t.projectModal.close}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Media Manager Section in Edit Mode */}
                {isEditMode && (
                    <div className="mb-6 p-4 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Film className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                    {t.projectModal.manageMedia} ({projectImages.length})
                                </h4>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setReplacingIndex(null);
                                    setIsUploadModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>{t.projectModal.addMedia}</span>
                            </button>
                        </div>

                        {/* Media Thumbnails Strip */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {projectImages.map((media, idx) => {
                                const isMediaVideo = isVideoUrl(media.url, media.type);
                                const isCover = editedCoverImage === media.url;
                                const isSelected = idx === currentSlideIndex;

                                return (
                                    <div 
                                        key={idx}
                                        className={`relative rounded-xl border overflow-hidden p-2 transition-all flex flex-col gap-2 ${
                                            isSelected 
                                                ? 'border-indigo-500 bg-white dark:bg-gray-800 shadow-md ring-2 ring-indigo-500/20' 
                                                : 'border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/40'
                                        }`}
                                    >
                                        {/* Thumbnail View */}
                                        <div 
                                            className="aspect-video bg-black rounded-lg overflow-hidden relative cursor-pointer group"
                                            onClick={() => setCurrentSlideIndex(idx)}
                                        >
                                            {isMediaVideo ? (
                                                <video src={media.url} className="w-full h-full object-cover" muted />
                                            ) : (
                                                <img src={media.url} alt={media.caption || ''} className="w-full h-full object-cover" />
                                            )}
                                            
                                            <div className="absolute top-1 left-1 flex items-center gap-1">
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/70 text-white">
                                                    #{idx + 1}
                                                </span>
                                                {(() => {
                                                    const fmt = getMediaFormat(media.url, media.type);
                                                    let badgeClass = "bg-gray-700 text-white";
                                                    if (fmt === 'MP4') badgeClass = "bg-indigo-600 text-white";
                                                    else if (fmt === 'GIF') badgeClass = "bg-fuchsia-600 text-white";
                                                    else if (fmt === 'PNG') badgeClass = "bg-emerald-600 text-white";
                                                    else if (fmt === 'SVG') badgeClass = "bg-amber-600 text-white";
                                                    else if (fmt === 'JPG') badgeClass = "bg-blue-600 text-white";
                                                    else if (fmt === 'WEBP') badgeClass = "bg-purple-600 text-white";
                                                    else if (fmt === 'AVIF') badgeClass = "bg-teal-600 text-white";
                                                    
                                                    return (
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shadow-sm ${badgeClass}`}>
                                                            {fmt}
                                                        </span>
                                                    );
                                                })()}
                                                {isCover && (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-white">
                                                        {t.projectModal.coverBadge}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Caption input on thumbnail */}
                                        <input
                                            type="text"
                                            value={media.caption || ''}
                                            onChange={(e) => {
                                                const newCaption = e.target.value;
                                                setProjectImages(prev => {
                                                    const next = [...prev];
                                                    next[idx] = { ...next[idx], caption: newCaption };
                                                    return next;
                                                });
                                            }}
                                            placeholder="Caption..."
                                            className="text-[11px] px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:border-indigo-500 truncate"
                                        />

                                        {/* Action buttons */}
                                        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-700/50">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    disabled={idx === 0}
                                                    onClick={() => moveMedia(idx, -1)}
                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                                                    title="Move left"
                                                >
                                                    <ArrowLeft className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={idx === projectImages.length - 1}
                                                    onClick={() => moveMedia(idx, 1)}
                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                                                    title="Move right"
                                                >
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetCover(media.url)}
                                                    className={`p-1 rounded ${isCover ? 'text-amber-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                    title={t.projectModal.setAsCover}
                                                >
                                                    <Star className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleReplaceMedia(idx)}
                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                                    title="Replace with .mp4 or image"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={projectImages.length <= 1}
                                                    onClick={() => removeMedia(idx)}
                                                    className="p-1 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 rounded disabled:opacity-30"
                                                    title={t.projectModal.deleteMedia}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                {/* Carousel Region */}
                <div 
                    id="project-carousel" 
                    className="relative mb-8 focus:outline-none" 
                    {...swipeHandlers}
                    role="region"
                    aria-roledescription="carousel"
                    aria-label="Project images and videos"
                    tabIndex={0}
                >
                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                         {projectImages.length > 0 ? (
                            <div 
                                key={currentSlideIndex}
                                className="w-full h-full animate-fade-in" 
                                role="group" 
                                aria-roledescription="slide" 
                                aria-label={`${currentSlideIndex + 1} of ${projectImages.length}`}
                            >
                                <CarouselMedia 
                                    item={currentImage}
                                    storageKey={`project-image-${project.id}-${currentSlideIndex}`}
                                    alt={currentImage.caption || `Project media ${currentSlideIndex + 1}`} 
                                    onClick={toggleFullscreen}
                                    isActive={true}
                                />
                            </div>
                         ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-400">No media available</div>
                         )}

                         {projectImages.length > 1 && (
                             <>
                                <button 
                                    onClick={prevSlide}
                                    className="absolute top-1/2 left-4 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-900 text-gray-800 dark:text-white shadow-md backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 opacity-0 group-hover:opacity-100 md:opacity-100 z-10"
                                    aria-label="Previous slide"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button 
                                    onClick={nextSlide}
                                    className="absolute top-1/2 right-4 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-900 text-gray-800 dark:text-white shadow-md backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 opacity-0 group-hover:opacity-100 md:opacity-100 z-10"
                                    aria-label="Next slide"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </button>
                             </>
                         )}

                         {projectImages.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10" role="tablist">
                                {projectImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        role="tab"
                                        aria-selected={idx === currentSlideIndex}
                                        onClick={(e) => { e.stopPropagation(); setCurrentSlideIndex(idx); }}
                                        className={`h-2 rounded-full transition-all shadow-sm ${idx === currentSlideIndex ? 'bg-white w-5' : 'bg-white/50 hover:bg-white/80 w-2'}`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                         )}
                    </div>
                    {currentImage?.caption && (
                        <p 
                            key={`caption-${currentSlideIndex}`}
                            className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2 italic animate-fade-in" 
                            aria-live="polite"
                        >
                            {currentImage.caption}
                        </p>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                         <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">About this project</h4>
                         {isEditMode ? (
                             <textarea
                                 value={editedProject.description}
                                 onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                                 className="w-full h-48 text-gray-600 dark:text-gray-300 leading-relaxed bg-transparent border border-indigo-200 dark:border-indigo-700 rounded-md p-2 focus:outline-none focus:border-indigo-500 resize-y"
                             />
                         ) : (
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                {project.description}
                            </p>
                         )}
                    </div>
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Project Cover (.mp4 / image)</h4>
                            <div className="relative rounded-lg overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                                <EditableImage 
                                    storageKey={`project-cover-${project.id}`}
                                    defaultSrc={editedCoverImage}
                                    alt="Project Cover"
                                    clickToUpload={true}
                                    className="w-full h-32 object-cover"
                                    wrapperClassName="w-full h-full"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 italic">Click above to upload .mp4 or image from PC or URL.</p>
                        </div>

                        {(project.client || isEditMode) && (
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{t.projectModal.client}</h4>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        value={editedProject.client}
                                        onChange={(e) => setEditedProject({ ...editedProject, client: e.target.value })}
                                        className="w-full text-gray-800 dark:text-gray-200 font-medium bg-transparent border-b border-indigo-200 dark:border-indigo-700 focus:outline-none focus:border-indigo-500"
                                        placeholder="Client Name"
                                    />
                                ) : (
                                    <p className="text-gray-800 dark:text-gray-200 font-medium">{project.client}</p>
                                )}
                            </div>
                        )}
                        {(project.projectType || isEditMode) && (
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{t.projectModal.type}</h4>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        value={editedProject.projectType}
                                        onChange={(e) => setEditedProject({ ...editedProject, projectType: e.target.value })}
                                        className="w-full text-gray-800 dark:text-gray-200 font-medium bg-transparent border-b border-indigo-200 dark:border-indigo-700 focus:outline-none focus:border-indigo-500"
                                        placeholder="Project Type"
                                    />
                                ) : (
                                    <p className="text-gray-800 dark:text-gray-200 font-medium">{project.projectType}</p>
                                )}
                            </div>
                        )}
                        {((project.tools && project.tools.length > 0) || isEditMode) && (
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{t.projectModal.tools}</h4>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        value={editedProject.tools}
                                        onChange={(e) => setEditedProject({ ...editedProject, tools: e.target.value })}
                                        className="w-full text-sm text-gray-800 dark:text-gray-200 bg-transparent border-b border-indigo-200 dark:border-indigo-700 focus:outline-none focus:border-indigo-500"
                                        placeholder="Tools (comma separated)"
                                    />
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {project.tools?.map(tool => {
                                            const info = getToolInfo(tool);
                                            const Icon = info.icon;
                                            return (
                                                <div key={tool} className="group/tooltip relative inline-flex">
                                                    <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-md border border-indigo-100 dark:border-indigo-800/50 cursor-help flex items-center gap-1.5 transition-colors group-hover/tooltip:bg-indigo-100 dark:group-hover/tooltip:bg-indigo-900/50">
                                                        <Icon className="w-3.5 h-3.5 opacity-80" />
                                                        {tool}
                                                    </span>
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-gray-900 dark:bg-black text-white text-xs rounded-md py-1.5 px-2.5 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-10 shadow-lg pointer-events-none text-center leading-relaxed transform group-hover/tooltip:-translate-y-1">
                                                        {info.desc}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-gray-900 dark:border-t-black"></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Media Upload Modal */}
            {isUploadModalOpen && (
                <MediaUploadModal
                    isOpen={isUploadModalOpen}
                    onClose={() => {
                        setIsUploadModalOpen(false);
                        setReplacingIndex(null);
                    }}
                    onSave={handleAddMedia}
                    modalTitle={replacingIndex !== null ? `Replace Media #${replacingIndex + 1}` : "Add .mp4 Video or Image"}
                />
            )}

            {/* Fullscreen Media Viewer */}
            {isFullscreen && (
                <div 
                    className="fixed inset-0 z-[110] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-300"
                    onClick={handleFullscreenClose}
                >
                    <div className="absolute top-4 right-4 z-[120] flex items-center gap-3">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowInfoOverlay(prev => !prev); }}
                            className={`p-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white border shadow-xl ${showInfoOverlay ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/10 border-white/20 text-white/70 hover:text-white hover:bg-white/20'}`}
                            aria-label={showInfoOverlay ? "Hide media info" : "Show media info"}
                            title="Media metadata (Shortcut: I)"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        </button>
                        
                        <button 
                            onClick={handleFullscreenClose}
                            className="text-white/70 hover:text-white p-2.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label="Exit fullscreen"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    <FullscreenMedia item={currentImage} alt={currentImage.caption || ''} />

                    {projectImages.length > 1 && (
                         <>
                            <button 
                                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-[120] focus:outline-none focus:ring-2 focus:ring-white"
                                aria-label="Previous slide"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-[120] focus:outline-none focus:ring-2 focus:ring-white"
                                aria-label="Next slide"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                         </>
                    )}
                    
                    {/* Information Overlay */}
                    {showInfoOverlay && (
                        <div 
                            className="absolute bottom-24 sm:bottom-12 left-0 right-0 px-4 md:px-12 flex justify-center pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-500"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-black/75 backdrop-blur-2xl border border-white/10 p-6 rounded-2xl shadow-2xl max-w-2xl w-full pointer-events-auto flex flex-col sm:flex-row gap-8 transition-colors duration-300">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                                        <h5 className="text-white/50 text-[10px] uppercase font-bold tracking-widest">
                                            {isCurrentVideo ? "Video Metadata" : "Media Metadata"}
                                        </h5>
                                    </div>
                                    <p className="text-white text-base font-light leading-relaxed">
                                        {currentImage?.caption || project.title}
                                    </p>
                                    <div className="mt-4 flex gap-4 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                                        <span>© 2025 JAAKKO</span>
                                        <span>•</span>
                                        <span>ID: {project.id.padStart(4, '0')}</span>
                                        {isCurrentVideo && (
                                            <>
                                                <span>•</span>
                                                <span className="text-indigo-400">MP4 VIDEO</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:w-72 border-t sm:border-t-0 sm:border-l border-white/10 pt-5 sm:pt-0 sm:pl-8 shrink-0">
                                    <div className="group/meta">
                                        <h5 className="text-white/40 text-[9px] uppercase font-black tracking-widest mb-1 group-hover/meta:text-indigo-400 transition-colors">Dimensions</h5>
                                        <p className="text-white/90 text-xs font-mono">{technicalData.resolution}</p>
                                    </div>
                                    <div className="group/meta">
                                        <h5 className="text-white/40 text-[9px] uppercase font-black tracking-widest mb-1 group-hover/meta:text-indigo-400 transition-colors">Color / Codec</h5>
                                        <p className="text-white/90 text-xs font-mono">{technicalData.colorSpace}</p>
                                    </div>
                                    <div className="group/meta">
                                        <h5 className="text-white/40 text-[9px] uppercase font-black tracking-widest mb-1 group-hover/meta:text-indigo-400 transition-colors">Encoding</h5>
                                        <p className="text-white/90 text-xs font-mono">{technicalData.bitDepth}</p>
                                    </div>
                                    <div className="group/meta">
                                        <h5 className="text-white/40 text-[9px] uppercase font-black tracking-widest mb-1 group-hover/meta:text-indigo-400 transition-colors">Stream Payload</h5>
                                        <p className="text-indigo-300 text-xs font-mono">{technicalData.fileSize}</p>
                                    </div>
                                    <div className="col-span-2 mt-1">
                                        <div className="h-[1px] w-full bg-white/5"></div>
                                        <p className="text-white/20 text-[8px] uppercase tracking-tighter mt-2">Format: {technicalData.format}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!showInfoOverlay && currentImage?.caption && (
                        <div className="absolute bottom-24 sm:bottom-12 left-0 right-0 text-center text-white/80 text-lg font-light tracking-wide px-4 pointer-events-none animate-in fade-in duration-500" aria-live="polite">
                            {currentImage.caption}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProjectModal;
