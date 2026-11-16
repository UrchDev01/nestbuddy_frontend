"use client";

import { useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiImage, FiMaximize, FiX } from "react-icons/fi";
import { propertyImageUrl, trapDialogTab } from "@/utils/propertyPageUtils";

interface PropertyImage {
    id: number;
    image: string;
    is_primary: boolean;
    description: string;
    order: number;
}

interface PropertyImageGalleryProps {
    images: PropertyImage[];
    propertyTitle: string;
}

export default function PropertyImageGallery({ images, propertyTitle }: PropertyImageGalleryProps) {
    const sortedImages = useMemo(
        () => [...images].sort((first, second) => {
            if (first.is_primary !== second.is_primary) return first.is_primary ? -1 : 1;
            return first.order - second.order;
        }),
        [images],
    );
    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [failedImages, setFailedImages] = useState<number[]>([]);

    useEffect(() => {
        if (!lightboxOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setLightboxOpen(false);
            if (event.key === "ArrowLeft") move(-1);
            if (event.key === "ArrowRight") move(1);
        };
        document.addEventListener("keydown", onKeyDown);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
        };
    }, [lightboxOpen, sortedImages.length]);

    const move = (direction: number) => {
        if (sortedImages.length < 2) return;
        setActiveIndex((index) => (index + direction + sortedImages.length) % sortedImages.length);
    };

    const renderImage = (image: PropertyImage, className: string) => {
        const src = propertyImageUrl(image.image);
        if (!src || failedImages.includes(image.id)) {
            return (
                <div className={`flex items-center justify-center bg-[#eef6ff] text-[#7ea4cf] ${className}`}>
                    <FiImage aria-hidden="true" size={38} />
                    <span className="sr-only">Property image unavailable</span>
                </div>
            );
        }
        return (
            <img
                src={src}
                alt={image.description || propertyTitle}
                onError={() => setFailedImages((current) => current.includes(image.id) ? current : [...current, image.id])}
                className={`bg-[#eef6ff] ${className}`}
            />
        );
    };

    if (sortedImages.length === 0) {
        return (
            <div className="flex aspect-[16/8] min-h-56 items-center justify-center rounded-2xl border border-slate-200 bg-[#eef6ff] text-[#7ea4cf] sm:min-h-80">
                <div className="flex flex-col items-center gap-2">
                    <FiImage aria-hidden="true" size={40} />
                    <span className="text-sm font-medium">No property photos provided</span>
                </div>
            </div>
        );
    }

    const activeImage = sortedImages[activeIndex] ?? sortedImages[0];
    const secondaryImages = sortedImages.filter((_, index) => index !== activeIndex).slice(0, 4);
    const thumbnailLayout = sortedImages.length <= 2
        ? "grid-cols-1 grid-rows-1"
        : sortedImages.length === 3 ? "grid-cols-1 grid-rows-2" : "grid-cols-2 grid-rows-2";

    return (
        <>
            <section aria-label="Property photos" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="grid gap-2 sm:gap-3 lg:grid-cols-[1.7fr_1fr]">
                    <div
                        className="group relative aspect-[4/3] min-h-56 overflow-hidden bg-[#eef6ff] sm:aspect-[16/9] lg:aspect-[1.45/1]"
                        onTouchStart={(event) => { (event.currentTarget as HTMLDivElement).dataset.touchStart = String(event.touches[0]?.clientX ?? 0); }}
                        onTouchEnd={(event) => {
                            const start = Number((event.currentTarget as HTMLDivElement).dataset.touchStart ?? 0);
                            const delta = (event.changedTouches[0]?.clientX ?? start) - start;
                            if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1);
                        }}
                    >
                        {renderImage(activeImage, "h-full w-full object-cover")}
                        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-slate-950/60 to-transparent p-3 pt-12 sm:p-5">
                            <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700">
                                {activeIndex + 1} / {sortedImages.length} photos
                            </span>
                            <button
                                type="button"
                                onClick={() => setLightboxOpen(true)}
                                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white/95 px-3 text-sm font-semibold text-slate-700 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef]"
                                aria-label="View photos fullscreen"
                            >
                                <FiMaximize aria-hidden="true" /> <span className="hidden sm:inline">View photos</span>
                            </button>
                        </div>
                        {sortedImages.length > 1 && (
                            <>
                                <button type="button" onClick={() => move(-1)} aria-label="Previous property photo" className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-700 shadow transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef]">
                                    <FiChevronLeft size={22} />
                                </button>
                                <button type="button" onClick={() => move(1)} aria-label="Next property photo" className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-700 shadow transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef]">
                                    <FiChevronRight size={22} />
                                </button>
                            </>
                        )}
                    </div>

                    <div className={`hidden gap-2 sm:gap-3 lg:grid ${thumbnailLayout}`}>
                        {secondaryImages.map((image) => {
                            const index = sortedImages.findIndex((candidate) => candidate.id === image.id);
                            return (
                                <button
                                    type="button"
                                    key={image.id}
                                    onClick={() => setActiveIndex(index)}
                                    className={`relative min-h-28 overflow-hidden bg-[#eef6ff] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2879ef] ${index === activeIndex ? "ring-2 ring-inset ring-[#2879ef]" : ""}`}
                                    aria-label={`Show photo ${index + 1}`}
                                >
                                    {renderImage(image, "h-full w-full object-cover transition duration-200 hover:scale-[1.03]")}
                                </button>
                            );
                        })}
                        {sortedImages.length === 1 && <div className="rounded-r-xl bg-[#f5f9ff]" />}
                    </div>
                </div>
                {sortedImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto p-3 lg:hidden" aria-label="Choose a property photo">
                        {sortedImages.map((image, index) => (
                            <button
                                type="button"
                                key={image.id}
                                onClick={() => setActiveIndex(index)}
                                className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-[#eef6ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef] ${index === activeIndex ? "ring-2 ring-[#2879ef]" : "opacity-75"}`}
                                aria-label={`Show photo ${index + 1}`}
                                aria-current={index === activeIndex}
                            >
                                {renderImage(image, "h-full w-full object-cover")}
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {lightboxOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${propertyTitle} photo gallery`}
                    onKeyDown={trapDialogTab}
                    className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 p-3 text-white sm:p-6"
                    onMouseDown={(event) => { if (event.target === event.currentTarget) setLightboxOpen(false); }}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{activeIndex + 1} of {sortedImages.length}</p>
                        <button type="button" onClick={() => setLightboxOpen(false)} aria-label="Close photo gallery" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                            <FiX size={23} />
                        </button>
                    </div>
                    <div className="relative flex min-h-0 flex-1 items-center justify-center py-3">
                        {renderImage(activeImage, "max-h-full max-w-full object-contain")}
                        {sortedImages.length > 1 && (
                            <>
                                <button type="button" onClick={() => move(-1)} aria-label="Previous property photo" className="absolute left-0 grid h-11 w-11 place-items-center rounded-full bg-white/15 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-4"><FiChevronLeft size={24} /></button>
                                <button type="button" onClick={() => move(1)} aria-label="Next property photo" className="absolute right-0 grid h-11 w-11 place-items-center rounded-full bg-white/15 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-4"><FiChevronRight size={24} /></button>
                            </>
                        )}
                    </div>
                    <div className="flex gap-2 overflow-x-auto py-2">
                        {sortedImages.map((image, index) => (
                            <button type="button" key={image.id} onClick={() => setActiveIndex(index)} aria-label={`Show photo ${index + 1}`} className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-white/10 ${index === activeIndex ? "ring-2 ring-[#72aaff]" : "opacity-60 hover:opacity-100"}`}>
                                {renderImage(image, "h-full w-full object-cover")}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
