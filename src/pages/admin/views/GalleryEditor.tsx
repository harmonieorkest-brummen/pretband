import imageCompression from "browser-image-compression";
import { Image as ImageIcon, Trash, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/atoms/Button";
import { Heading } from "@/components/ui/atoms/Heading";
import { AdminTopBar } from "@/components/ui/molecules/AdminTopBar";
import { useToast } from "@/context/ToastContext";
import {
	AuthError,
	deleteGalleryImage,
	fetchGallery,
	uploadGalleryImage,
} from "@/utils/adminData";

interface GalleryEditorProps {
	onBack: () => void;
	onLogout: () => void;
}

export function GalleryEditor({ onBack, onLogout }: GalleryEditorProps) {
	const { t } = useTranslation();
	const { showToast } = useToast();
	const [images, setImages] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const token = localStorage.getItem("band_admin_token");

	const loadImages = async () => {
		try {
			setLoading(true);
			const urls = await fetchGallery();
			setImages(urls);
		} catch (err) {
			console.error(err);
			showToast(
				t("admin.gallery.load_error", "Failed to load gallery"),
				"error",
			);
		} finally {
			setLoading(false);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: We only want to run this on mount
	useEffect(() => {
		loadImages();
	}, []);

	const handleDelete = async (url: string) => {
		if (!token) return;
		if (
			!window.confirm(
				t(
					"admin.gallery.confirm_delete",
					"Are you sure you want to delete this image?",
				),
			)
		)
			return;

		try {
			await deleteGalleryImage(token, url);
			setImages(images.filter((img) => img !== url));
			showToast(t("admin.gallery.delete_success", "Image deleted"), "success");
		} catch (err) {
			if (err instanceof AuthError) {
				showToast(
					t(
						"admin.toasts.session_expired",
						"Session expired, please log in again",
					),
					"error",
				);
				onLogout();
			} else {
				showToast(
					t("admin.gallery.delete_error", "Failed to delete image"),
					"error",
				);
			}
		}
	};

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0 || !token) return;

		setUploading(true);

		try {
			for (let i = 0; i < files.length; i++) {
				const file = files[i];

				// Validate type
				const allowedTypes = [
					"image/jpeg",
					"image/png",
					"image/webp",
					"image/avif",
				];
				if (!allowedTypes.includes(file.type)) {
					showToast(
						t("admin.gallery.unsupported_type", "Unsupported file type: ") +
							file.type,
						"error",
					);
					continue;
				}

				// Optimize image
				const options = {
					maxSizeMB: 1,
					maxWidthOrHeight: 1920,
					useWebWorker: true,
				};

				showToast(t("admin.gallery.optimizing", "Optimizing image..."), "info");
				const compressedFile = await imageCompression(file, options);

				// Read as base64
				const base64Content = await new Promise<string>((resolve, reject) => {
					const reader = new FileReader();
					reader.readAsDataURL(compressedFile);
					reader.onloadend = () => {
						const result = reader.result as string;
						resolve(result.split(",")[1]);
					};
					reader.onerror = reject;
				});

				showToast(t("admin.gallery.uploading", "Uploading..."), "info");
				const { url } = await uploadGalleryImage(
					token,
					file.name,
					file.type,
					base64Content,
				);
				setImages((prev) => [url, ...prev]);
				showToast(
					t("admin.gallery.upload_success", "Image uploaded successfully"),
					"success",
				);
			}
		} catch (err) {
			console.error(err);
			if (err instanceof AuthError) {
				showToast(
					t(
						"admin.toasts.session_expired",
						"Session expired, please log in again",
					),
					"error",
				);
				onLogout();
			} else {
				showToast(
					t("admin.gallery.upload_error", "Failed to upload image"),
					"error",
				);
			}
		} finally {
			setUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	return (
		<div className="mx-auto min-h-screen max-w-6xl px-6 py-20">
			<AdminTopBar
				title={t("admin.gallery.title", "Gallery")}
				stat={t("admin.gallery.stat", { count: images.length })}
				onBack={onBack}
				onSave={() => {}}
				isSyncing={uploading}
				flash={false}
				hideSaveButton={true}
			/>

			<div className="mb-12 flex flex-col items-center justify-center rounded-[2rem] border border-white/20 border-dashed bg-black/20 p-12 text-center transition-colors hover:border-pret-yellow/50 hover:bg-black/40">
				<input
					type="file"
					accept="image/png, image/jpeg, image/webp, image/avif"
					multiple
					className="hidden"
					ref={fileInputRef}
					onChange={handleFileSelect}
					disabled={uploading}
				/>
				<div className="mb-6 rounded-full bg-pret-red/20 p-4 text-pret-red">
					<Upload size={32} />
				</div>
				<Heading level={3} className="mb-2">
					{t("admin.gallery.upload_title", "Upload Images")}
				</Heading>
				<p className="mb-6 text-white/60">
					{t(
						"admin.gallery.upload_desc",
						"Drag & drop or select PNG, JPG, WEBP, or AVIF files. Images are automatically optimized.",
					)}
				</p>
				<Button
					onClick={() => fileInputRef.current?.click()}
					disabled={uploading}
					className="px-8"
				>
					{uploading
						? t("admin.gallery.uploading_btn", "Uploading...")
						: t("admin.gallery.select_files", "Select Files")}
				</Button>
			</div>

			{loading ? (
				<div className="flex justify-center p-12">
					<div className="h-8 w-8 animate-spin rounded-full border-pret-yellow border-t-2 border-b-2" />
				</div>
			) : (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{images.map((url) => (
						<div
							key={url}
							className="group relative aspect-square overflow-hidden rounded-xl bg-black/40"
						>
							<img
								src={url}
								alt="Gallery item"
								className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
							/>
							<div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
								<button
									type="button"
									onClick={() => handleDelete(url)}
									className="rounded-full bg-pret-red p-3 text-white transition-transform hover:scale-110"
									title={t("admin.gallery.delete", "Delete Image")}
								>
									<Trash size={20} />
								</button>
							</div>
						</div>
					))}
					{images.length === 0 && (
						<div className="col-span-full flex flex-col items-center justify-center p-12 text-white/40">
							<ImageIcon size={48} className="mb-4 opacity-50" />
							<p>{t("admin.gallery.empty", "No images in the gallery yet.")}</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
