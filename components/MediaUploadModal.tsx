import React, { useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
    saveLocalMediaFile, 
    isVideoUrl, 
    isGifUrl,
    isSvgUrl,
    getMediaFormat,
    getFormatDescription,
    formatFileSize, 
    SAMPLE_MEDIA_PRESETS 
} from '../utils/mediaUtils';
import { 
    Upload, 
    Link as LinkIcon, 
    Film, 
    Image as ImageIcon, 
    X, 
    Check, 
    Play, 
    Sparkles, 
    FileImage, 
    FileVideo, 
    AlertCircle 
} from 'lucide-react';

export interface AddedMediaResult {
    url: string;
    caption: string;
    type: 'image' | 'video';
    title?: string;
}

interface MediaUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (media: AddedMediaResult) => void;
    initialCaption?: string;
    modalTitle?: string;
}

export const MediaUploadModal: React.FC<MediaUploadModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialCaption = '',
    modalTitle
}) => {
    const { language } = useLanguage();
    const isFi = language === 'fi';

    const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
    const [mediaUrl, setMediaUrl] = useState('');
    const [caption, setCaption] = useState(initialCaption);
    const [title, setTitle] = useState('');
    
    // Upload state
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileSelect = (file: File) => {
        setErrorMessage(null);
        const isVideo = file.type.startsWith('video/') || isVideoUrl(file.name);
        const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|gif|webp|svg|avif|bmp|ico|tiff?)$/i.test(file.name);

        if (!isVideo && !isImage) {
            setErrorMessage(
                isFi 
                    ? 'Valitse tuettu kuva (JPG, GIF, PNG, WebP, SVG, AVIF) tai video (.mp4).' 
                    : 'Please select a supported picture (JPG, GIF, PNG, WebP, SVG, AVIF) or video (.mp4).'
            );
            return;
        }

        setUploadedFile(file);
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleApplySample = (sample: typeof SAMPLE_MEDIA_PRESETS[0]) => {
        setMediaUrl(sample.url);
        setTitle(sample.title);
        setCaption(sample.caption);
        setErrorMessage(null);
    };

    const handleConfirm = async () => {
        setErrorMessage(null);

        if (activeTab === 'upload') {
            if (!uploadedFile) {
                setErrorMessage(isFi ? 'Valitse ensin tiedosto tietokoneeltasi.' : 'Please choose a file from your computer.');
                return;
            }

            setIsProcessing(true);
            try {
                const result = await saveLocalMediaFile(uploadedFile);
                onSave({
                    url: result.url,
                    caption: caption.trim(),
                    type: result.type,
                    title: title.trim() || uploadedFile.name
                });
                onClose();
            } catch (err) {
                console.error('Failed to process uploaded file', err);
                setErrorMessage(isFi ? 'Tiedoston tallennus epäonnistui.' : 'Failed to save uploaded file.');
            } finally {
                setIsProcessing(false);
            }
        } else {
            // URL Tab
            const trimmedUrl = mediaUrl.trim();
            if (!trimmedUrl) {
                setErrorMessage(isFi ? 'Syötä toimiva URL-osoite.' : 'Please enter a valid URL.');
                return;
            }

            const isVideo = isVideoUrl(trimmedUrl);
            onSave({
                url: trimmedUrl,
                caption: caption.trim(),
                type: isVideo ? 'video' : 'image',
                title: title.trim()
            });
            onClose();
        }
    };

    const activePreviewIsVideo = activeTab === 'upload' 
        ? (uploadedFile?.type.startsWith('video/') || isVideoUrl(uploadedFile?.name))
        : isVideoUrl(mediaUrl);

    const activeFormat = activeTab === 'upload'
        ? (uploadedFile ? getMediaFormat(uploadedFile.name, uploadedFile.type) : '')
        : (mediaUrl ? getMediaFormat(mediaUrl) : '');

    const formatColor = (fmt: string) => {
        switch (fmt) {
            case 'GIF': return 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/70 dark:text-fuchsia-300 border-fuchsia-300 dark:border-fuchsia-800';
            case 'PNG': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
            case 'JPG': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 dark:border-blue-800';
            case 'SVG': return 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800';
            case 'WEBP': return 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-300 dark:border-purple-800';
            case 'AVIF': return 'bg-teal-100 text-teal-700 dark:bg-teal-950/70 dark:text-teal-300 border-teal-300 dark:border-teal-800';
            case 'MP4': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700';
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-900 border border-indigo-100 dark:border-gray-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-gray-900 dark:text-gray-100 flex flex-col max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 dark:from-indigo-400/20 dark:to-fuchsia-400/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <FileImage className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span>{modalTitle || (isFi ? 'Lisää kuva tai video' : 'Add Picture or Video')}</span>
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {isFi 
                                    ? 'Tukee kaikkia kuvaformaatteja (JPG, GIF, PNG, WebP, SVG, AVIF) ja .mp4-videoita' 
                                    : 'Supports all picture formats (JPG, GIF, PNG, WebP, SVG, AVIF) & .mp4 videos'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl my-4 text-xs font-semibold">
                    <button
                        type="button"
                        onClick={() => { setActiveTab('upload'); setErrorMessage(null); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all cursor-pointer ${
                            activeTab === 'upload' 
                                ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm font-bold' 
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <Upload className="w-3.5 h-3.5" />
                        {isFi ? 'Lataa tiedosto PC:ltä' : 'Upload File from PC'}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setActiveTab('url'); setErrorMessage(null); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all cursor-pointer ${
                            activeTab === 'url' 
                                ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm font-bold' 
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <LinkIcon className="w-3.5 h-3.5" />
                        {isFi ? 'Kuvan / videon URL-linkki' : 'Picture / Video URL'}
                    </button>
                </div>

                {/* Tab 1: Upload from PC */}
                {activeTab === 'upload' && (
                    <div className="space-y-4">
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                                isDragOver 
                                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 scale-[1.01]' 
                                    : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-gray-50/50 dark:bg-gray-800/40'
                            }`}
                        >
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/avif,image/bmp,image/x-icon,image/tiff,video/mp4,video/webm,video/ogg,video/quicktime,.jpg,.jpeg,.png,.gif,.webp,.svg,.avif,.bmp,.ico,.mp4,.webm,.mov" 
                                className="hidden"
                                onChange={handleInputChange}
                            />

                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                    {isFi ? 'Klikkaa tai raahaa kuva tai video tähän' : 'Click or drag & drop pictures or videos here'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {isFi 
                                        ? 'Valitse JPG, GIF, PNG, WebP, SVG, AVIF tai .MP4 -tiedosto' 
                                        : 'Choose any JPG, GIF, PNG, WebP, SVG, AVIF or .MP4 file'}
                                </p>

                                {/* Visual Format Pills */}
                                <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">JPG</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300">GIF</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">PNG</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">WebP</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">SVG</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">AVIF</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">MP4</span>
                                </div>
                            </div>
                        </div>

                        {/* Uploaded File Info Preview */}
                        {uploadedFile && previewUrl && (
                            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center gap-3 border border-gray-200 dark:border-gray-700">
                                <div className="w-16 h-14 bg-black/90 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative">
                                    {activePreviewIsVideo ? (
                                        <video src={previewUrl} className="w-full h-full object-cover" muted />
                                    ) : (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
                                            {uploadedFile.name}
                                        </p>
                                        <span className={`text-[10px] px-2 py-0.5 font-bold rounded-md border ${formatColor(activeFormat)}`}>
                                            {activeFormat === 'GIF' ? 'GIF ANIMATION' : `${activeFormat} FORMAT`}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                                        {formatFileSize(uploadedFile.size)} • {getFormatDescription(activeFormat)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 2: Add by URL */}
                {activeTab === 'url' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                {isFi ? 'Kuvan tai videon suora URL-osoite (JPG, GIF, PNG, WebP, SVG, MP4):' : 'Direct Picture or Video URL (JPG, GIF, PNG, WebP, SVG, MP4):'}
                            </label>
                            <input 
                                type="url"
                                placeholder="https://example.com/artwork.jpg (or .gif, .png, .mp4)"
                                value={mediaUrl}
                                onChange={(e) => {
                                    setMediaUrl(e.target.value);
                                    setErrorMessage(null);
                                }}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Quick Presets / Try Samples */}
                        <div className="space-y-2">
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                {isFi ? 'Kokeile eri formaatteja esimerkeillä:' : 'Try different formats with 1-click sample presets:'}
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {SAMPLE_MEDIA_PRESETS.map((sample) => (
                                    <button
                                        key={sample.title}
                                        type="button"
                                        onClick={() => handleApplySample(sample)}
                                        className="text-[11px] px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors flex items-center justify-between gap-1 cursor-pointer"
                                    >
                                        <span className="truncate">{sample.title}</span>
                                        <span className={`text-[9px] px-1 py-0.2 rounded font-bold shrink-0 ${formatColor(sample.format)}`}>
                                            {sample.format}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Live URL Preview */}
                        {mediaUrl.trim() && (
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-gray-500">Live Preview</span>
                                    <span className={`text-[10px] px-2 py-0.5 font-bold rounded-md border ${formatColor(activeFormat)}`}>
                                        {activeFormat === 'GIF' ? 'GIF ANIMATION' : `${activeFormat} MEDIA`}
                                    </span>
                                </div>
                                <div className="rounded-xl overflow-hidden bg-black/95 border border-gray-800 aspect-video relative flex items-center justify-center p-2">
                                    {activePreviewIsVideo ? (
                                        <video 
                                            src={mediaUrl} 
                                            controls 
                                            muted 
                                            playsInline 
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <img 
                                            src={mediaUrl} 
                                            alt="URL Preview" 
                                            className="w-full h-full object-contain" 
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Common Inputs: Caption & Title */}
                <div className="space-y-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                            {isFi ? 'Kuvateksti tai kuvaus (valinnainen):' : 'Caption or Description (Optional):'}
                        </label>
                        <input 
                            type="text"
                            placeholder={isFi ? 'Esim. Animaation esikatselu, brändikuva tai juliste' : 'e.g. Kinetic logo animation, branding poster, or editorial cover'}
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                    <div className="mt-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                    >
                        {isFi ? 'Peruuta' : 'Cancel'}
                    </button>
                    <button
                        type="button"
                        disabled={isProcessing}
                        onClick={handleConfirm}
                        className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                    >
                        {isProcessing ? (
                            <span className="animate-pulse">{isFi ? 'Käsitellään...' : 'Processing...'}</span>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                <span>{isFi ? 'Tallenna kuva / media' : 'Save Picture / Media'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MediaUploadModal;
