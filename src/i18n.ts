import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import nl from "./locales/nl.json";

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			nl: { translation: nl },
			en: { translation: en },
		},
		fallbackLng: "nl",
		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;
