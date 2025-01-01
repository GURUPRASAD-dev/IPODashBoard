document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.nav a');

    links.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const path = link.getAttribute('href').replace('.html', '');
            navigateTo(path);
        });
    });

    window.onpopstate = () => {
        navigateTo(location.pathname, false);
    };

    function navigateTo(path, pushState = true) {
        fetch(`${path}.html`)
            .then(response => response.text())
            .then(html => {
                document.querySelector('main').innerHTML = html;
                if (pushState) {
                    history.pushState(null, null, path);
                }
            })
            .catch(err => console.error('Error loading page:', err));
    }

    // Load the initial page based on the current URL
    if (location.pathname === '/') {
        navigateTo('/index', false);
    } else {
        navigateTo(location.pathname, false);
    }
});
