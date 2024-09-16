const app = document.getElementById('app');

window.loadPage = function(page) {
    fetch(page + '.html') // Assuming HTML files are in the same directory
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('app').innerHTML = data;
            history.pushState({}, '', page); // Update browser history
        })
        .catch(error => console.error('Fetch error:', error));
};

loadPage('register'); // Load registration page initially

document.body.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
        event.preventDefault(); // Prevent default link behavior
        loadPage(event.target.getAttribute('href') + '.html'); // Append .html
    }
});

window.addEventListener('popstate', () => {
    loadPage(location.pathname.substring(1)); // Load page based on URL
});