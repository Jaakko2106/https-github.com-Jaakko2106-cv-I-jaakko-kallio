import React, { useState, useEffect, useRef } from 'react';
import { isVideoUrl, resolveMediaUrl } from '../utils/mediaUtils';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, AlertCircle, Film } from 'lucide-react';

interface MediaViewerProps {
    src: string;
    alt?: string;
    type?: 'image' | 'video';
    className?: string;
    wrapperClassName?: string;
    onClick?: () => void;
    autoPlay?: boolean;
    loop?: boolean;
    muted?: boolean;
    showControls?: boolean;
    showBadge?: boolean;
    isActive?: boolean;
    onLoad?: () => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
    src,
    alt = '',
    type,
    className = '',
    wrapperClassName = '',
    onClick,
    autoPlay = true,
    loop = true,
    muted = true,
    showControls = true,
    showBadge = true,
    isActive = true,
    onLoad
}) => {
    const [resolvedUrl, setResolvedUrl] = useState<string>(src);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(muted);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState('0:00');
    const [duration, setDuration] = useState('0:00');
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const isVideo = isVideoUrl(src, type);

    useEffect(() => {
        let isMounted = true;
        setHasError(false);
        setIsLoaded(false);

        resolveMediaUrl(src).then((url) => {
            if (isMounted) {
                setResolvedUrl(url);
            }
        }).catch(() => {
            if (isMounted) {
                setResolvedUrl(src);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [src]);

    // Handle video playback synchronization with isActive slide in carousel
    useEffect(() => {
        if (!videoRef.current || !isVideo) return;

        if (isActive && autoPlay) {
            videoRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(() => {
                // Autoplay blocked without user gesture (expected for unmuted), keep muted
                setIsPlaying(false);
            });
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive, isVideo, autoPlay, resolvedUrl]);

    const formatTime = (timeInSeconds: number) => {
        if (isNaN(timeInSeconds)) return '0:00';
        const mins = Math.floor(timeInSeconds / 60);
        const secs = Math.floor(timeInSeconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const current = videoRef.current.currentTime;
        const total = videoRef.current.duration;
        if (total > 0) {
            setProgress((current / total) * 100);
            setCurrentTime(formatTime(current));
            setDuration(formatTime(total));
        }
    };

    const togglePlay = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const toggleMute = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!videoRef.current) return;
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = pos * videoRef.current.duration;
    };

    const handleVideoLoaded = () => {
        setIsLoaded(true);
        if (videoRef.current) {
            setDuration(formatTime(videoRef.current.duration));
        }
        onLoad?.();
    };

    if (hasError) {
        return (
            <div className={`relative flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-lg ${wrapperClassName}`}>
                <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
                <p className="text-xs text-center font-medium">Unable to load media</p>
                <span className="text-[10px] text-gray-400 mt-1 max-w-[200px] truncate">{src}</span>
            </div>
        );
    }

    if (isVideo) {
        return (
            <div 
                className={`relative group/video overflow-hidden rounded-lg bg-black flex items-center justify-center ${wrapperClassName}`}
                onClick={onClick}
            >
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 z-10 pointer-events-none">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                <video
                    ref={videoRef}
                    src={resolvedUrl}
                    loop={loop}
                    muted={isMuted}
                    playsInline
                    onLoadedData={handleVideoLoaded}
                    onTimeUpdate={handleTimeUpdate}
                    onError={() => setHasError(true)}
                    className={`w-full h-full object-contain ${className}`}
                />

                {/* MP4 Badge */}
                {showBadge && (
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-md text-[11px] font-bold text-white border border-white/20 shadow-md pointer-events-none">
                        <Film className="w-3.5 h-3.5 text-indigo-400" />
                        <span>MP4 VIDEO</span>
                    </div>
                )}

                {/* Video Playback Controls Overlay */}
                {showControls && (
                    <div 
                        className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover/video:opacity-100 transition-opacity duration-300 z-20 flex flex-col gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Progress Bar */}
                        <div 
                            className="w-full h-1.5 bg-white/20 hover:h-2 rounded-full cursor-pointer relative overflow-hidden transition-all"
                            onClick={handleSeek}
                        >
                            <div 
                                className="bg-indigo-500 h-full rounded-full relative"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Controls Bar */}
                        <div className="flex items-center justify-between text-white text-xs">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={togglePlay}
                                    className="p-1.5 hover:bg-white/20 rounded-md transition-colors focus:outline-none"
                                    title={isPlaying ? 'Pause' : 'Play'}
                                    aria-label={isPlaying ? 'Pause' : 'Play'}
                                >
                                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={toggleMute}
                                    className="p-1.5 hover:bg-white/20 rounded-md transition-colors focus:outline-none"
                                    title={isMuted ? 'Unmute' : 'Mute'}
                                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                                >
                                    {isMuted ? <VolumeX className="w-4 h-4 text-amber-300" /> : <Volume2 className="w-4 h-4" />}
                                </button>

                                <span className="text-[10px] text-gray-300 font-mono">
                                    {currentTime} / {duration}
                                </span>
                            </div>

                            {onClick && (
                                <button
                                    type="button"
                                    onClick={onClick}
                                    className="p-1.5 hover:bg-white/20 rounded-md transition-colors focus:outline-none"
                                    title="Fullscreen View"
                                    aria-label="Fullscreen View"
                                >
                                    <Maximize className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Standard Image
    return (
        <div 
            className={`relative overflow-hidden ${wrapperClassName}`}
            onClick={onClick}
        >
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 dark:bg-gray-800/50 z-10 pointer-events-none">
                    <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            <img
                src={resolvedUrl}
                alt={alt}
                onLoad={() => {
                    setIsLoaded(true);
                    onLoad?.();
                }}
                onError={() => setHasError(true)}
                className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
            />
        </div>
    );
};

export default MediaViewer;
