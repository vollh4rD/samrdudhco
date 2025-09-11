document.addEventListener('DOMContentLoaded', async function () {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    if (!slug) {
        document.getElementById('post-title').textContent = 'post not found';
        return;
    }

    let meta;
    try {
        const res = await fetch('Assets/blogs.json', { cache: 'no-store' });
        const json = await res.json();
        meta = Array.isArray(json?.blogs) ? json.blogs.find(b => b.slug === slug) : null;
    } catch (e) {
        meta = null;
    }

    if (!meta) {
        document.getElementById('post-title').textContent = 'post not found';
        return;
    }

    const titleEl = document.getElementById('post-title');
    const dateEl = document.getElementById('post-date');
    const minEl = document.getElementById('post-minread');
    titleEl.textContent = String(meta.title || '').toLowerCase();
    if (meta.date) {
        const d = new Date(meta.date);
        dateEl.setAttribute('datetime', d.toISOString());
        const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        dateEl.textContent = formatter.format(d).toLowerCase();
    }
    if (Number.isFinite(meta.minutes)) minEl.textContent = `${meta.minutes} min read`;

    const mdPath = typeof meta.md === 'string' ? meta.md : null;
    if (!mdPath) return;

    try {
        const res = await fetch(mdPath, { cache: 'no-store' });
        if (!res.ok) throw new Error('md fetch failed');
        const markdown = await res.text();
        const converter = new showdown.Converter({
            tables: true,
            simplifiedAutoLink: true,
            strikethrough: true,
            tasklists: true,
            ghCodeBlocks: true
        });
        const html = converter.makeHtml(markdown);
        const contentEl = document.getElementById('post-content');
        contentEl.innerHTML = html;

        enhancePost(contentEl);
        buildTOC(contentEl, document.getElementById('post-toc'));
        setupProgress();
    } catch (e) {
        document.getElementById('post-content').textContent = 'failed to load content';
    }
});

function slugify(text) {
    return String(text || '')
        .toLowerCase()
        .trim()
        .replace(/[\s]+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}
function enhancePost(root) {
    // Ensure headings have IDs and anchor links
    const headings = root.querySelectorAll('h1, h2, h3');
    headings.forEach(h => {
        if (!h.id) h.id = slugify(h.textContent);
        const a = document.createElement('a');
        a.href = `#${h.id}`;
        a.className = 'no-underline ml-2 text-muted-foreground hover:text-foreground';
        a.setAttribute('aria-label', 'link to section');
        a.textContent = '¶';
        // Avoid duplicating anchor on repeated runs
        if (!h.querySelector('a[href="#' + h.id + '"]')) h.appendChild(a);
    });

    // Open external links in new tabs securely
    const links = root.querySelectorAll('a[href]');
    links.forEach(a => {
        try {
            const url = new URL(a.getAttribute('href'), window.location.href);
            if (url.origin !== window.location.origin) {
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
            }
        } catch (_) {}
    });

    // Make images responsive
    const imgs = root.querySelectorAll('img');
    imgs.forEach(img => {
        img.loading = 'lazy';
        img.decoding = 'async';
        img.classList.add('rounded-lg');
        if (!img.getAttribute('alt')) img.setAttribute('alt', '');
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
    });

    // Add copy buttons to code blocks
    const blocks = root.querySelectorAll('pre > code');
    blocks.forEach(code => {
        const pre = code.parentElement;
        pre.style.position = 'relative';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = 'copy';
        btn.className = 'text-xs px-2 py-1 rounded-md border border-gray-800 hover:border-gray-600 bg-background-dark absolute top-2 right-2';
        btn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(code.innerText);
                btn.textContent = 'copied';
                setTimeout(() => (btn.textContent = 'copy'), 1200);
            } catch (_) {
                btn.textContent = 'error';
                setTimeout(() => (btn.textContent = 'copy'), 1200);
            }
        });
        pre.appendChild(btn);
    });
}

function buildTOC(root, tocEl) {
    if (!tocEl) return;
    const nodes = Array.from(root.querySelectorAll('h2, h3'));
    if (nodes.length === 0) {
        tocEl.innerHTML = '<div class="text-xs text-muted-foreground">no sections</div>';
        return;
    }
    const list = document.createElement('div');
    nodes.forEach(h => {
        if (!h.id) h.id = slugify(h.textContent);
        const item = document.createElement('a');
        item.href = `#${h.id}`;
        item.textContent = h.textContent;
        item.className = 'block px-2 py-1 rounded hover:bg-secondary/60';
        if (h.tagName.toLowerCase() === 'h3') {
            item.className += ' ml-3 text-muted-foreground';
        }
        list.appendChild(item);
    });
    tocEl.innerHTML = '';
    tocEl.appendChild(list);

    // Smooth scroll
    tocEl.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const id = a.getAttribute('href').slice(1);
            const target = document.getElementById(id);
            if (target) {
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.scrollY - 80,
                    behavior: 'smooth'
                });
                history.replaceState(null, '', `#${id}`);
            }
        });
    });
}

function setupProgress() {
    const inner = document.getElementById('progress-inner');
    const content = document.getElementById('post-content');
    if (!inner || !content) return;

    const onScroll = () => {
        const rect = content.getBoundingClientRect();
        const contentTop = rect.top + window.scrollY;
        const contentHeight = content.scrollHeight;
        const viewport = window.innerHeight;
        const max = Math.max(1, contentHeight - viewport);
        const scrolled = Math.min(Math.max(window.scrollY - contentTop, 0), max);
        const pct = (scrolled / max) * 100;
        inner.style.width = `${pct}%`;
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
}