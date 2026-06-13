"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";

export function LanguageToggle() {
  const { locale, setLocale, dictionary } = useLanguage();
  const nextLocale = locale === "vi" ? "en" : "vi";
  const nextLabel = nextLocale === "vi" ? dictionary.common.vietnamese : dictionary.common.english;

  return (
    <Button
      variant="outline"
      size="sm"
      type="button"
      onClick={() => setLocale(nextLocale)}
      aria-label={`${dictionary.common.language}: ${nextLabel}`}
      title={`${dictionary.common.language}: ${nextLabel}`}
    >
      <Languages className="h-4 w-4 sm:mr-2" aria-hidden="true" />
      <span className="hidden sm:inline">{locale.toUpperCase()}</span>
    </Button>
  );
}
