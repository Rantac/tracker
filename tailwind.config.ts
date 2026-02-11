import type { Config } from "tailwindcss";
import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                "primary": "#13ec5b",
                "background-light": "#f6f8f6",
                "background-dark": "#102216",
                "surface-dark": "#1a3322", // A slightly lighter shade for cards
                "surface-darker": "#0d1b11",
                "surface-card": "#1c3826", // Validated from admin design
            },
            fontFamily: {
                "display": ["var(--font-manrope)", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "2xl": "1rem",
                "3xl": "1.5rem",
                "full": "9999px"
            },
            boxShadow: {
                'neon': '0 0 10px rgba(19, 236, 91, 0.3)',
            }
        },
    },
    plugins: [
        forms,
        containerQueries,
    ],
};
export default config;
