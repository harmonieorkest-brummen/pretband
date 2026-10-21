import { Component, type ErrorInfo, type ReactNode } from "react";
import i18n from "../../../i18n";

interface Props {
	children?: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
	};

	public static getDerivedStateFromError(_: Error): State {
		return { hasError: true };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Uncaught error:", error, errorInfo);
	}

	public render() {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
						<h2 className="font-display text-pret-red mb-4 text-4xl uppercase">
							{i18n.t("errors.boundary_title")}
						</h2>
						<p className="font-body mb-8 text-xl text-white/70">
							{i18n.t("errors.boundary_body")}
						</p>
						<button
							type="button"
							onClick={() => window.location.reload()}
							className="font-display rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-sm tracking-widest uppercase transition-colors hover:bg-white/10"
						>
							{i18n.t("errors.boundary_button")}
						</button>
					</div>
				)
			);
		}

		return this.props.children;
	}
}
