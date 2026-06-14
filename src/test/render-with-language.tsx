import { render, type RenderOptions } from "@testing-library/react";
import { LanguageProvider } from "@/components/language-provider";
import type { ReactElement } from "react";

export function renderWithLanguage(ui: ReactElement, options?: RenderOptions) {
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: () => "en",
      setItem: () => undefined,
      removeItem: () => undefined,
      clear: () => undefined,
    },
    configurable: true,
  });

  return render(ui, {
    wrapper: ({ children }) => <LanguageProvider initialLocale="en">{children}</LanguageProvider>,
    ...options,
  });
}
