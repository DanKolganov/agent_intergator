import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Проверяем сохраненную тему или системные настройки
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme as "light" | "dark");
    } else {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setTheme(systemTheme);
    }
  }, []);

  useEffect(() => {
    // Применяем тему к документу
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 bg-slate-200 dark:bg-slate-700 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30"
      aria-label="Переключить тему"
    >
      <div className="absolute inset-y-0 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 flex items-center justify-center"
           style={{ transform: theme === "dark" ? "translateX(28px)" : "translateX(0)" }}
      >
        {theme === "light" ? (
          <Sun size={12} className="text-yellow-500" />
        ) : (
          <Moon size={12} className="text-blue-500" />
        )}
      </div>
    </button>
  );
}
