/**
 * Управление новостями
 * ООО "Волга-Днепр Инжиниринг"
 */

class NewsManager {
  constructor(newsData, renderer) {
    this.newsData = newsData;
    this.renderer = renderer;
    this.activeYear = null;
    this.lightboxOverlay = null;
    this.lightboxImage = null;
    // Ссылки на обработчики для последующего удаления
    this.boundLightboxKeyHandler = null;
    this.boundLightboxOverlayClick = null;
    this.boundModalImageClick = null;
    this.boundLightboxImageClick = null;
    this.boundCardClickHandler = null;
    this.boundLoadHandler = null;
  }

  init() {
    Logger.INFO('NewsManager initializing...');
    this._initTabs();
    this._initModal();
    this._initCardClickHandler();
    
    // Инициализация лайтбокса после полной загрузки DOM
    if (document.readyState === 'complete') {
      this._initLightbox();
    } else {
      this.boundLoadHandler = () => this._initLightbox();
      window.addEventListener('load', this.boundLoadHandler);
    }
  }

  _initLightbox() {
    this.lightboxOverlay = document.getElementById('lightboxOverlay');
    this.lightboxImage = document.getElementById('lightboxImage');
    const closeBtn = document.getElementById('lightboxCloseBtn');

    if (!this.lightboxOverlay || !this.lightboxImage) {
      Logger.WARN('Lightbox elements not found');
      return;
    }

    // Клик по изображению в модалке новостей открывает лайтбокс
    const modalImage = document.getElementById('newsModalImage');
    if (modalImage) {
      this.boundModalImageClick = () => {
        if (modalImage.src && modalImage.src !== window.location.href + '#') {
          this.openLightbox(modalImage.src, modalImage.alt);
        }
      };
      modalImage.addEventListener('click', this.boundModalImageClick);
      modalImage.style.cursor = 'zoom-in';
    }

    // Закрытие лайтбокса по кнопке
    if (closeBtn) {
      this._boundLightboxCloseClick = () => this.closeLightbox();
      closeBtn.addEventListener('click', this._boundLightboxCloseClick);
    }

    // Закрытие лайтбокса по клику на оверлей
    this.boundLightboxOverlayClick = (e) => {
      if (e.target === this.lightboxOverlay) {
        this.closeLightbox();
      }
    };
    this.lightboxOverlay.addEventListener('click', this.boundLightboxOverlayClick);

    // Закрытие по Escape
    this.boundLightboxKeyHandler = (e) => {
      if (e.key === 'Escape' && this.lightboxOverlay.classList.contains('active')) {
        this.closeLightbox();
      }
    };
    document.addEventListener('keydown', this.boundLightboxKeyHandler);

    Logger.INFO('Lightbox initialized');
  }

  openLightbox(imageSrc, imageAlt) {
    if (!this.lightboxOverlay || !this.lightboxImage) return;

    this.lightboxImage.src = imageSrc;
    this.lightboxImage.alt = imageAlt || 'Изображение новости';
    this.lightboxOverlay.classList.add('active');
    
    // Не блокируем скролл повторно, если он уже заблокирован (например, модальным окном новости)
    // ScrollManager использует счётчик блокировок, поэтому дополнительный lock() не нужен
    // Если лайтбокс открыт самостоятельно (не из модалки), то блокируем скролл
    if (window.ScrollManager && !window.ScrollManager.isLocked()) {
      ScrollManager.lock();
    }
    
    // Добавляем закрытие по клику на изображение через addEventListener
    this.boundLightboxImageClick = () => this.closeLightbox();
    this.lightboxImage.addEventListener('click', this.boundLightboxImageClick);
    
    // Фокус на кнопку закрытия для доступности
    const closeBtn = document.getElementById('lightboxCloseBtn');
    if (closeBtn) {
      setTimeout(() => closeBtn.focus(), 100);
    }

    Logger.INFO('Lightbox opened');
  }

  closeLightbox() {
    if (!this.lightboxOverlay) return;

    this.lightboxOverlay.classList.remove('active');
    
    // Используем только ScrollManager для восстановления скролла
    if (window.ScrollManager) {
      ScrollManager.unlock();
    } else {
      Logger.WARN('ScrollManager not available for news lightbox close');
    }
    
    // Удаляем обработчик клика по изображению
    if (this.lightboxImage && this.boundLightboxImageClick) {
      this.lightboxImage.removeEventListener('click', this.boundLightboxImageClick);
      this.boundLightboxImageClick = null;
    }
    
    // Очищаем src после анимации
    setTimeout(() => {
      if (this.lightboxImage) {
        this.lightboxImage.src = '';
      }
    }, 300);

    Logger.INFO('Lightbox closed');
  }

  _initTabs() {
    const tabs = document.querySelectorAll('.news-tab');
    
    if (tabs.length === 0) {
      Logger.INFO('No news tabs found');
      return;
    }
    
    // Сохраняем обработчики для последующего удаления
    this._tabClickHandlers = new Map();
    
    tabs.forEach(tab => {
      const clickHandler = (e) => {
        const year = tab.dataset.year;
        if (!year) return;
        
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.news-tab-content').forEach(content => {
          content.classList.remove('active');
        });
        
        const activeContent = document.getElementById(`tab-${year}`);
        if (activeContent) {
          activeContent.classList.add('active');
        }
        
        this.activeYear = year;
        const container = document.getElementById(`newsGrid-${year}`);
        if (container && this.renderer) {
          this.renderer.render(year, container);
        }
      };
      
      tab.addEventListener('click', clickHandler);
      this._tabClickHandlers.set(tab, clickHandler);
    });
    
    // Активируем первый таб и загружаем новости
    const activeTab = document.querySelector('.news-tab.active');
    if (activeTab?.dataset.year) {
      setTimeout(() => {
        const year = activeTab.dataset.year;
        const container = document.getElementById(`newsGrid-${year}`);
        if (container && this.renderer) {
          this.renderer.render(year, container);
        }
        this.activeYear = year;
      }, 100);
    } else if (tabs[0]) {
      // Если нет активного таба, активируем первый
      tabs[0].classList.add('active');
      const year = tabs[0].dataset.year;
      const container = document.getElementById(`newsGrid-${year}`);
      if (container && this.renderer) {
        this.renderer.render(year, container);
      }
      this.activeYear = year;
    }
  }

  _initModal() {
    // Модальное окно уже зарегистрировано в app.js
    Logger.INFO('News modal ready');
  }

  _initCardClickHandler() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('.news-card-link');
      if (link) {
        const newsId = parseInt(link.dataset.newsId, 10);
        
        if (newsId) {
          e.preventDefault();
          this.openNewsModal(newsId);
        }
      }
    });
  }

  openNewsModal(id) {
    const allNews = Object.values(this.newsData).flat();
    const news = allNews.find(n => n.id === id);
    
    if (!news) return;
    
    this._populateModal(news);
    
    const manager = (typeof modalManager !== 'undefined') ? modalManager : (window.App?.services?.modalManager);
    if (manager) {
      manager.open('news');
    } else {
      Logger.WARN('ModalManager not available');
    }
  }

  closeNewsModal() {
    const manager = (typeof modalManager !== 'undefined') ? modalManager : (window.App?.services?.modalManager);
    if (manager) {
      manager.close('news');
    }
  }

  _populateModal(news) {
    const title = document.getElementById('newsModalTitle');
    const date = document.getElementById('newsModalDate');
    const category = document.getElementById('newsModalCategory');
    const image = document.getElementById('newsModalImage');
    const content = document.getElementById('newsModalContent');
    
    // Используем санитизацию для безопасности
    const sanitizer = window.Utils?.Sanitizer;
    
    if (title) title.textContent = sanitizer ? sanitizer.escapeHtml(news.title) : news.title;
    if (date) date.textContent = sanitizer ? sanitizer.escapeHtml(news.date) : news.date;
    if (category) category.textContent = sanitizer ? sanitizer.escapeHtml(news.category) : news.category;
    if (image) {
      const imageUrl = sanitizer ? (sanitizer.isValidUrl(news.image) ? news.image : 'assets/images/placeholder.jpg') : news.image;
      image.src = imageUrl;
      image.alt = sanitizer ? sanitizer.escapeHtml(news.title) : news.title;
    }
    if (content) {
      // Очищаем контейнер
      content.replaceChildren();
      
      const safeContent = sanitizer ? sanitizer.sanitizeHtml(news.content, {
        allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'span', 'div']
      }) : news.content;
      
      // Создаём временный элемент для парсинга БЕЗОПАСНОГО HTML
      // Поскольку контент уже прошёл санитизацию, innerHTML здесь допустим
      // Но мы сразу клонируем узлы без событий
      const tempDiv = document.createElement('div');
      tempDiv.textContent = safeContent; // Используем textContent для полной безопасности
      
      // Если нужен HTML, используем подход с созданием элементов вручную
      // Для простого текста достаточно textContent выше
      // Если контент содержит разрешённые теги, создаём структуру вручную
      if (safeContent.includes('<')) {
        // Фоллбэк: создаём элемент и вставляем текст, если есть теги - парсим аккуратно
        const parser = new DOMParser();
        const doc = parser.parseFromString(safeContent, 'text/html');
        Array.from(doc.body.childNodes).forEach(node => {
          content.appendChild(node.cloneNode(true));
        });
      } else {
        content.appendChild(document.createTextNode(safeContent));
      }
    }
  }

  _resetModalContent() {
    const image = document.getElementById('newsModalImage');
    if (image) image.src = '';
  }

  /**
   * Очистка ресурсов при уничтожении
   */
  destroy() {
    // Удаляем обработчик load если он был добавлен
    if (this.boundLoadHandler) {
      window.removeEventListener('load', this.boundLoadHandler);
    }
    
    // Удаляем обработчики лайтбокса
    if (this.boundLightboxKeyHandler) {
      document.removeEventListener('keydown', this.boundLightboxKeyHandler);
    }
    if (this.boundLightboxOverlayClick && this.lightboxOverlay) {
      this.lightboxOverlay.removeEventListener('click', this.boundLightboxOverlayClick);
    }
    if (this._boundLightboxCloseClick) {
      const closeBtn = document.getElementById('lightboxCloseBtn');
      if (closeBtn) {
        closeBtn.removeEventListener('click', this._boundLightboxCloseClick);
      }
    }
    if (this.boundModalImageClick) {
      const modalImage = document.getElementById('newsModalImage');
      if (modalImage) {
        modalImage.removeEventListener('click', this.boundModalImageClick);
      }
    }
    if (this.boundLightboxImageClick && this.lightboxImage) {
      this.lightboxImage.removeEventListener('click', this.boundLightboxImageClick);
    }
    
    // Очищаем ссылки на DOM-элементы
    this.lightboxOverlay = null;
    this.lightboxImage = null;
    this.newsData = null;
    this.renderer = null;
  }
}

// Экспорт удален - регистрация происходит через Application.services

if (typeof module !== 'undefined' && module.exports) {
  module.exports = NewsManager;
}