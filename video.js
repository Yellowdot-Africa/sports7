const video_URL = "https://ydvassdp.com:5001/api/YellowdotGames/Sports7/GetVideos"

const carousel = document.querySelector(".carousel");

// function to get the token
const login = async () => {
  let jwtToken = localStorage.getItem("Token");
  let tokenExpiry = localStorage.getItem("Expiration");

  await checkTokenExpiration(jwtToken, tokenExpiry);

  if (!jwtToken) {
    // console.log(jwtToken);
    jwtToken = await auth();
  };

  if (jwtToken) {
    const data = await getContent(video_URL, jwtToken);
    if (data) {
      // const carousel = document.querySelector(".carousel");
      //carousel.classList.remove(".hidden");
      console.log(data);
      console.log("Module is working");
      initializeCarousel();
    }
  }

  //   const data2 = await getContent(games_URL, jwtToken);

};

// function to get token and authorize
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
// function to get content
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
    localStorage.setItem("VideoList", JSON.stringify(data))
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

// function to check if token is expired or nahh
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

// function to render the content
const renderSections = (games) => {
  const { carouselContent, homepageContent } = ShuffleContent(games);
  renderCarousel(carouselContent, ".slides");
  renderHomepage(homepageContent, ".feature-video");
  document.querySelector(".carousel").classList.remove("hidden");
};


// Shuffle to randomize the array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// split the data
const ShuffleContent = (games) => {
  // Shuffle the array first
  const shuffledGames = shuffleArray(games);

  // Select the first 5 games for the carousel
  const carouselContent = shuffledGames.slice(0, 5);

  // Select the next 9 games for the homepage
  const homepageContent = shuffledGames.slice(5, 10);

  return { carouselContent, homepageContent };
};

// function to render the HomePage data
const renderHomepage = (games, selector) => {
  const container = document.querySelector(selector);
  container.innerHTML = "";
  games.forEach((game) => {
    const gameHTML = `
        <a href="/video-page.html#${escapeHTML(game.downloadUrl)}" class="video video-item">
            <img src="${escapeHTML(
              game.thumbnailUrl
            )}" alt="Featured Video 1" />
            <div class="video-title">
                <p>${escapeHTML(game.name)}</p>
                <p class="video-desc"></p>
            </div>
        </a>
         `;
    container.insertAdjacentHTML("beforeend", gameHTML);
  });
};

// function to render the carousel
const renderCarousel = (games, selector) => {
  const container = document.querySelector(selector);
  container.innerHTML = "";
  games.forEach((game) => {
    const gameHTML = `
        <a href="/video-page.html#${escapeHTML(game.downloadUrl)}" class="video slide">
            <img src="${escapeHTML(
              game.thumbnailUrl
            )}" class="img" id="${escapeHTML(game.id)}">
            <div class="play-btn"></div>
            <div class="slide-title">
              <h4>${escapeHTML(game.name)}</h4>
            </div>
            </img>
        </a>
        `;
    container.insertAdjacentHTML("beforeend", gameHTML);
  });
};


// function to truncate the description
const truncateDescription = (description, wordLimit = 20) => {
  const words = description.split(" ");
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(" ") + "...";
  }
  return description;
};

function escapeHTML(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}


// function to initialize the carousel
const initializeCarousel = () => {
  const slides = document.querySelector(".slides");
  const allSlides = document.querySelectorAll(".slide");
  const nextButton = document.querySelector(".next");
  const prevButton = document.querySelector(".prev");
  const dotsContainer = document.querySelector(".dots-container");

  let currentIndex = 0;

  // Function to create dots
  function createDots() {
    for (let i = 0; i < allSlides.length; i++) {
      const dot = document.createElement("span");
      dot.classList.add("dot");
      dot.addEventListener("click", () => moveToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  // Function to update dots
  function updateDots() {
    const dots = document.querySelectorAll(".dot");
    dots.forEach((dot, index) => {
      dot.style.backgroundColor =
        index === currentIndex ? "#10F4F7" : "#D9D9D9";
    });
  }

  // Function to move slide
  function moveToSlide(index) {
    const slideWidth = allSlides[0].getBoundingClientRect().width;
    slides.style.transform = `translateX(-${index * slideWidth}px)`;
    currentIndex = index;
    updateDots();
  }

  // Button event listeners
  nextButton.addEventListener("click", () => {
    console.log("I was clicked");
    
    if (currentIndex < allSlides.length - 1) {
      moveToSlide(currentIndex + 1);
    } else {
      moveToSlide(0); // Loop back to first slide
    }
  });

  prevButton.addEventListener("click", () => {
    console.log("I was clicked");

    if (currentIndex > 0) {
      moveToSlide(currentIndex - 1);
    } else {
      moveToSlide(allSlides.length - 1); // Loop to last slide
    }
  });

  // Disable swipe
  slides.addEventListener("touchstart", (e) => e.preventDefault(), {
    passive: false,
  });

  // Initial dot update

  createDots();
  updateDots();
};

//  function to create a new tab and pass the video URL to it
// function openVideoInNewTab(videoUrl) {
//   const newTab = window.open(`videoPage.html?videoUrl=${encodeURIComponent(videoUrl)}`, "_blank");
// }

//  Getting the video url and calling it
// document.querySelectorAll(".video").forEach((slide) => {
//   slide.addEventListener("click", (event) => {
//     const videoUrl = event.target.getAttribute("data-video-url");
//     openVideoInNewTab(videoUrl);
//   });
// });


document.addEventListener('DOMContentLoaded', function () {
  login();

});


