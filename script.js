const converter = new showdown.Converter({
    tables: true,
    strikethrough: true,
    tasklists: true,
    ghCodeBlocks: true,
    emoji: true
});
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
        convertToTable(page);
        addSearchFunctionality();
    }

    applyStyles();
}

function convertToTable(page) {
    const items = document.querySelectorAll('.item-list > div');
    const tableData = Array.from(items).map(item => {
        const title = item.querySelector('h2').textContent;
        const subtitle = item.querySelector('h3').textContent;
        const date = item.querySelector('p').textContent;
        const description = item.querySelector('p:nth-of-type(2)').textContent;
        const link = item.querySelector('a').outerHTML;
        return [title, subtitle, date, description, link];
    });

    const csv = Papa.unparse(tableData);
    const parsedData = Papa.parse(csv, { header: true });

    const table = document.createElement('table');
    table.className = 'custom-table';
    table.innerHTML = `
        <thead>
            <tr>
                ${parsedData.meta.fields.map(field => `<th>${field}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${parsedData.data.map(row => `
                <tr>
                    ${parsedData.meta.fields.map(field => `<td>${row[field]}</td>`).join('')}
                </tr>
            `).join('')}
        </tbody>
    `;

    const itemList = document.querySelector('.item-list');
    itemList.parentNode.replaceChild(table, itemList);
}

function addSearchFunctionality() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = '<input type="text" id="searchInput" placeholder="Search by title...">';
    contentDiv.insertBefore(searchContainer, contentDiv.firstChild);

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const rows = document.querySelectorAll('.custom-table tbody tr');
        rows.forEach(row => {
            const title = row.querySelector('td').textContent.toLowerCase();
            if (title.includes(query)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

function applyStyles() {
    // Apply syntax highlighting to code blocks
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
        block.parentNode.classList.add('code-block');
    });

    // Add class to inline code
    document.querySelectorAll('p code, li code').forEach((code) => {
        code.classList.add('inline-code');
    });

    // Add class to images
    document.querySelectorAll('img').forEach((img) => {
        img.classList.add('image-embed');
    });

    // Add class to paragraphs
    document.querySelectorAll('p').forEach((p) => {
        p.classList.add('paragraph');
    });

    // Add class to blockquotes
    document.querySelectorAll('blockquote').forEach((quote) => {
        quote.classList.add('blockquote');
    });

    // Add class to task lists
    document.querySelectorAll('ul.contains-task-list').forEach((list) => {
        list.classList.add('task-list');
    });

    // Add target="_blank" to external links
    document.querySelectorAll('a').forEach((link) => {
        if (link.hostname !== window.location.hostname) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
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