const games_URL = "https://ydvassdp.com:5001/api/YellowdotGames/Sports7/GetGames";
const LOGIN_URL = "https://ydvassdp.com:5001/api/YellowdotGames/Authorization/Login";
const username = "games_sa_sports7";
const password = "password";

// Function to retrieve JWT token from localStorage
const getStoredToken = () => ({
  jwtToken: localStorage.getItem("Token"),
  tokenExpiry: localStorage.getItem("Expiration"),
});

// Function to store JWT token in localStorage
const storeToken = (jwtToken, tokenExpiry) => {
  localStorage.setItem("Token", jwtToken);
  localStorage.setItem("Expiration", tokenExpiry);
};

// Function to handle authentication and get JWT token
const auth = async () => {
  try {
    const response = await fetch(LOGIN_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    
    if (data && data.jwtToken) {
      storeToken(data.jwtToken, data.tokenExpiry);
      return data.jwtToken;
    } else {
      console.error("Authentication failed: Invalid response.");
    }
  } catch (error) {
    console.error("Error during authentication:", error);
  }
};

// Function to check if the token is expired
const isTokenExpired = (expiryTime) => {
  const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
  return expiryTime < currentTime;
};

// Function to handle token validation or renewal
const validateToken = async (jwtToken, tokenExpiry) => {
  if (!jwtToken || isTokenExpired(tokenExpiry)) {
    console.log("Token is expired or not found. Authenticating...");
    return await auth();
  }
  console.log("Token is valid");
  return jwtToken;
};

// Function to fetch content from the API
const getContent = async (target_URL, token) => {
  try {
    const response = await fetch(target_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (data && data.message === "Success!") {
      return data.data; // Return the actual game content
    } else {
      console.error("Failed to fetch content:", data.message);
    }
  } catch (error) {
    console.error("Error fetching content:", error);
  }
};

// Function to handle login flow
const login = async () => {
  const { jwtToken, tokenExpiry } = getStoredToken();

  // Validate token or authenticate if invalid
  const validToken = await validateToken(jwtToken, tokenExpiry);

  if (validToken) {
    const games = await getContent(games_URL, validToken);
    if (games) {
      renderSections(games);
    }
  }
};

// Function to truncate descriptions
const truncateDescription = (description, wordLimit = 20) => {
  const words = description.split(' ');
  return words.length > wordLimit
    ? `${words.slice(0, wordLimit).join(' ')}...`
    : description;
};

// Function to safely escape HTML to prevent XSS
const escapeHTML = (str) => {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

// Function to render the carousel
const renderCarousel = (games, selector) => {
  const container = document.querySelector(selector);
  container.innerHTML = games.map(game => `
    <a href="${game.playUrl}" class="slide">
      <img class="img" src="${escapeHTML(game.thumbnailUrl)}" alt="" />
      <div class="slide-title game-slide">
        <div><p>${escapeHTML(game.name)}</p></div>
        <div class="game-slide-play">
          <span>PLAY</span>
          <img src="assets//Polygon.svg" alt="polygon" />
        </div>
      </div>
    </a>
  `).join('');
};

// Function to render the homepage
const renderHomepage = (games, selector) => {
  const container = document.querySelector(selector);
  container.innerHTML = games.map(game => `
    <div>
      <a href="${game.playUrl}" class="item">
        <img src="${escapeHTML(game.thumbnailUrl_Small)}" alt="Game Thumbnail" />
        <div class="game-play">
          <span>PLAY</span>
          <img src="assets//Polygon.svg" alt="polygon" />
        </div>
      </a>
      <p>${escapeHTML(game.name)}</p>
    </div>
  `).join('');
};

// shuffle function
const shuffleArray = (array) => {
    if (!Array.isArray(array)) {
        console.error("Invalid array provided.");
        return [];
    }

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
};

// Function to shuffle content and split it into sections
const shuffleContent = (games) => {
  // Shuffle the array and split into carousel and homepage sections
  const shuffledContent = shuffleArray(games);
  const carouselContent = shuffledContent.slice(0, 5);
  const homepageContent = shuffledContent.slice(5, 14);
  return { carouselContent, homepageContent };
};

// Function to render both the carousel and homepage sections
const renderSections = (games) => {
  const { carouselContent, homepageContent } = shuffleContent(games);
  renderCarousel(carouselContent, '.slides.games');
  renderHomepage(homepageContent, '.featured-games');
};

// Start the login flow when the page loads
login();
