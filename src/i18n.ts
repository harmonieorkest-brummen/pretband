import i18n, { type InitOptions } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import nl from "./locales/nl.json";

const options: InitOptions & { showSupportNotice: false } = {
	resources: {
		nl: { translation: nl },
		en: { translation: en },
	},
	fallbackLng: "nl",
	debug: false,
	showSupportNotice: false,
	interpolation: {
		escapeValue: false,
	},
};

i18n.use(LanguageDetector).use(initReactI18next).init(options);

export default i18n;
