import { useThemeStore } from '../store/themeStore'

function SunIcon() {
  return (
    <svg
      className="w-5 h-5 pointer-events-none"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      className="w-5 h-5 pointer-events-none"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  const btnClass = "flex items-center justify-center w-11 h-10.5 p-0 border-none bg-transparent text-text cursor-pointer transition-[background,color,transform] duration-150 hover:text-text-h hover:bg-accent-bg active:scale-96 aria-pressed:text-accent aria-pressed:bg-accent-bg focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-2 focus-visible:z-10"

  return (
    <div className="fixed top-4 right-4 z-50 inline-flex items-stretch rounded-xl border border-border bg-bg shadow-custom overflow-hidden" role="group" aria-label="Color theme">
      <button
        type="button"
        className={`${btnClass} border-r border-border`}
        aria-pressed={theme === 'light'}
        aria-label="Light mode"
        title="Light mode"
        onClick={() => setTheme('light')}
      >
        <SunIcon />
      </button>
      <button
        type="button"
        className={btnClass}
        aria-pressed={theme === 'dark'}
        aria-label="Dark mode"
        title="Dark mode"
        onClick={() => setTheme('dark')}
      >
        <MoonIcon />
      </button>
    </div>
  )
}

