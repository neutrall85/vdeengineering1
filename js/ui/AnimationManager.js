/**
 * Управление анимациями
 * ООО "Волга-Днепр Инжиниринг"
 */

class AnimationManager {
  constructor() {
    this.observers = [];
    this.counterObserver = null;
    this.fadeObserver = null;
  }

  init() {
    // Небольшая задержка чтобы убедиться что элементы загружены
    setTimeout(() => {
      this._initFadeInObserver();
      this._initCounters();
      console.log('AnimationManager initialized');
    }, 50);
  }

  _initFadeInObserver() {
    const options = {
      threshold: window.CONFIG?.ANIMATION?.OBSERVER_THRESHOLD || 0.1,
      rootMargin: window.CONFIG?.ANIMATION?.ROOT_MARGIN || '50px'
    };

    this.fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (window.Utils && window.Utils.DOM) {
            window.Utils.DOM.addClass(entry.target, 'visible');
          } else {
            entry.target.classList.add('visible');
          }
          this.fadeObserver.unobserve(entry.target);
        }
      });
    }, options);

    const elements = window.Utils && window.Utils.DOM 
      ? window.Utils.DOM.queryAll('.fade-in')
      : document.querySelectorAll('.fade-in');
    
    elements.forEach(el => {
      this.fadeObserver.observe(el);
    });
    
    this.observers.push(this.fadeObserver);
  }

  _initCounters() {
    const counters = window.Utils && window.Utils.DOM 
      ? window.Utils.DOM.queryAll('.stat-number')
      : document.querySelectorAll('.stat-number');
    
    if (counters.length === 0) return;

    // Сразу устанавливаем финальные значения для режима чтения
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      if (target && !isNaN(target)) {
        counter.textContent = target;
      }
    });

    this.counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Для анимации сбрасываем к 0 и запускаем анимацию
          const element = entry.target;
          const target = parseInt(element.getAttribute('data-target'), 10);
          if (target && !isNaN(target)) {
            element.textContent = '0';
            this._animateCounter(element);
          }
          this.counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => this.counterObserver.observe(counter));
    this.observers.push(this.counterObserver);
  }

  _animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'), 10);
    if (!target || isNaN(target)) return;

    let current = 0;
    const steps = window.CONFIG?.ANIMATION?.COUNTER_STEPS || 100;
    const step = target / steps;
    
    const update = () => {
      current += step;
      if (current < target) {
        element.textContent = Math.floor(current);
        requestAnimationFrame(update);
      } else {
        element.textContent = target;
      }
    };
    
    update();
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

const animationManager = new AnimationManager();
window.animationManager = animationManager;

window.AnimationManager = AnimationManager;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AnimationManager, animationManager };
}