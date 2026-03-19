import type React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
}

export function Input({ label, id, className = "", ...props }: InputProps) {
	const inputClasses =
		"w-full rounded-2xl bg-pret-dark/40 border border-white/15 px-6 py-4 text-xl font-body text-white placeholder:text-white/35 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-pret-yellow focus-visible:ring-offset-4 focus-visible:ring-offset-pret-dark transition";
	const labelClasses =
		"block font-display text-sm tracking-widest uppercase text-white/80 mb-3";

	return (
		<div>
			{label && id && (
				<label htmlFor={id} className={labelClasses}>
					{label}
				</label>
			)}
			<input id={id} className={`${inputClasses} ${className}`} {...props} />
		</div>
	);
}
