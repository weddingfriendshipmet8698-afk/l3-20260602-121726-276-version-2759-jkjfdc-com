(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    function setupImages() {
        document.querySelectorAll('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('is-missing');
            });
        });
    }

    function setupMobileNav() {
        var toggle = document.querySelector('.mobile-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = panel.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(open));
            panel.setAttribute('aria-hidden', String(!open));
        });
    }

    function setupCarousel() {
        var carousel = document.querySelector('[data-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.from(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.from(carousel.querySelectorAll('.hero-dot'));
        var prev = carousel.querySelector('[data-carousel-prev]');
        var next = carousel.querySelector('[data-carousel-next]');
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
                start();
            });
        });
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        start();
    }

    function uniqueValues(cards, key) {
        var values = new Set();
        cards.forEach(function (card) {
            var value = card.getAttribute('data-' + key);
            if (value) {
                values.add(value);
            }
        });
        return Array.from(values).sort(function (a, b) {
            return String(b).localeCompare(String(a), 'zh-Hans-CN');
        });
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function setupFilters() {
        var grid = document.querySelector('[data-filter-grid]');
        if (!grid) {
            return;
        }
        var cards = Array.from(grid.querySelectorAll('[data-movie-card]'));
        var input = document.querySelector('[data-filter-input]');
        var empty = document.querySelector('[data-empty-state]');
        var selects = {
            region: document.querySelector('[data-filter-select="region"]'),
            type: document.querySelector('[data-filter-select="type"]'),
            year: document.querySelector('[data-filter-select="year"]')
        };
        fillSelect(selects.region, uniqueValues(cards, 'region'));
        fillSelect(selects.type, uniqueValues(cards, 'type'));
        fillSelect(selects.year, uniqueValues(cards, 'year'));

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var selected = {
                region: selects.region ? selects.region.value : '',
                type: selects.type ? selects.type.value : '',
                year: selects.year ? selects.year.value : ''
            };
            var visible = 0;
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                var matched = true;
                if (query && !text.includes(query)) {
                    matched = false;
                }
                Object.keys(selected).forEach(function (key) {
                    if (selected[key] && card.getAttribute('data-' + key) !== selected[key]) {
                        matched = false;
                    }
                });
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        Object.keys(selects).forEach(function (key) {
            if (selects[key]) {
                selects[key].addEventListener('change', apply);
            }
        });
    }

    function getCoverPath(movie) {
        return './' + movie.coverIndex + '.jpg';
    }

    function createSearchCard(movie) {
        var tags = Array.isArray(movie.tags) ? movie.tags.join(' ') : '';
        var article = document.createElement('article');
        article.className = 'movie-card';
        article.setAttribute('data-movie-card', '');
        article.setAttribute('data-title', movie.title || '');
        article.setAttribute('data-region', movie.region || '');
        article.setAttribute('data-type', movie.type || '');
        article.setAttribute('data-year', movie.year || '');
        article.setAttribute('data-genre', movie.genreRaw || '');
        article.setAttribute('data-tags', tags);
        article.innerHTML = [
            '<a class="poster-frame" href="' + movie.page + '" aria-label="' + escapeHtml(movie.title) + '">',
            '<img class="movie-cover" src="' + getCoverPath(movie) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="cover-shade"></span>',
            '<span class="region-badge">' + escapeHtml(movie.region) + '</span>',
            '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<h2><a href="' + movie.page + '">' + escapeHtml(movie.title) + '</a></h2>',
            '<p>' + escapeHtml(movie.oneLine || '') + '</p>',
            '<div class="movie-meta">',
            '<span>' + escapeHtml(movie.type || '') + '</span>',
            '<span>' + escapeHtml(movie.genreRaw || '') + '</span>',
            '</div>',
            '</div>'
        ].join('');
        return article;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function setupSearchPage() {
        var results = document.querySelector('[data-search-results]');
        if (!results || !window.SITE_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var input = document.querySelector('[data-search-page-input]');
        var heading = document.querySelector('[data-search-heading]');
        if (input) {
            input.value = query;
        }
        if (!query) {
            return;
        }
        var lowered = query.toLowerCase();
        var matched = window.SITE_MOVIES.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genreRaw,
                Array.isArray(movie.tags) ? movie.tags.join(' ') : '',
                movie.oneLine
            ].join(' ').toLowerCase();
            return haystack.includes(lowered);
        }).slice(0, 120);
        results.innerHTML = '';
        if (heading) {
            heading.textContent = query + ' 搜索结果';
        }
        if (!matched.length) {
            var empty = document.createElement('p');
            empty.className = 'empty-state is-visible';
            empty.textContent = '暂未匹配到影片';
            results.appendChild(empty);
            return;
        }
        matched.forEach(function (movie) {
            results.appendChild(createSearchCard(movie));
        });
        setupImages();
    }

    function setupPlayer() {
        var video = document.querySelector('.js-player');
        if (!video) {
            return;
        }
        var overlay = document.querySelector('.play-overlay');
        var errorBox = document.querySelector('.player-error');
        var hls = null;
        var initialized = false;
        var stream = video.getAttribute('data-stream');

        function showError() {
            if (errorBox) {
                errorBox.classList.add('is-visible');
            }
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        }

        function initialize() {
            if (initialized) {
                return Promise.resolve();
            }
            initialized = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showError();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else {
                showError();
            }
            return Promise.resolve();
        }

        function playVideo() {
            initialize().then(function () {
                hideOverlay();
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        showError();
                    });
                }
            });
        }

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }
        video.addEventListener('click', function () {
            if (!initialized || video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', hideOverlay);
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    ready(function () {
        setupImages();
        setupMobileNav();
        setupCarousel();
        setupFilters();
        setupSearchPage();
        setupPlayer();
    });
})();
