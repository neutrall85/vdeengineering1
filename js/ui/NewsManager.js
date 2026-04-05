/**
 * Управление новостями
 * ООО "Волга-Днепр Инжиниринг"
 */

class NewsManager {
  constructor(newsData, renderer) {
    this.newsData = newsData;
    this.renderer = renderer;
    this.activeYear = null;
  }

  init() {
    this._initTabs();
    this._initModal();
    this._initCardClickHandler();
  }

  _initTabs() {
    const tabs = Utils.DOM.queryAll('.news-tab');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const year = tab.dataset.year;
        if (!year) return;
        
        tabs.forEach(t => Utils.DOM.removeClass(t, 'active'));
        Utils.DOM.addClass(tab, 'active');
        
        Utils.DOM.queryAll('.news-tab-content').forEach(content => {
          Utils.DOM.removeClass(content, 'active');
        });
        
        const activeContent = Utils.DOM.getElement(`tab-${year}`);
        if (activeContent) {
          Utils.DOM.addClass(activeContent, 'active');
        }
        
        this.activeYear = year;
        const container = Utils.DOM.getElement(`newsGrid-${year}`);
        if (container) {
          this.renderer.render(year, container);
        }
      });
    });
    
    const activeTab = Utils.DOM.query('.news-tab.active');
    if (activeTab?.dataset.year) {
      setTimeout(() => {
        const year = activeTab.dataset.year;
        const container = Utils.DOM.getElement(`newsGrid-${year}`);
        if (container) {
          this.renderer.render(year, container);
        }
        this.activeYear = year;
      }, 100);
    }
  }

  _initModal() {
    UI.modalManager.register('news', {
      overlayId: 'newsModalOverlay',
      onClose: () => {
        this._resetModalContent();
      }
    });
  }

  _initCardClickHandler() {
    document.addEventListener('click', (e) => {
      const button = e.target.closest('.news-card-link');
      if (button) {
        const newsId = parseInt(button.dataset.newsId, 10);
        if (newsId) {
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
    UI.modalManager.open('news');
  }

  _populateModal(news) {
    const title = Utils.DOM.getElement('newsModalTitle');
    const date = Utils.DOM.getElement('newsModalDate');
    const category = Utils.DOM.getElement('newsModalCategory');
    const image = Utils.DOM.getElement('newsModalImage');
    const content = Utils.DOM.getElement('newsModalContent');
    
    if (title) title.textContent = news.title;
    if (date) date.textContent = news.date;
    if (category) category.textContent = news.category;
    if (image) {
      image.src = news.image;
      image.alt = news.title;
    }
    if (content) content.innerHTML = news.content;
  }

  _resetModalContent() {
    const image = Utils.DOM.getElement('newsModalImage');
    if (image) image.src = '';
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = NewsManager;
}