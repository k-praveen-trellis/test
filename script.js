const converter = new showdown.Converter();
const contentDiv = document.getElementById('content');

async function loadContent(page, id = null) {
    let fileName = `${page}.md`;
    if (id) {
        fileName = `${page}/${id}.md`;
    }
    const response = await fetch(fileName);
    const text = await response.text();
    const html = converter.makeHtml(text);
    contentDiv.innerHTML = html;

    if (page === 'blogs' || page === 'projects') {
        addSearchFunctionality();
    }
}

function addSearchFunctionality() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = '<input type="text" id="searchInput" placeholder="Search by title...">';
    contentDiv.insertBefore(searchContainer, contentDiv.firstChild);

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const items = document.querySelectorAll('.item-list li');
        items.forEach(item => {
            const title = item.querySelector('h3').textContent.toLowerCase();
            if (title.includes(query)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.target.getAttribute('data-page');
        loadContent(page);
    });
});

// Event delegation for handling "Read More" clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('read-more')) {
        e.preventDefault();
        const page = e.target.getAttribute('data-page');
        const id = e.target.getAttribute('data-id');
        loadContent(page, id);
    }
});

// Load the about page by default
loadContent('about');