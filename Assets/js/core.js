/**
 * SAMRUDH WEBSITE - CORE JAVASCRIPT
 * Shared functionality across all pages
 */

// Global configuration

    const CONFIG = {
       apiBase: 'Assets',
         animationDuration: 600,
         keyboardShortcuts: {
   
            'w': { action: 'navigate', target: 'beerwise.html', description: 'beerwise' },
           'b': { action: 'navigate', target: 'blog.html', description: 'blog' },
           'h': { action: 'navigate', target: 'index.html', description: 'home' },
             'l': { action: 'external', target: 'https://linkedin.com/in/samrudh-yash', description: 'linkedin' },
             't': { action: 'external', target: 'https://x.com/0xVollhard', description: 'twitter' },
             'g': { action: 'external', target: 'https://github.com/vollh4rD', description: 'github' }
         }
     };
// Utility functions
const Utils = {
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(value) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(value ?? '').replace(/[&<>"']/g, m => map[m]);
    },

    /**
     * Format date for display
     */
    formatDate(iso) {
        try {
            const d = new Date(iso);
            const fmt = new Intl.DateTimeFormat('en-US', { 
                month: 'short', 
                day: '2-digit', 
                year: 'numeric' 
            });
            return fmt.format(d).toLowerCase();
        } catch (_) { 
            return ''; 
        }
    },

    /**
     * Debounce function calls
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function calls
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Check if element is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
};

// Data management
const DataManager = {
    /**
     * Fetch JSON data with caching
     */
    async fetchData(filename, useCache = true) {
        const cacheKey = `data_${filename}`;
        
        if (useCache && sessionStorage.getItem(cacheKey)) {
            try {
                return JSON.parse(sessionStorage.getItem(cacheKey));
            } catch (e) {
                console.warn('Failed to parse cached data:', e);
            }
        }

        try {
            const response = await fetch(`${CONFIG.apiBase}/${filename}`, { 
                cache: useCache ? 'default' : 'no-store' 
            });
            
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (useCache) {
                sessionStorage.setItem(cacheKey, JSON.stringify(data));
            }
            
            return data;
        } catch (error) {
            console.error(`Error fetching ${filename}:`, error);
            throw error;
        }
    },

    /**
     * Clear all cached data
     */
    clearCache() {
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('data_')) {
                sessionStorage.removeItem(key);
            }
        });
    }
};

// Animation manager
const AnimationManager = {
    /**
     * Fade in animation
     */
    fadeIn(element, duration = CONFIG.animationDuration) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    },

    /**
     * Stagger animation for multiple elements
     */
    staggerFadeIn(elements, staggerDelay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                this.fadeIn(element);
            }, index * staggerDelay);
        });
    },

    /**
     * Setup intersection observer for scroll animations
     */
    setupScrollAnimations(selector = '.fade-in', options = {}) {
        const defaultOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observerOptions = { ...defaultOptions, ...options };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.fadeIn(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        document.querySelectorAll(selector).forEach(element => {
            observer.observe(element);
        });
    }
};

// Keyboard shortcuts manager
const KeyboardManager = {
    init() {
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    },

    handleKeydown(event) {
        // Don't trigger shortcuts when typing in input fields
        if (event.target.tagName === 'INPUT' || 
            event.target.tagName === 'TEXTAREA' || 
            event.target.contentEditable === 'true') {
            return;
        }

        const key = event.key.toLowerCase();
        const shortcut = CONFIG.keyboardShortcuts[key];

        if (shortcut && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            this.executeShortcut(shortcut);
        }
    },

    executeShortcut(shortcut) {
        switch (shortcut.action) {
            case 'navigate':
                window.location.href = shortcut.target;
                break;
            case 'external':
                window.open(shortcut.target, '_blank', 'noopener,noreferrer');
                break;
            default:
                console.log(`Shortcut action not implemented: ${shortcut.action}`);
        }
    }
};

// Navigation manager
const NavigationManager = {
    init() {
        this.setupNavButtons();
        this.setupSmoothScrolling();
    },

    setupNavButtons() {
        const navButtons = document.querySelectorAll('.nav-button');
        navButtons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)';
            });
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
            });
        });
    },

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
};

// Theme manager
const ThemeManager = {
    init() {
        this.loadTheme();
        this.setupThemeToggle();
    },

    loadTheme() {
        try {
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = savedTheme || (prefersDark ? 'dark' : 'light');
            
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(theme);
            document.documentElement.style.colorScheme = theme;
        } catch (e) {
            console.warn('Failed to load theme:', e);
        }
    },

    setTheme(theme) {
        try {
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(theme);
            document.documentElement.style.colorScheme = theme;
            localStorage.setItem('theme', theme);
        } catch (e) {
            console.warn('Failed to save theme:', e);
        }
    },

    setupThemeToggle() {
        const themeButton = document.querySelector('[data-theme-toggle]');
        if (themeButton) {
            themeButton.addEventListener('click', () => {
                const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                this.setTheme(newTheme);
            });
        }
    }
};

// Loading manager
const LoadingManager = {
    show(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.style.display = 'block';
        }
    },

    hide(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.style.display = 'none';
        }
    },

    showSpinner(container) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        if (container) {
            container.innerHTML = `
                <div class="flex justify-center items-center min-h-400">
                    <div class="spinner mr-4"></div>
                    <span class="text-gray-500">Loading...</span>
                </div>
            `;
        }
    }
};

// Error handler
const ErrorHandler = {
    show(element, message = 'An error occurred') {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.innerHTML = `
                <div class="text-center p-8">
                    <h2 class="text-xl font-bold mb-4 text-red-400">Error</h2>
                    <p class="text-sm text-gray-400">${Utils.escapeHtml(message)}</p>
                </div>
            `;
            element.style.display = 'block';
        }
    },

    log(error, context = '') {
        console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    }
};

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Samrudh website loaded');
    
    // Initialize core modules
    KeyboardManager.init();
    NavigationManager.init();
    ThemeManager.init();
    AnimationManager.setupScrollAnimations();
    
    // Add fade-in animation to main content
    const mainContent = document.querySelector('main');
    if (mainContent) {
        AnimationManager.fadeIn(mainContent);
    }
});

// Export for use in other scripts
window.SamrudhWebsite = {
    Utils,
    DataManager,
    AnimationManager,
    KeyboardManager,
    NavigationManager,
    ThemeManager,
    LoadingManager,
    ErrorHandler,
    CONFIG
};

