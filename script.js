let currentSlide = 0;
const slidesContainer = document.querySelector('.slides');
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dots-container button');

function updateSlidePosition() {
    slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function updateDots() {
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

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

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentSlide = index;
        updateSlidePosition();
        updateDots();
    });
});

updateSlidePosition();
updateDots();
