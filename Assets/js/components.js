/**
 * COMPONENT LOADER
 * Handles loading and rendering of reusable HTML components
 */

class ComponentLoader {
    constructor() {
        this.components = new Map();
        this.init();
    }

    async init() {
        await this.loadComponents();
        this.renderComponents();
    }

    async loadComponents() {
        const componentFiles = [
            'header',
            'footer'
        ];

        for (const component of componentFiles) {
            try {
                const response = await fetch(`/Assets/components/${component}.html`);
                if (response.ok) {
                    const html = await response.text();
                    this.components.set(component, html);
                }
            } catch (error) {
                console.warn(`Failed to load component ${component}:`, error);
            }
        }
    }

    renderComponents() {
        // Render header
        const headerPlaceholder = document.querySelector('[data-component="header"]');
        if (headerPlaceholder && this.components.has('header')) {
            headerPlaceholder.outerHTML = this.components.get('header');
        }

        // Render footer
        const footerPlaceholder = document.querySelector('[data-component="footer"]');
        if (footerPlaceholder && this.components.has('footer')) {
            footerPlaceholder.outerHTML = this.components.get('footer');
        }
    }

    getComponent(name) {
        return this.components.get(name);
    }
}

// Initialize component loader when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    new ComponentLoader();
});

