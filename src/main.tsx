import { createRoot } from "react-dom/client";
import App from "./App";
import { AnalyticsProvider } from "./analytics/AnalyticsContext";
import { GtmProvider } from "./analytics/GtmContext";
import { ErrorBoundary } from "./components/ui/molecules/ErrorBoundary";
import "./i18n";
import "./main.css";
import { StrictMode } from "react";
import { SecurityProvider } from "./security/SecurityContext";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
	<StrictMode>
		<ErrorBoundary>
			<AnalyticsProvider>
				<GtmProvider>
					<SecurityProvider>
						<App />
					</SecurityProvider>
				</GtmProvider>
			</AnalyticsProvider>
		</ErrorBoundary>
	</StrictMode>,
);
