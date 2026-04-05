/**
 * Управление навигацией
 * ООО "Волга-Днепр Инжиниринг"
 */

class NavigationManager {
  constructor() {
    this.scrollThreshold = window.CONFIG.NAVIGATION.SCROLL_HEADER_THRESHOLD;
    this.scrollTopThreshold = window.CONFIG.NAVIGATION.SCROLL_TOP_THRESHOLD;
    this.navbar = null;
    this.scrollToTopBtn = null;
    this.mobileMenu = null;
    this.scrollHandler = null;
  }

  init() {
    this.navbar = Utils.DOM.getElement('navbar');
    this.scrollToTopBtn = Utils.DOM.getElement('scrollToTop');
    this.mobileMenu = Utils.DOM.getElement('mobileMenu');
    
    this._initSmoothScroll();
    this._initScrollHandler();
    this._initMobileMenu();
    
    this._handleScroll();
  }

  _initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        
        const target = Utils.DOM.query(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          this._closeMobileMenu();
        }
      });
    });
  }

  _initScrollHandler() {
    let timeout;
    this.scrollHandler = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => this._handleScroll(), window.CONFIG.PERFORMANCE.SCROLL_DEBOUNCE_MS);
    };
    
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  _handleScroll() {
    const scrollY = window.scrollY;
    
    if (this.navbar) {
      if (scrollY > this.scrollThreshold) {
        Utils.DOM.addClass(this.navbar, 'scrolled');
      } else {
        Utils.DOM.removeClass(this.navbar, 'scrolled');
      }
    }
    
    if (this.scrollToTopBtn) {
      if (scrollY > this.scrollTopThreshold) {
        Utils.DOM.addClass(this.scrollToTopBtn, 'visible');
      } else {
        Utils.DOM.removeClass(this.scrollToTopBtn, 'visible');
      }
    }
  }

  _initMobileMenu() {
<<<<<<< HEAD
  this.mobileMenu = DOMHelper.getElement('mobileMenu');
  this.mobileMenuBtn = DOMHelper.query('.mobile-menu-btn');
  this.mobileMenuOverlay = DOMHelper.getElement('mobileMenuOverlay');
  const closeBtn = DOMHelper.getElement('mobileMenuClose');
  
  if (!this.mobileMenu) return;
  
  // Открытие меню
  if (this.mobileMenuBtn) {
    this.mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openMobileMenu();
    });
=======
    const menuBtn = Utils.DOM.query('.mobile-menu-btn');
    if (menuBtn) {
      menuBtn.addEventListener('click', () => this.toggleMobileMenu());
    }
    
    const closeBtn = Utils.DOM.query('.mobile-menu-close', this.mobileMenu);
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.toggleMobileMenu());
    }
>>>>>>> origin/main
  }
  
  // Закрытие через кнопку
  if (closeBtn) {
    closeBtn.addEventListener('click', () => this.closeMobileMenu());
  }
  
  // Закрытие по клику на оверлей
  if (this.mobileMenuOverlay) {
    this.mobileMenuOverlay.addEventListener('click', () => this.closeMobileMenu());
  }
  
  // Закрытие при изменении размера окна
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1048 && this.mobileMenu.classList.contains('active')) {
      this.closeMobileMenu();
    }
  });
}

<<<<<<< HEAD
openMobileMenu() {
  if (!this.mobileMenu) return;
  
  DOMHelper.addClass(this.mobileMenu, 'active');
  if (this.mobileMenuOverlay) DOMHelper.addClass(this.mobileMenuOverlay, 'active');
  if (this.mobileMenuBtn) DOMHelper.addClass(this.mobileMenuBtn, 'active');
  DOMHelper.toggleBodyScroll(true);
}

closeMobileMenu() {
  if (!this.mobileMenu) return;
  
  DOMHelper.removeClass(this.mobileMenu, 'active');
  if (this.mobileMenuOverlay) DOMHelper.removeClass(this.mobileMenuOverlay, 'active');
  if (this.mobileMenuBtn) DOMHelper.removeClass(this.mobileMenuBtn, 'active');
  DOMHelper.toggleBodyScroll(false);
}

toggleMobileMenu() {
  if (this.mobileMenu && this.mobileMenu.classList.contains('active')) {
    this.closeMobileMenu();
  } else {
    this.openMobileMenu();
=======
  toggleMobileMenu() {
    if (!this.mobileMenu) return;
    
    const isActive = Utils.DOM.hasClass(this.mobileMenu, 'active');
    
    if (isActive) {
      Utils.DOM.removeClass(this.mobileMenu, 'active');
      Utils.DOM.removeClass(this.navbar, 'mobile-menu-open');
      Utils.DOM.toggleBodyScroll(false);
    } else {
      Utils.DOM.addClass(this.mobileMenu, 'active');
      Utils.DOM.addClass(this.navbar, 'mobile-menu-open');
      Utils.DOM.toggleBodyScroll(true);
    }
  }

  _closeMobileMenu() {
    if (this.mobileMenu && Utils.DOM.hasClass(this.mobileMenu, 'active')) {
      Utils.DOM.removeClass(this.mobileMenu, 'active');
      Utils.DOM.removeClass(this.navbar, 'mobile-menu-open');
      Utils.DOM.toggleBodyScroll(false);
    }
>>>>>>> origin/main
  }
}

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  destroy() {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }
}

const navigationManager = new NavigationManager();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NavigationManager, navigationManager };
}