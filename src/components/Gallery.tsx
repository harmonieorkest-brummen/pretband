import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { galleryImages } from "../data/galleryData";
import { Decoration } from "./ui/atoms/Decoration";
import { Heading } from "./ui/atoms/Heading";

export function Gallery() {
	const { t } = useTranslation();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const openLightbox = (index: number) => setSelectedIndex(index);
	const closeLightbox = useCallback(() => setSelectedIndex(null), []);

	const showNext = useCallback(() => {
		if (selectedIndex === null) return;
		setSelectedIndex((selectedIndex + 1) % galleryImages.length);
	}, [selectedIndex]);

	const showPrev = useCallback(() => {
		if (selectedIndex === null) return;
		setSelectedIndex(
			(selectedIndex - 1 + galleryImages.length) % galleryImages.length,
		);
	}, [selectedIndex]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (selectedIndex === null) return;
			if (e.key === "Escape") closeLightbox();
			if (e.key === "ArrowRight") showNext();
			if (e.key === "ArrowLeft") showPrev();
		};
		window.addEventListener("keydown", handleKeyDown);
		if (selectedIndex !== null) {
			document.body.style.overflow = "hidden";
			document.documentElement.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
			document.documentElement.style.overflow = "auto";
		}
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "auto";
			document.documentElement.style.overflow = "auto";
		};
	}, [selectedIndex, showNext, showPrev, closeLightbox]);

	return (
		<section id="gallery" className="relative z-10 overflow-hidden py-32">
			<div className="pointer-events-none absolute inset-0">
				<Decoration
					type="star"
					color="yellow"
					animation="spin"
					className="absolute top-10 right-[15%] opacity-10"
					size={80}
				/>
				<Decoration
					type="zap"
					color="red"
					animation="pulse"
					className="absolute bottom-10 left-[10%] opacity-10"
					size={120}
				/>
			</div>

			<div className="mx-auto max-w-7xl px-6">
				<div className="mb-20 text-center">
					<Heading
						level={2}
						variant="white"
						className="mb-6 text-6xl md:text-8xl"
					>
						{t("gallery.title")}
					</Heading>
					<p className="mx-auto max-w-2xl font-body text-md text-white/70 md:text-2xl">
						{t("gallery.description")}
					</p>
				</div>

				<div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
					{galleryImages.map((src, index) => (
						<button
							key={src}
							type="button"
							onClick={() => openLightbox(index)}
							className={`group relative mb-6 block w-full cursor-zoom-in break-inside-avoid overflow-hidden rounded-3xl border-4 border-white/10 bg-pret-dark transition-all duration-500 hover:z-20 hover:scale-[1.02] hover:border-pret-yellow hover:shadow-2xl ${
								index % 3 === 0
									? "rotate-1"
									: index % 3 === 1
										? "-rotate-1"
										: "rotate-2"
							} hover:rotate-0 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-pret-yellow`}
						>
							<img
								src={src}
								alt={`Pretband Gallery ${index + 1}`}
								loading="lazy"
								className="h-auto w-full object-cover"
							/>
							<div className="absolute inset-0 flex items-center justify-center bg-pret-dark/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
								<ZoomIn className="h-12 w-12 animate-pulse text-pret-yellow" />
							</div>
						</button>
					))}
				</div>
			</div>

			{/* Lightbox Modal using Portal */}
			{selectedIndex !== null &&
				createPortal(
					<div className="fixed inset-0 z-[9999] flex animate-fade-in items-center justify-center bg-pret-dark/95 backdrop-blur-xl">
						{/* Overlay button to close */}
						<button
							type="button"
							className="absolute inset-0 cursor-zoom-out"
							onClick={closeLightbox}
							aria-label="Close lightbox"
						/>

						<button
							type="button"
							className="absolute top-8 right-8 z-510 rounded-full bg-white/10 p-4 text-white transition-colors hover:bg-white/20"
							onClick={closeLightbox}
						>
							<X className="h-8 w-8" />
						</button>

						<button
							type="button"
							className="absolute top-1/2 left-4 z-510 -translate-y-1/2 rounded-full bg-white/10 p-4 text-white transition-colors hover:bg-white/20 md:left-8"
							onClick={(e) => {
								e.stopPropagation();
								showPrev();
							}}
						>
							<ChevronLeft className="h-10 w-10" />
						</button>

						<button
							type="button"
							className="absolute top-1/2 right-4 z-510 -translate-y-1/2 rounded-full bg-white/10 p-4 text-white transition-colors hover:bg-white/20 md:right-8"
							onClick={(e) => {
								e.stopPropagation();
								showNext();
							}}
						>
							<ChevronRight className="h-10 w-10" />
						</button>

						<div className="relative z-510 flex max-h-screen flex-col items-center justify-center p-4 pt-32 md:p-8 md:pt-40">
							<div className="relative cursor-default overflow-hidden rounded-3xl border-4 border-white/20 shadow-2xl">
								<img
									src={galleryImages[selectedIndex]}
									alt="Gallery full view"
									className="h-auto max-h-[70vh] w-auto animate-scale-in object-contain md:max-h-[75vh]"
								/>
								<div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-center">
									<p className="font-display text-white text-xl uppercase tracking-widest">
										{selectedIndex + 1} / {galleryImages.length}
									</p>
								</div>
							</div>
						</div>
					</div>,
					document.body,
				)}
		</section>
	);
}
