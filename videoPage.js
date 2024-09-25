document.addEventListener("DOMContentLoaded", () => {
  let hash = window.location.hash;
  hash = hash ? hash.substring(1) : "";

  console.log("Hash:", hash);

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
  // function to retrive from local storage
  const retrieveFromStorage = () => {
      const savedData = localStorage.getItem("VideoList");
      if (savedData) {
          const videoList = JSON.parse(savedData);
          // console.log("Video List:", videoList);
          return videoList.data;
      }
      return [];
  };

  const ShuffleAndSplitContent = (data) => {
      const shuffledVideos = shuffleArray(data);
      return shuffledVideos.slice(0, 5);  // Get first 5 videos
  };

  function escapeHTML(str) {
      const div = document.createElement("div");
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
  }

  // function to render the main video
  const renderVideo = (link, selector) => {
      const container = document.querySelector(selector);
      container.innerHTML = "";

      const videoLink = link ? link : "defaultVideo.mp4";  // Fallback in case link is undefined

      const videoHTML = `
          <video class='main-video' controls>
              <source src="${videoLink}" type="video/mp4">
              Your browser does not support the video tag.
          </video>
      `;
      container.insertAdjacentHTML("beforeend", videoHTML);
  };

  // function to render Homepage
  const renderHomepage = (videos, selector) => {
      const container = document.querySelector(selector);
      container.innerHTML = "";

      videos.forEach((game, index) => {
          const gameHTML = `
              <a href="#${escapeHTML(game.downloadUrl)}" class="video video-item">
                  <img src="${escapeHTML(game.thumbnailUrl)}" alt="Video Thumbnail" />
                  <div class="video-title">
                      <p>${escapeHTML(game.name)}</p>
                  </div>
              </a>
          `;

          container.insertAdjacentHTML("beforeend", gameHTML);

          const videoItem = container.lastElementChild;
          videoItem.addEventListener("click", (event) => {
              event.preventDefault();
              const videoUrl = game.downloadUrl;

              if (!videoUrl) {
                  console.error("Video URL is undefined for video:", game);  // Log undefined URLs
                  return;  // Skip if no valid URL
              }

              renderVideo(videoUrl, ".video-container");
          });
      });
  };


  // putting it all together
  const videoList = retrieveFromStorage();
  if (videoList) {
      const shuffledVideos = ShuffleAndSplitContent(videoList);

      if (hash) {
          renderVideo(hash, ".video-container");
      } else {
          renderVideo(shuffledVideos[0].downloadUrl, ".video-container");
      }

      renderHomepage(shuffledVideos, ".more-video");
  }
});
