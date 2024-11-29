document.addEventListener('DOMContentLoaded', async function () {
    const AUTH_API = 'https://onlinetriviaapi.ydplatform.com:1990/api/YellowdotGames/Authorization/Login';
    const GAMES_API = 'https://onlinetriviaapi.ydplatform.com:1990/api/YellowdotGames/Sports7/GetGames';
    const USERNAME = "games_sa_sports7";
    const PASSWORD = "password";

    const pageContainer = document.getElementById("main");

    // Initialize and load data
    await initialize();

    /** 
     * Initializes the app by checking token expiration 
     * and fetching games for the home page.
     */
    async function initialize() {
        const token = ensureValidToken();
        if (!token) {
            console.error('Failed to authenticate and fetch token.');
            return;
        }
        await loadGames();
    }

    /**
     * Ensures a valid JWT token is available, refreshing it if necessary.
     * @returns {string} A valid JWT token.
     */
    async function ensureValidToken() {
        let token = localStorage.getItem('Token');
        if (!token || isTokenExpired(token)) {
            token = authenticate();
        }
        return token;
    }

    /**
     * Authenticates the user and retrieves a JWT token.
     * @returns {string} A new JWT token.
     */
    async function authenticate() {
        try {
            const response = await fetch(AUTH_API, {
                method: "POST",
                headers: { "Accept": "application/json", "Content-Type": "application/json" },
                body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
            });
            const data = await response.json();
            if (data?.jwtToken) {
                const { jwtToken, tokenExpiry } = data;
                localStorage.setItem('Token', jwtToken);
                localStorage.setItem('Expiration', tokenExpiry);
                return jwtToken;
            }
        } catch (error) {
            console.error('Error during authentication:', error);
        }
        return null;
    }

    /**
     * Checks if a JWT token is expired.
     * @param {string} token - JWT token to check.
     * @returns {boolean} True if the token is expired, false otherwise.
     */
    function isTokenExpired(token) {
        try {
            const { exp } = parseJWT(token);
            return exp < Math.floor(Date.now() / 1000);
        } catch (error) {
            console.error('Error decoding token:', error);
            return true;
        }
    }

    /**
     * Parses a JWT and returns its payload.
     * @param {string} token - JWT token to parse.
     * @returns {object} Decoded JWT payload.
     */
    function parseJWT(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`;
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    /**
     * Fetches games from the API and renders them on the page.
     */
    async function loadGames() {
        showLoadingIndicator();
        try {
            const response = await fetch(GAMES_API, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('Token')}`
                },
            });
            const data = await response.json();
            if (data?.message === 'Success!') {
                renderSections(data.data);
            }
        } catch (error) {
            console.error('Error fetching games:', error);
        } finally {
            hideLoadingIndicator();
        }
    }

    /**
     * Renders the game sections on the page.
     * @param {Array} games - List of game objects.
     */
    function renderSections(games) {
        renderCarousel(filterAndLimitGames(games, 3), '#slides');
        renderGames(games, '#featuredGames');
    }

    /**
     * Filters and limits the games list to a specific number.
     * @param {Array} games - List of games.
     * @param {number} limit - Maximum number of games to include.
     * @returns {Array} Filtered games list.
     */
    function filterAndLimitGames(games, limit) {
        return games.slice(0, limit);
    }

    /**
     * Renders the carousel with games.
     * @param {Array} gamesList - List of games for the carousel.
     * @param {string} selector - CSS selector for the carousel container.
     */
    function renderCarousel(gamesList, selector) {
        console.log(gamesList);
        
        const container = document.querySelector(selector);
        container.innerHTML = gamesList.map(game => `
            <a href="${escapeHTML(game.playUrl)}" class="slide">
                <img class="img" src="${escapeHTML(game.imageUrl)}" alt="${escapeHTML(game.name)}" />
                <div class="play-btn"></div>
                <div class="slide-title">
                    <h4>${escapeHTML(game.name)}</h4>
                </div>
            </a>
        `).join('');
    }

    /**
     * Renders the game list.
     * @param {Array} gamesList - List of games for rendering.
     * @param {string} selector - CSS selector for the games container.
     */
    function renderGames(gamesList, selector) {
        const container = document.querySelector(selector);
        container.innerHTML = gamesList.map(game => `
            <div>
                <a href="${escapeHTML(game.playUrl)}" class="item">
                    <img src="${escapeHTML(game.imageUrl)}" alt="${escapeHTML(game.name)}" class="item-img" />
                    <div class="game-play">
                        <span>PLAY</span>
                        <img src="${escapeHTML(game.imageUrl)}" alt="polygon">
                    </div>
                </a>
                <p>${escapeHTML(game.name)}</p>
            </div>
        `).join('');
    }

    /**
     * Escapes HTML to prevent XSS attacks.
     * @param {string} str - String to escape.
     * @returns {string} Escaped string.
     */
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    /**
     * Shows the loading indicator.
     */
    function showLoadingIndicator() {
        document.getElementById('loading-indicator').classList.remove("hidden");
        pageContainer.classList.add("hidden");
    }

    /**
     * Hides the loading indicator.
     */
    function hideLoadingIndicator() {
        document.getElementById('loading-indicator').classList.add("hidden");
        pageContainer.classList.remove("hidden");
    }
});
