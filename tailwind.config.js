/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Allow manual class toggling if needed
    theme: {
        extend: {
            colors: {
                background: 'var(--bg-primary)',
                surface: 'var(--bg-secondary)',
                'surface-hover': 'var(--bg-tertiary)',

                foreground: 'var(--text-primary)',
                'foreground-muted': 'var(--text-secondary)',
                'foreground-faint': 'var(--text-tertiary)',

                border: 'var(--border-color)',

                primary: 'var(--accent-primary)',
                'primary-hover': 'var(--accent-hover)',
                'primary-surface': 'var(--accent-surface)',
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
