/**
 * HOME PAGE FUNCTIONALITY
 * Handles experience timeline and achievements loading
 */

class HomePage {
    constructor() {
        this.init();
    }

    async init() {
        try {
            await this.loadExperienceData();
            await this.loadAchievementsData();
            this.setupAnimations();
        } catch (error) {
            console.error('Failed to initialize home page:', error);
        }
    }

    async loadExperienceData() {
        const timelineContainer = document.getElementById('experience-timeline');
        if (!timelineContainer) return;

        try {
            const data = await window.SamrudhWebsite.DataManager.fetchData('data.json');
            const experiences = Array.isArray(data?.experiences) ? data.experiences : [];
            
            timelineContainer.innerHTML = '';
            
            experiences.forEach(exp => {
                const item = document.createElement('div');
                item.className = 'timeline-item';
                
                const titleText = `${exp.role} @ ${exp.company}`;
                const years = exp.years || '';
                
                item.innerHTML = `
                    <div class="flex justify-between items-center">
                        <div class="font-semibold text-sm">${window.SamrudhWebsite.Utils.escapeHtml(titleText)}</div>
                        <div class="text-xs text-gray-400">${window.SamrudhWebsite.Utils.escapeHtml(years)}</div>
                    </div>
                    <div class="space-y-2 text-sm mt-3">
                        ${Array.isArray(exp.bullets) ? exp.bullets.map(bullet => `
                            <div class="flex items-start space-x-6">
                                <span class="text-gray-300">*  ${window.SamrudhWebsite.Utils.escapeHtml(bullet)}</span>
                            </div>
                        `).join('') : ''}
                    </div>
                `;
                
                timelineContainer.appendChild(item);
            });
        } catch (error) {
            console.warn('Failed to load experience data:', error);
            this.showFallbackExperience(timelineContainer);
        }
    }

    async loadAchievementsData() {
        const achievementsContainer = document.getElementById('achievements-list');
        if (!achievementsContainer) return;

        try {
            const data = await window.SamrudhWebsite.DataManager.fetchData('data.json');
            const achievements = Array.isArray(data?.achievements) ? data.achievements : [];
            
            achievementsContainer.innerHTML = '';
            
            achievements.forEach(achievement => {
                const item = document.createElement('div');
                item.className = 'achievement-item';
                item.innerHTML = `
                    <div class="flex items-center space-x-3 text-sm hover:text-primary transition-all cursor-pointer">
                        <span>+ ${window.SamrudhWebsite.Utils.escapeHtml(achievement.name)}</span>
                    </div>
                `;
                
                achievementsContainer.appendChild(item);
            });
        } catch (error) {
            console.warn('Failed to load achievements data:', error);
        }
    }

    showFallbackExperience(container) {
        container.innerHTML = `
            <div class="timeline-item">
                <div class="font-semibold text-sm">cybersecurity engineer @ kpmg</div>
                <div class="text-xs text-gray-400 mt-1">securing enterprise networks & infrastructure</div>
            </div>
            <div class="timeline-item">
                <div class="font-semibold text-sm">founder @ startup (acquired)</div>
                <div class="text-xs text-gray-400 mt-1">scaled to ₹80k/m revenue before acquisition</div>
            </div>
            <div class="timeline-item">
                <div class="font-semibold text-sm">founder @ design agency</div>
                <div class="text-xs text-gray-400 mt-1">scaled to $1000+/m during covid</div>
            </div>
        `;
    }

    setupAnimations() {
        // Animate achievement items on scroll
        const achievementItems = document.querySelectorAll('.achievement-item');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeIn 0.6s ease-out forwards';
                }
            });
        });

        achievementItems.forEach((item) => {
            observer.observe(item);
        });
    }
}

// Initialize home page when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    new HomePage();
});

