// basecase website JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    console.log('basecase website loaded');
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Only trigger shortcuts when not typing in input fields
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(event.key.toLowerCase()) {
            case 'w':
                // [w] beerwise - navigate to beerwise
                window.location.href = '/beerwise';
                break;            
            case 'b':
                // [b] blog - navigate to blog
                window.location.href = '/blog';
                break;

            case 'd':
                // [l] details - show more details
                console.log('Details shortcut pressed');
                break;

            case 'l':    
                window.open('https://linkedin.com/in/samrudh-yash', '_blank');
                break;
            case 't':
                // [t] twitter - open twitter profile
                window.open('https://x.com/0xVollhard', '_blank');
                break;
            case 'g':
                // [t] twitter - open twitter profile
                window.open('https://github.com/vollh4rD', '_blank');
                break;
        }
    });
    
    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('button, a');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.2s ease';
        });
    });
    
    // Theme color picker functionality (placeholder)
    const themeButton = document.querySelector('button[aria-label="change theme color"]');
    if (themeButton) {
        themeButton.addEventListener('click', function() {
            console.log('Theme color picker clicked');
            // This could open a color picker or cycle through theme colors
        });
    }
    
    // Grid button functionality (placeholder)
    const gridIcon = document.querySelector('button svg[class*="grid3x3"]');
    const gridButton = gridIcon ? gridIcon.closest('button') : null;
    if (gridButton) {
        gridButton.addEventListener('click', function() {
            console.log('Grid button clicked');
            // This could open a grid view or navigation menu
        });
    }
    
    // Keyboard button functionality (placeholder)
    const keyboardIcon = document.querySelector('button svg[class*="keyboard"]');
    const keyboardButton = keyboardIcon ? keyboardIcon.closest('button') : null;
    if (keyboardButton) {
        keyboardButton.addEventListener('click', function() {
            console.log('Keyboard shortcuts help clicked');
            // This could show a keyboard shortcuts help modal
        });
    }
    

    
    // Next testimonial button functionality
    const nextButton = Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent && btn.textContent.includes('[n] next'));
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            console.log('Next testimonial clicked');
            // This could cycle through different testimonials
        });
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add loading animation for the "iconic" text
    const iconicText = document.querySelector('.scale-100');
    if (iconicText) {
        // Add a subtle animation when the page loads
        setTimeout(() => {
            iconicText.style.transform = 'scale(1.05)';
            setTimeout(() => {
                iconicText.style.transform = 'scale(1)';
            }, 200);
        }, 1000);
    }
    
    // Responsive navigation adjustments
    function adjustNavigation() {
        const nav = document.querySelector('nav');
        if (window.innerWidth < 768) {
            // Mobile adjustments
            nav.classList.add('mobile-nav');
        } else {
            nav.classList.remove('mobile-nav');
        }
    }
    
    // Call on load and resize
    adjustNavigation();
    window.addEventListener('resize', adjustNavigation);
    
    // Add some subtle animations to the page
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections for fade-in animations
    document.querySelectorAll('main > div').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Experience timeline: fetch from JSON and render
    const experienceTimeline = document.getElementById('experience-timeline');
    if (experienceTimeline) {
        fetch('Assets/experience.json', { cache: 'no-store' })
            .then(response => {
                if (!response.ok) throw new Error('Failed to load experience.json');
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data?.experiences)) return;
                // Clear existing hardcoded items
                experienceTimeline.innerHTML = '';
                data.experiences.forEach(exp => {
                    const item = document.createElement('div');
                    item.className = 'timeline-item';
                    const titleText = [exp.role, exp.company].filter(Boolean).join(' - ');
                    item.innerHTML = `
                        <h3 class="font-semibold text-sm mb-4">${escapeHtml(titleText)}</h3>
                        <div class="space-y-1 text-sm">
                            ${Array.isArray(exp.bullets) ? exp.bullets.map(b => `
                                <div class=\"flex items-center space-x-3 text-sm\">
                                    <span>* ${escapeHtml(b)}</span>
                                </div>
                            `).join('') : ''}
                        </div>
                    `;
                    experienceTimeline.appendChild(item);
                });
            })
            .catch(err => {
                console.warn('Experience timeline fallback due to:', err.message);
                // Leave the original static HTML in place as fallback
            });
    }
    
    // Blog list: fetch from JSON and render
        const blogList = document.getElementById('blog-list');
        if (blogList) {
            fetch('Assets/blogs.json', { cache: 'no-store' })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to load blogs.json');
                    return response.json();
                })
                .then(data => {
                    if (!Array.isArray(data?.blogs)) return;
                    blogList.innerHTML = '';
                    data.blogs.forEach(b => {
                        const article = document.createElement('article');
                        article.className = 'post';
                        const title = escapeHtml(b.title ?? '');
                        const date = escapeHtml(b.date ?? '');
                        const minutes = Number.isFinite(b.minutes) ? `${b.minutes} min read` : '';
                        const meta = [date, minutes].filter(Boolean).join(' • ');
                        const excerpt = escapeHtml(b.excerpt ?? '');
                        const href = typeof b.slug === 'string' && b.slug.trim() ? `post.html?slug=${encodeURIComponent(b.slug)}` : '#';
                        article.innerHTML = `
                            <a href="${href}" class="post-title text-xl font-bold">${title}</a>
                            <div class="post-meta text-sm text-gray-500">${meta}</div>
                            <p class="post-excerpt text-sm mt-4">${excerpt}</p>
                        `;
                        blogList.appendChild(article);
                    });
                })
                .catch(err => {
                    console.warn('Blog list fallback due to:', err.message);
                    // leave empty on failure
                });
        }
    

    // Companies list: fetch from JSON and render
    const companiesList = document.getElementById('companies-list');
    if (companiesList) {
        fetch('Assets/companies.json', { cache: 'no-store' })
            .then(response => {
                if (!response.ok) throw new Error('Failed to load companies.json');
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data?.companies)) return;
                companiesList.innerHTML = '';
                data.companies.forEach(c => {
                    const li = document.createElement('li');
                    const url = typeof c.url === 'string' && c.url.trim() ? c.url : '#';
                    li.innerHTML = `
                        <a class="company-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
                            <span class="company-plus">+</span>
                            <span class="company-text underline">${escapeHtml(c.name)}</span>
                        </a>
                    `;
                    companiesList.appendChild(li);
                });
            })
            .catch(err => {
                console.warn('Companies list fallback due to:', err.message);
                // Leave empty if fetch fails
            });
    }
// Simple HTML escaper to prevent injection from JSON
function escapeHtml(value) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(value ?? '').replace(/[&<>"']/g, m => map[m]);
}

// Text shuffle typewriter for hero title
(function initHeroShuffleType() {
    const el = document.getElementById('hero-title');
    if (!el) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initHeroShuffleType, { once: true });
        }
        return;
    }

    const CHARS = '!<>-_\\/[]{}—=+*^?#________';
    const finalText = el.textContent;
    let raf = null;

    function randChar() {
        return CHARS[Math.floor(Math.random() * CHARS.length)] || '_';
    }

    function play() {
        if (raf) cancelAnimationFrame(raf);
        el.textContent = '';
        let i = 1;              // next character to lock in
        let cycles = 8;         // shuffle frames spent on current char
        const cyclesPerChar = 5; // lower = faster lock-in

        function step() {
            if (i >= finalText.length) {
                el.textContent = finalText;
                raf = null;
                return;
            }

            // lock spaces instantly (keeps rhythm natural)
            if (finalText[i] === ' ') {
                el.textContent = finalText.slice(0, i + 1);
                i++;
                cycles = 0;
                raf = requestAnimationFrame(step);
                return;
            }

            const fixed = finalText.slice(0, i);
            const current = randChar();
            el.textContent = fixed + current;

            cycles++;
            if (cycles >= cyclesPerChar) {
                // lock the real char and move forward
                el.textContent = fixed + finalText[i];
                i++;
                cycles = 0;
            }
            raf = requestAnimationFrame(step);
        }
        step();
    }

    // Run on load and allow replay on hover/click
    setTimeout(play, 200);
})();

 
});
