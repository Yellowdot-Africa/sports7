document.addEventListener('DOMContentLoaded', async () => {
    const API_ENDPOINTS = {
        LOGIN: 'https://onlinetriviaapi.ydplatform.com:1990/api/YellowdotGames/Authorization/Login',
        GET_VIDEOS: 'https://onlinetriviaapi.ydplatform.com:1990/api/YellowdotGames/Sports7/GetVideos'
    };

    const credentials = {
        username: "games_sa_sports7",
        password: "password"
    };

    const pageContainer = document.getElementById("main");
    let token = localStorage.getItem('Token');

    /** Display the loading indicator */
    const showLoadingIndicator = () => toggleVisibility('loading-indicator', true);

    /** Hide the loading indicator */
    const hideLoadingIndicator = () => toggleVisibility('loading-indicator', false);

    /** Toggle visibility of elements */
    function toggleVisibility(elementId, show) {
        const element = document.getElementById(elementId);
        element.classList.toggle("hidden", !show);
        pageContainer.classList.toggle("hidden", show);
    }

    /** Authenticate and fetch a new token */
    const authenticate = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.LOGIN, {
                method: "POST",
                headers: { "Accept": "application/json", "Content-Type": "application/json" },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) throw new Error('Authentication failed');
            const { jwtToken, tokenExpiry } = await response.json();
            if (jwtToken) {
                localStorage.setItem('Token', jwtToken);
                localStorage.setItem('Expiration', tokenExpiry);
                return jwtToken;
            }
        } catch (error) {
            console.error('Error during authentication:', error);
        }
    };

    /** Validate token or fetch a new one */
    const validateToken = async () => {
        if (!token) return await authenticate();

        const { exp } = parseJWT(token);
        const currentTime = Math.floor(Date.now() / 1000);

        if (exp < currentTime) {
            console.log('Token expired, refreshing...');
            return await authenticate();
        }

        console.log('Token is valid');
        return token;
    };

    /** Parse a JWT to extract payload */
    const parseJWT = (token) => {
        try {
            const payload = token.split('.')[1];
            const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(decoded);
        } catch (error) {
            console.error('Invalid token:', error);
        }
    };

    /** Fetch videos from the API */
    const fetchVideos = async () => {
        showLoadingIndicator();
        try {
            token = await validateToken();

            const response = await fetch(API_ENDPOINTS.GET_VIDEOS, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error('Failed to fetch videos');

            const { message, data } = await response.json();
            localStorage.setItem("VideoList", JSON.stringify(data));
            if (message === 'Success!') {
                hideLoadingIndicator();
                renderSections(data);
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
        }
    };

    /** Render video sections */
    const renderSections = (videos) => {
        renderCarousel(filterVideos(videos, 3), '#slides');
        renderVideos(videos, "#featuredVideos");
    };

    /** Filter and limit videos */
    const filterVideos = (videos, limit) => videos.slice(0, limit);

    /** Render carousel */
    const renderCarousel = (videos, selector) => {
        const container = document.querySelector(selector);
        container.innerHTML = videos.map(video => createCarouselItem(video)).join('');
    };

    /** Create carousel item HTML */
    const createCarouselItem = (video) => `
        <a href="/video-page.html#${escapeHTML(video.downloadUrl)}" class="slide">
            <img class="img" src="${escapeHTML(video.thumbnailUrl)}" alt="${escapeHTML(video.name)}">
            <div class="play-btn"></div>
            <div class="slide-title"><h4>${escapeHTML(video.name)}</h4></div>
        </a>
    `;

    /** Render video sections */
    const renderVideos = (videos, selector) => {
        const container = document.querySelector(selector);
        container.innerHTML = videos.map(video => createVideoItem(video)).join('');
    };

    /** Create video item HTML */
    const createVideoItem = (video) => `
        <a href="/video-page.html#${escapeHTML(video.downloadUrl)}" class="video-item">
            <img src="${escapeHTML(video.thumbnailUrl)}" alt="${escapeHTML(video.name)}">
            <div class="video-title">
                <p>${escapeHTML(video.name)}</p>
            </div>
        </a>
    `;

    /** Escape HTML to prevent XSS */
    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    };

    // Fetch and render videos on page load
    await fetchVideos();
});
