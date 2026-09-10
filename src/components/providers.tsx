"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toLatinNumerals } from "@/lib/utils";

export { toLatinNumerals };

export type TimezoneOption = "auto" | "Saudi" | "Egypt" | "Morocco" | "UTC";
export type TimeFormatOption = "12" | "24";
export type ThemeOption = "system" | "light" | "dark";

interface SettingsContextType {
  timezone: TimezoneOption;
  setTimezone: (tz: TimezoneOption) => void;
  timeFormat: TimeFormatOption;
  setTimeFormat: (fmt: TimeFormatOption) => void;
  theme: ThemeOption;
  setTheme: (t: ThemeOption) => void;
  formatTime: (dateInput: Date | string) => string;
  formatDate: (dateInput: Date | string) => string;
  formatHistoryDate: (dateInput: Date | string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5000,
          },
        },
      })
  );

  const [timezone, setTimezoneState] = useState<TimezoneOption>("auto");
  const [timeFormat, setTimeFormatState] = useState<TimeFormatOption>("24");
  const [theme, setThemeState] = useState<ThemeOption>("system");

  // Load from localStorage on mount
  useEffect(() => {
    const storedTimezone = localStorage.getItem("setting_timezone") as TimezoneOption;
    const storedTimeFormat = localStorage.getItem("setting_timeformat") as TimeFormatOption;
    const storedTheme = localStorage.getItem("setting_theme") as ThemeOption;

    if (storedTimezone) setTimezoneState(storedTimezone);
    if (storedTimeFormat) setTimeFormatState(storedTimeFormat);
    if (storedTheme) setThemeState(storedTheme);
  }, []);

  // Update theme class on html element
  useEffect(() => {
    const applyTheme = (t: ThemeOption) => {
      const root = window.document.documentElement;
      root.classList.remove("light");
      if (t === "light") {
        root.classList.add("light");
      } else if (t === "system") {
        const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
        if (systemPrefersLight) {
          root.classList.add("light");
        }
      }
    };
    applyTheme(theme);

    // Watch system changes if set to system
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
      const handler = () => applyTheme("system");
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  const setTimezone = (tz: TimezoneOption) => {
    setTimezoneState(tz);
    localStorage.setItem("setting_timezone", tz);
  };

  const setTimeFormat = (fmt: TimeFormatOption) => {
    setTimeFormatState(fmt);
    localStorage.setItem("setting_timeformat", fmt);
  };

  const setTheme = (t: ThemeOption) => {
    setThemeState(t);
    localStorage.setItem("setting_theme", t);
  };


  // Helper to resolve timezone name for toLocaleString/toLocaleTimeString options
  const getTimeZoneName = () => {
    if (timezone === "Saudi") return "Asia/Riyadh";
    if (timezone === "Egypt") return "Africa/Cairo";
    if (timezone === "Morocco") return "Africa/Casablanca";
    if (timezone === "UTC") return "UTC";
    return undefined; // auto uses local browser timezone
  };

  const formatTime = (dateInput: Date | string) => {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const formatted = d.toLocaleTimeString("ar-EG-u-nu-latn", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: timeFormat === "12",
      timeZone: getTimeZoneName(),
    });
    return toLatinNumerals(formatted);
  };

  const formatDate = (dateInput: Date | string) => {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const formatted = d.toLocaleDateString("ar-EG-u-nu-latn", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: getTimeZoneName(),
    });
    return toLatinNumerals(formatted);
  };

  const formatHistoryDate = (dateInput: Date | string) => {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const formatted = d.toLocaleDateString("ar-EG-u-nu-latn", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: getTimeZoneName(),
    });
    return toLatinNumerals(formatted);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsContext.Provider
        value={{
          timezone,
          setTimezone,
          timeFormat,
          setTimeFormat,
          theme,
          setTheme,
          formatTime,
          formatDate,
          formatHistoryDate,
        }}
      >
        {children}
      </SettingsContext.Provider>
    </QueryClientProvider>
  );
}
