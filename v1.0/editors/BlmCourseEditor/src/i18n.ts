import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    debug: false,
    lng: "en",
    fallbackLng: "en",
    ns: [
      "global",
      "export",
      "course-props",
      "content-editor",
      "question-editor",
      "properties",
      "domain",
      "template-editors",
      "shared",
      "templates",
      "structures",
      "utils",
    ],
    defaultNS: "global",
    fallbackNS: "global",
    saveMissing: false,
    react: {
      useSuspense: true,
    },
    backend: {
      loadPath: "./locales/{{lng}}/{{ns}}.json",
    },
  });
