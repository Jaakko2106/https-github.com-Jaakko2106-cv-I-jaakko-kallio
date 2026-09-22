import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSiteData } from '../src/hooks/useSiteData';
import { isVideoUrl, isGifUrl, resolveMediaUrl } from '../utils/mediaUtils';
import MediaUploadModal, { AddedMediaResult } from './MediaUploadModal';
import { Film, Sparkles } from 'lucide-react';

interface EditableImageProps {
    storageKey: string;
    defaultSrc: string;
    alt: string;
    className?: string;
    wrapperClassName?: string;
    onLoad?: () => void;
    clickToUpload?: boolean;
}

const EditableImage: React.FC<EditableImageProps> = ({ 
    storageKey, 
    defaultSrc, 
    alt, 
    className, 
    wrapperClassName,
    onLoad,
    clickToUpload = false
}) => {
    const { isAdmin } = useAuth();
    const [src, setSrc] = useSiteData(storageKey, defaultSrc);
    const [resolvedSrc, setResolvedSrc] = useState<string>(src);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isVideo = isVideoUrl(src);

    useEffect(() => {
        let isMounted = true;
        resolveMediaUrl(src).then((url) => {
            if (isMounted) setResolvedSrc(url);
        }).catch(() => {
            if (isMounted) setResolvedSrc(src);
        });
        return () => { isMounted = false; };
    }, [src]);

    const handleMediaSaved = async (media: AddedMediaResult) => {
        try {
            await setSrc(media.url);
            window.dispatchEvent(new CustomEvent('image-updated'));
            window.dispatchEvent(new CustomEvent('project-updated'));
        } catch (error) {
            console.error("Storage failed", error);
            alert("Failed to save media.");
        }
    };

    const triggerUpload = (e: React.MouseEvent) => {
        if (!isAdmin) return;
        e.stopPropagation();
        setIsModalOpen(true);
    };

    return (
        <>
            <div 
                className={`relative ${isAdmin ? 'group/edit' : ''} ${wrapperClassName || ''} ${clickToUpload && isAdmin ? 'cursor-pointer' : ''}`}
                onClick={clickToUpload && isAdmin ? triggerUpload : undefined}
            >
                {isVideo ? (
                    <video 
                        src={resolvedSrc} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className={className}
                        onLoadedData={onLoad}
                    />
                ) : (
                    <img 
                        src={resolvedSrc} 
                        alt={alt} 
                        className={className}
                        onLoad={onLoad} 
                    />
                )}

                {/* Video or GIF Badge indicator */}
                {isVideo ? (
                    <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-md text-[10px] font-bold text-white border border-white/20 pointer-events-none">
                        <Film className="w-3 h-3 text-indigo-400" />
                        <span>MP4</span>
                    </div>
                ) : isGifUrl(src) ? (
                    <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 bg-fuchsia-950/80 backdrop-blur-md rounded-md text-[10px] font-bold text-fuchsia-200 border border-fuchsia-400/40 pointer-events-none">
                        <Sparkles className="w-3 h-3 text-fuchsia-400" />
                        <span>GIF</span>
                    </div>
                ) : null}
                
                {isAdmin && (
                    <div 
                        onClick={triggerUpload}
                        className={`absolute top-2 right-2 p-2 bg-black/70 hover:bg-indigo-600 rounded-full text-white cursor-pointer transition-all z-30 backdrop-blur-sm shadow-md ${clickToUpload ? 'opacity-40 group-hover/edit:opacity-100' : 'opacity-0 group-hover/edit:opacity-100'}`}
                        title="Change Media (JPG, GIF, PNG, MP4...)"
                        role="button"
                        aria-label="Change media"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                    </div>
                )}
                
                {clickToUpload && isAdmin && (
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/edit:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm shadow">
                            Click to change (JPG, GIF, PNG, MP4)
                        </span>
                    </div>
                )}
            </div>

            {isAdmin && (
                <MediaUploadModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleMediaSaved}
                    modalTitle="Change Media (JPG, GIF, PNG, MP4...)"
                />
            )}
        </>
    );
};

export default EditableImage;
