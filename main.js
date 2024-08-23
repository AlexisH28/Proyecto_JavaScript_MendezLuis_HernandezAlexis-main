document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://swapi.py4e.com/api/';
    const searchInput = document.getElementById('searchInput');
    const searchType = document.getElementById('searchType');
    const resultsContainer = document.getElementById('results');

    const fetchData = async (endpoint, query) => {
        try {
            const response = await fetch(`${apiUrl}${endpoint}/?search=${query}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            return { results: [] };
        }
    };

    const getImageUrl = (type, id) => {
        // Base URL for the Star Wars Visual Guide images
        const baseUrl = 'https://starwars-visualguide.com/assets/img/';
        switch (type) {
            case 'people':
                return `${baseUrl}characters/${id}.jpg`;
            case 'planets':
                return `${baseUrl}planets/${id}.jpg`;
            case 'starships':
                return `${baseUrl}starships/${id}.jpg`;
            case 'vehicles':
                return `${baseUrl}vehicles/${id}.jpg`;
            case 'species':
                return `${baseUrl}species/${id}.jpg`;
            default:
                return 'https://via.placeholder.com/300?text=No+Image';
        }
    };

    const renderResults = (data, type) => {
        if (!data.results.length) {
            resultsContainer.innerHTML = `<p class="text-center">No results found for ${type}.</p>`;
            return;
        }

        resultsContainer.innerHTML = data.results.map(item => {
            const id = item.url.split('/').filter(Boolean).pop(); // Extract ID from URL
            return `
                <div class="col-md-4">
                    <div class="card">
                        <img src="${getImageUrl(type, id)}" class="card-img-top" alt="${item.name}">
                        <div class="card-body">
                            <h5 class="card-title">${item.name}</h5>
                            ${type === 'people' ? `<p class="card-text">Height: ${item.height} cm</p><p class="card-text">Mass: ${item.mass} kg</p><p class="card-text">Birth Year: ${item.birth_year}</p>` : ''}
                            ${type === 'planets' ? `<p class="card-text">Climate: ${item.climate}</p><p class="card-text">Terrain: ${item.terrain}</p><p class="card-text">Population: ${item.population}</p>` : ''}
                            ${type === 'starships' ? `<p class="card-text">Model: ${item.model}</p><p class="card-text">Manufacturer: ${item.manufacturer}</p><p class="card-text">Cost: ${item.cost_in_credits} credits</p>` : ''}
                            ${type === 'vehicles' ? `<p class="card-text">Model: ${item.model}</p><p class="card-text">Manufacturer: ${item.manufacturer}</p><p class="card-text">Cost: ${item.cost_in_credits} credits</p>` : ''}
                            ${type === 'species' ? `<p class="card-text">Classification: ${item.classification}</p><p class="card-text">Language: ${item.language}</p><p class="card-text">Average Lifespan: ${item.average_lifespan}</p>` : ''}
                        </div>
                    </div>
                </div>`;
        }).join('');
    };

    searchInput.addEventListener('input', async (event) => {
        const query = event.target.value.toLowerCase();
        const type = searchType.value;
        if (query.length > 2) {
            const data = await fetchData(type, query);
            renderResults(data, type);
        } else {
            resultsContainer.innerHTML = '';
        }
    });

    searchType.addEventListener('change', async () => {
        const query = searchInput.value.toLowerCase();
        const type = searchType.value;
        if (query.length > 2) {
            const data = await fetchData(type, query);
            renderResults(data, type);
        }
    });
});