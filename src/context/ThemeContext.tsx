import React, { createContext, useContext, useEffect, useState } from 'react';
import { theme } from '../design-system/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    toggleTheme: () => void;
    theme: typeof theme;
    currentColors: typeof theme.colors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem('theme');
        return (saved as ThemeMode) || 'dark';
    });

    useEffect(() => {
        localStorage.setItem('theme', mode);
        document.body.style.backgroundColor = mode === 'dark' ? theme.colors.background : theme.lightColors.background;
        document.body.style.color = mode === 'dark' ? theme.colors.text : theme.lightColors.text;
    }, [mode]);

    const toggleTheme = () => {
        setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const currentColors = mode === 'dark' ? theme.colors : { ...theme.colors, ...theme.lightColors } as any;

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme, theme, currentColors }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
