// Theme management
const THEME_KEY = 'preferred-theme';

const themes = {
    light: '',
    dark: 'dark-mode',
    gradient: 'gradient-dark-mode'
};

function getCurrentTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
}

function setTheme(theme) {
    // Remove all theme classes
    Object.values(themes).forEach(className => {
        if (className) document.body.classList.remove(className);
    });

    // Add new theme class if it's not light theme
    if (themes[theme]) {
        document.body.classList.add(themes[theme]);
    }

    // Store the preference
    localStorage.setItem(THEME_KEY, theme);

    // Update theme toggle button text/icon if needed
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = `Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`;
    }
}

// Initialize theme
function initializeTheme() {
    const savedTheme = getCurrentTheme();
    setTheme(savedTheme);
}

// Cycle through themes
function cycleTheme() {
    const currentTheme = getCurrentTheme();
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    const nextTheme = themeKeys[nextIndex];
    
    setTheme(nextTheme);
}

// Export functions
window.themeManager = {
    setTheme,
    getCurrentTheme,
    cycleTheme,
    initializeTheme
};

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    
    // Set up theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            cycleTheme();
        });
    }
});