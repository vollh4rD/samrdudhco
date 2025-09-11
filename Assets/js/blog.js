/**
 * BLOG FUNCTIONALITY
 * Handles blog listing, filtering, and post rendering
 */

class BlogManager {
    constructor() {
        this.posts = [];
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        try {
            await this.loadBlogPosts();
            this.renderBlogList();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize blog:', error);
            this.showError();
        }
    }

    async loadBlogPosts() {
        try {
            const data = await window.SamrudhWebsite.DataManager.fetchData('blogs.json');
            this.posts = Array.isArray(data?.blogs) ? data.blogs : [];
        } catch (error) {
            console.warn('Failed to load blog posts:', error);
            this.posts = [];
        }
    }

    renderBlogList() {
        const container = document.getElementById('blog-posts');
        if (!container) return;

        const filteredPosts = this.getFilteredPosts();
        
        container.innerHTML = '';
        
        if (filteredPosts.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-400">No blog posts found.</p>
                </div>
            `;
            return;
        }

        filteredPosts.forEach((post, index) => {
            const postElement = this.createPostElement(post);
            container.appendChild(postElement);
            
            // Stagger animation
            setTimeout(() => {
                postElement.classList.add('fade-in');
            }, index * 100);
        });
    }

    createPostElement(post) {
        const article = document.createElement('article');
        article.className = 'blog-card';
        
        if (post.status === 'inactive') {
            article.classList.add('inactive');
        }

        const title = window.SamrudhWebsite.Utils.escapeHtml(post.title || '');
        const excerpt = window.SamrudhWebsite.Utils.escapeHtml(post.excerpt || '');
        const date = window.SamrudhWebsite.Utils.formatDate(post.date);
        const tags = Array.isArray(post.tags) ? post.tags : [];
        const slug = post.slug || '';

        const tagsHtml = tags
            .map(tag => `<span class="blog-tag">${window.SamrudhWebsite.Utils.escapeHtml(tag.toLowerCase())}</span>`)
            .join('');

        let content = `
            <div class="blog-date">${date}</div>
            <h2 class="blog-title">${title}</h2>
            <div class="blog-tags">${tagsHtml}</div>
        `;

        if (post.status !== 'inactive' && excerpt) {
            content = `
                <div class="blog-date">${date}</div>
                <h2 class="blog-title">${title}</h2>
                <p class="blog-excerpt">${excerpt}</p>
                <div class="blog-tags">${tagsHtml}</div>
            `;
        }

        article.innerHTML = content;

        if (post.status === 'inactive') {
            article.innerHTML += '<div class="coming-soon">coming soon</div>';
        } else if (slug) {
            article.addEventListener('click', () => {
                window.location.href = `post.html?slug=${encodeURIComponent(slug)}`;
            });
        }

        return article;
    }

    getFilteredPosts() {
        if (this.currentFilter === 'all') {
            return this.posts;
        }
        
        return this.posts.filter(post => {
            const tags = Array.isArray(post.tags) ? post.tags : [];
            return tags.some(tag => 
                tag.toLowerCase().includes(this.currentFilter.toLowerCase())
            );
        });
    }

    filterPosts(category) {
        this.currentFilter = category;
        this.renderBlogList();
    }

    setupEventListeners() {
        // Filter buttons (if they exist)
        const filterButtons = document.querySelectorAll('[data-blog-filter]');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = button.dataset.blogFilter;
                this.filterPosts(filter);
                
                // Update active state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });

        // Search functionality (if search input exists)
        const searchInput = document.querySelector('[data-blog-search]');
        if (searchInput) {
            const debouncedSearch = window.SamrudhWebsite.Utils.debounce((query) => {
                this.searchPosts(query);
            }, 300);
            
            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }
    }

    searchPosts(query) {
        if (!query.trim()) {
            this.renderBlogList();
            return;
        }

        const filteredPosts = this.posts.filter(post => {
            const searchText = [
                post.title || '',
                post.excerpt || '',
                ...(post.tags || [])
            ].join(' ').toLowerCase();
            
            return searchText.includes(query.toLowerCase());
        });

        this.posts = filteredPosts;
        this.renderBlogList();
    }

    showError() {
        const container = document.getElementById('blog-posts');
        if (container) {
            window.SamrudhWebsite.ErrorHandler.show(container, 'Failed to load blog posts');
        }
    }
}

// Blog post renderer for individual posts
class BlogPostRenderer {
    constructor() {
        this.postData = null;
        this.init();
    }

    async init() {
        try {
            const slug = this.getSlugFromUrl();
            if (!slug) {
                this.showError('No post specified');
                return;
            }

            await this.loadPostData(slug);
            await this.renderPost();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize blog post:', error);
            this.showError('Failed to load blog post');
        }
    }

    getSlugFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('slug') || urlParams.get('post');
    }

    async loadPostData(slug) {
        try {
            const data = await window.SamrudhWebsite.DataManager.fetchData('blogs.json');
            const posts = Array.isArray(data?.blogs) ? data.blogs : [];
            this.postData = posts.find(post => post.slug === slug);

            if (!this.postData) {
                throw new Error('Post not found');
            }
        } catch (error) {
            console.error('Failed to load post data:', error);
            throw error;
        }
    }

    async renderPost() {
        this.updatePageMetadata();
        this.renderPostHeader();
        await this.renderPostContent();
        this.generateTableOfContents();
        this.setupReadingProgress();

        const loadingEl = document.getElementById('loading-state');
        if (loadingEl) loadingEl.style.display = 'none';
        const articleEl = document.getElementById('blog-content');
        if (articleEl) articleEl.style.display = 'block';
    }

    updatePageMetadata() {
        const title = this.postData.title || 'Untitled';
        const excerpt = this.postData.excerpt || '';
        
        document.title = `${title} - Samrudh`;
        document.querySelector('meta[name="description"]').content = excerpt;
        document.querySelector('meta[property="og:title"]').content = `${title} - Samrudh`;
        document.querySelector('meta[property="og:description"]').content = excerpt;
    }

    renderPostHeader() {
        const titleEl = document.getElementById('blog-title');
        const excerptEl = document.getElementById('blog-excerpt');
        const dateEl = document.getElementById('blog-date');
        const tagsEl = document.getElementById('blog-tags');

        if (titleEl) titleEl.textContent = this.postData.title || '';
        if (excerptEl) excerptEl.textContent = this.postData.excerpt || '';
        if (dateEl) dateEl.textContent = window.SamrudhWebsite.Utils.formatDate(this.postData.date);
        
        if (tagsEl && Array.isArray(this.postData.tags)) {
            tagsEl.innerHTML = this.postData.tags
                .map(tag => `<span class="blog-tag">${window.SamrudhWebsite.Utils.escapeHtml(tag)}</span>`)
                .join('');
        }
    }

    async renderPostContent() {
        const contentEl = document.getElementById('blog-body');
        if (!contentEl) return;

        try {
            // Fetch markdown content from the post's md path in blogs.json
            const markdownContent = await this.fetchMarkdownContent();

            // Configure marked with syntax highlighting
            if (typeof marked !== 'undefined') {
                marked.setOptions({
                    highlight: function(code, lang) {
                        if (typeof Prism !== 'undefined' && Prism.languages[lang]) {
                            return Prism.highlight(code, Prism.languages[lang], lang);
                        }
                        return code;
                    },
                    breaks: true,
                    gfm: true
                });

                // Render markdown to HTML
                let htmlContent = marked.parse(markdownContent);
                htmlContent = this.addHeadingIds(htmlContent);
                contentEl.innerHTML = htmlContent;

                // Initialize syntax highlighting
                if (typeof Prism !== 'undefined') {
                    Prism.highlightAll();
                }
            } else {
                // Fallback if marked is not available
                contentEl.innerHTML = markdownContent;
            }
        } catch (error) {
            console.error('Failed to render post content:', error);
            contentEl.innerHTML = '<p>Error loading content.</p>';
        }
    }

    async fetchMarkdownContent() {
        const mdPath = (this.postData?.md || '').replace(/^\/+/, '');
        if (!mdPath) {
            return '# Content not available';
        }

        const url = `/${mdPath}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
            throw new Error(`Failed to fetch markdown: ${res.status}`);
        }
        return await res.text();
    }
    async getSampleContent() {
        return sampleMarkdown;
    }

    generateTableOfContents() {
        const tocContainer = document.getElementById('table-of-contents');
        const tocList = document.getElementById('toc-list');
        
        if (!tocContainer || !tocList) return;

        const headings = document.querySelectorAll('h2, h3, h4, h5, h6');
        if (headings.length === 0) {
            tocContainer.style.display = 'none';
            return;
        }

        let tocHtml = '';
        headings.forEach((heading, index) => {
            const id = `heading-${index}`;
            heading.id = id;
            
            const level = parseInt(heading.tagName.charAt(1));
            const indent = '  '.repeat(level - 2);
            
            tocHtml += `
                <li style="margin-left: ${(level - 2) * 1}rem;">
                    <a href="#${id}" class="text-sm text-gray-400 hover:text-primary">
                        ${heading.textContent}
                    </a>
                </li>
            `;
        });

        tocList.innerHTML = tocHtml;
        tocContainer.style.display = 'block';
    }

    setupReadingProgress() {
        const progressBar = document.getElementById('reading-progress');
        if (!progressBar) return;

        const updateProgress = window.SamrudhWebsite.Utils.throttle(() => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = Math.min(scrollPercent, 100) + '%';
        }, 10);

        window.addEventListener('scroll', updateProgress);
        updateProgress(); // Initial call
    }

    setupEventListeners() {
        // Copy code blocks
        this.setupCodeCopyButtons();
        
        // Smooth scrolling for TOC links
        document.querySelectorAll('#table-of-contents a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    addHeadingIds(htmlContent) {
        return htmlContent.replace(/<h([1-6])>(.*?)<\/h[1-6]>/g, (match, level, text) => {
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            return `<h${level} id="${id}">${text}</h${level}>`;
        });
    }

    setupCodeCopyButtons() {
        document.querySelectorAll('pre code').forEach((codeBlock, index) => {
            const pre = codeBlock.parentElement;
            const button = document.createElement('button');
            button.className = 'copy-button absolute top-2 right-2 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded hover:bg-gray-700';
            button.textContent = 'copy';
            
            pre.style.position = 'relative';
            pre.appendChild(button);
            
            button.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(codeBlock.textContent);
                    button.textContent = 'copied!';
                    button.classList.add('text-green-400');
                    setTimeout(() => {
                        button.textContent = 'copy';
                        button.classList.remove('text-green-400');
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy text:', err);
                }
            });
        });
    }

    showError(message) {
        const loadingEl = document.getElementById('loading-state');
        const errorEl = document.getElementById('error-state');
        
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
            errorEl.style.display = 'block';
            errorEl.querySelector('p').textContent = message;
        }
    }
}


// Initialize based on page type
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('blog-posts')) {
        // Blog listing page
        new BlogManager();
    } else if (document.getElementById('blog-content')) {
        // Individual blog post page
        new BlogPostRenderer();
    }
});
