document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelector('.slides');
    const allSlides = document.querySelectorAll('.slide');
    const nextButton = document.querySelector('.next');
    const prevButton = document.querySelector('.prev');
    const dotsContainer = document.querySelector('.dots-container');

    let currentIndex = 0;

    // Function to create dots
    function createDots() {
        for (let i = 0; i < allSlides.length; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dot.addEventListener('click', () => moveToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    // Function to update dots
    function updateDots() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.style.backgroundColor = index === currentIndex ? '#10F4F7' : '#D9D9D9';
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
    nextButton.addEventListener('click', () => {
        if (currentIndex < allSlides.length - 1) {
            moveToSlide(currentIndex + 1);
        } else {
            moveToSlide(0); // Loop back to first slide
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            moveToSlide(currentIndex - 1);
        } else {
            moveToSlide(allSlides.length - 1); // Loop to last slide
        }
    });

    // Disable swipe
    slides.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });

    createDots();
    updateDots(); // Initial dot update
});
