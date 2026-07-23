import { FiMoon, FiSun } from "react-icons/fi";
import { useThemeStore } from "../utils/ThemeStore";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";
  const Icon = isDark ? FiSun : FiMoon;

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      onClick={toggleTheme}
    >
      <Icon aria-hidden="true" />
    </button>
  );
}