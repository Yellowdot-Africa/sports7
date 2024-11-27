const games_URL = "https://ydvassdp.com:5001/api/YellowdotGames/Sports7/GetGames"

const login = async () => {
  let jwtToken = localStorage.getItem("Token");
  let tokenExpiry = localStorage.getItem("Expiration");

  await checkTokenExpiration(jwtToken, tokenExpiry);

  if (jwtToken) {
    // console.log(jwtToken);
  } else {
    auth();
  }
    // const data = await getContent(video_URL, jwtToken);
   const data2 = await getContent(games_URL, jwtToken);
   console.log(data2);
}

async function auth() {
  const username = "games_sa_sports7";
  const password = "password";
  const LOGIN_URL = "https://ydvassdp.com:5001/api/YellowdotGames/Authorization/Login";
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
      const { jwtToken, tokenExpiry } = data;
      localStorage.setItem("Token", jwtToken);
      localStorage.setItem("Expiration", tokenExpiry);
      //   console.log(jwtToken);

      return jwtToken;
    }
  } catch (error) {
    console.error("Error during authentication:", error);
  }
}

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
      const content = data.data;
      renderSections(content);
      //   console.log(content);
      // return content;
    }
  } catch (error) {
    console.error("Error fetching games:", error);
  }
};

async function checkTokenExpiration(token, tokenExpiry) {
  try {
    if (!token) {
      token = await auth();
      if (!token) {
        console.error("Token could not be gotten");
        return;
      }
    }

    // Get the current time (in seconds)
    const currentTime = Math.floor(Date.now() / 1000);
    const expiry = tokenExpiry;
    console.log(expiry, "here");
    console.log(currentTime, "there");

    // Check if the token is expired
    if (expiry < currentTime) {
      console.log("Token is expired");
      // Call the Auth endpoint to generate a new token
      token = await auth();
    } else {
      console.log("Token is valid");
    }
  } catch (e) {
    console.error("Error checking token:", e);
  }
}

const filterAndLimitGames = (games, limit) => {
  return games.slice(0, limit);
}

const renderCarousel = (games, selector) => {
  const container = document.querySelector(selector);
  container.innerHTML = '';
  games.forEach(game => {
    const gameHTML = `
      <a href="${game.playUrl}" class="slide">
        <img class="img" src="${escapeHTML(game.thumbnailUrl)}" alt="" />
        <div class="slide-title game-slide">
          <div>
            <p>${escapeHTML(game.name)}</p>
          </div>
          <div class="game-slide-play">
            <span>PLAY</span>
            <img src="assets//Polygon.svg" alt="polygon"/>
          </div>
        </div>
      </a>

    `
    container.insertAdjacentHTML('beforeend', gameHTML)
  });
}

const renderHomepage = (games, selector) => {
  const container = document.querySelector(selector);
  container.innerHTML = '';
  games.forEach(game => {
    const gameHTML = `
      <div>
       <a href="${game.playUrl}" class="item ">
         <img src="${escapeHTML(game.thumbnailUrl_Small)}" alt="Mouse Maze" />
          <div class="game-play">
           <span>PLAY</span>
           <img src="assets//Polygon.svg" alt="polygon">
          </div>
       </a>
       <p>${escapeHTML(game.name)}</p>
      </div>
    `
    container.insertAdjacentHTML('beforeend', gameHTML)
  });
};



const ShuffleContent = (games) => {
  // Shuffle the array first
  // const shuffledGames = shuffleArray(games);

  // Select the first 5 games for the carousel
  const carouselContent = games.slice(0, 5);

  // Select the next 9 games for the homepage
  const homepageContent = games.slice(5, 14);

  return { carouselContent, homepageContent };
};

const renderSections = (games) => {
  const { carouselContent, homepageContent } = ShuffleContent(games);
  renderCarousel(carouselContent, '.slides.games');
  renderHomepage(homepageContent, ".featured-games");
};

function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// function to Truncate the number of words
const truncateDescription = (description, wordLimit = 20) => {
  const words = description.split(' ');
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(' ') + '...';
  }
  return description;
};

login();
