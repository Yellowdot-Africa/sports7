const slides = document.querySelectorAll('.slide');
const dotsContainer = document.querySelectorAll('.dots-container button');
const slidesContainer = document.querySelector('.slides');

let currentSlide = 0;
let currentIndex = 0;

// Function to update the slide position
function updateSlidePosition(index) {
    const offset = currentSlide * -100; // Move slides based on the current index
    slidesContainer.style.transform = `translateX(${offset}%)`;
    currentIndex = index;
    updateDots();
}

// Create dots dynamically based on slides
function createDots() {
    slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        dot.addEventListener('click', () => moveToSlide(i));
        dotsContainer.appendChild(dot);
    });
}

// Function to update active dot
function updateDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.style.backgroundColor = index === currentIndex ? '#10F4F7' : '#D9D9D9';
        dot.classList.toggle('active', index === currentSlide);
    });
}

// Event listeners for navigation buttons
document.querySelector('.prev').addEventListener('click', () => {
    currentSlide = (currentSlide > 0) ? currentSlide - 1 : slides.length - 1;
    updateSlidePosition();
    updateDots();
});

document.querySelector('.next').addEventListener('click', () => {
    currentSlide = (currentSlide < slides.length - 1) ? currentSlide + 1 : 0;
    updateSlidePosition();
    updateDots();
});

// Initialize
updateSlidePosition();
updateDots();
