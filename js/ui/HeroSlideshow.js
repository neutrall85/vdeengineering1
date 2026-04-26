/**
 * HeroSlideshow - покачивающееся слайд-шоу для hero секции
 * Автоматическое переключение слайдов с плавным переходом
 */
class HeroSlideshow {
  constructor() {
    this.container = document.querySelector('.slideshow-container');
    if (!this.container) return;
    
    this.slides = this.container.querySelectorAll('.slideshow-slide');
    this.currentSlide = 0;
    this.slideInterval = 4000; // 4 секунды между слайдами
    this.intervalId = null;
    this.boundMouseEnterHandler = null;
    this.boundMouseLeaveHandler = null;
    
    this.init();
  }
  
  init() {
    if (this.slides.length <= 1) return;
    
    this.startAutoPlay();
    
    // Пауза при наведении
    this.boundMouseEnterHandler = () => this.pause();
    this.boundMouseLeaveHandler = () => this.resume();
    this.container.addEventListener('mouseenter', this.boundMouseEnterHandler);
    this.container.addEventListener('mouseleave', this.boundMouseLeaveHandler);
  }
  
  startAutoPlay() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, this.slideInterval);
  }
  
  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  resume() {
    if (!this.intervalId) {
      this.startAutoPlay();
    }
  }
  
  nextSlide() {
    // Убираем активный класс с текущего слайда
    this.slides[this.currentSlide].classList.remove('active');
    
    // Вычисляем следующий слайд
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    
    // Добавляем активный класс следующему слайду
    this.slides[this.currentSlide].classList.add('active');
  }
  
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.boundMouseEnterHandler && this.container) {
      this.container.removeEventListener('mouseenter', this.boundMouseEnterHandler);
    }
    if (this.boundMouseLeaveHandler && this.container) {
      this.container.removeEventListener('mouseleave', this.boundMouseLeaveHandler);
    }
    this.boundMouseEnterHandler = null;
    this.boundMouseLeaveHandler = null;
    this.container = null;
    this.slides = null;
  }
}

// Инициализация после загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new HeroSlideshow();
  });
} else {
  new HeroSlideshow();
}
