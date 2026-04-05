/**
 * Объединённый UI модуль: ModalManager, NavigationManager, AnimationManager, FormManager, NewsManager, MapManager
 * ООО "Волга-Днепр Инжиниринг"
 */

const UI = (function() {
  // ========== Управление модальными окнами ==========
  class ModalManager {
    constructor() {
      this.modals = new Map();
      this.activeModal = null;
      this.cleanupHandlers = null;
      this._initGlobalHandlers();
    }

    register(key, config) {
      if (this.modals.has(key)) {
        console.warn(`Modal "${key}" already registered, overwriting`);
      }
      
      this.modals.set(key, {
        overlayId: config.overlayId,
        onOpen: config.onOpen || null,
        onClose: config.onClose || null,
        shouldFocus: config.shouldFocus !== false
      });
      
      this._setupOverlayClick(key);
      return this;
    }

    _setupOverlayClick(key) {
      const config = this.modals.get(key);
      if (!config) return;
      
      const overlay = Utils.DOM.getElement(config.overlayId);
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            this.close(key);
          }
        });
      }
    }

    _initGlobalHandlers() {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.activeModal) {
          this.close(this.activeModal);
        }
      });
    }

    open(key, options = {}) {
      const config = this.modals.get(key);
      if (!config) {
        console.warn(`Modal "${key}" not registered`);
        return false;
      }

      if (this.activeModal && this.activeModal !== key) {
        this.close(this.activeModal);
      }

      const overlay = Utils.DOM.getElement(config.overlayId);
      if (!overlay) return false;

      Utils.DOM.addClass(overlay, 'active');
      Utils.DOM.toggleBodyScroll(true);
      this.activeModal = key;

      if (config.shouldFocus) {
        this.cleanupHandlers = Utils.DOM.trapFocus(overlay);
        const focusTarget = options.focusSelector 
          ? Utils.DOM.query(options.focusSelector, overlay)
          : Utils.DOM.query('.modal-close, button, [href], input, select, textarea', overlay);
        
        if (focusTarget) {
          setTimeout(() => focusTarget.focus(), 100);
        }
      }

      if (config.onOpen) config.onOpen(overlay);
      if (options.onOpen) options.onOpen(overlay);

      Services.Services.eventBus.emit('modal:opened', { key, overlay });
      return true;
    }

    close(key) {
      const config = this.modals.get(key);
      if (!config) return false;

      const overlay = Utils.DOM.getElement(config.overlayId);
      if (!overlay) return false;

      Utils.DOM.removeClass(overlay, 'active');
      Utils.DOM.toggleBodyScroll(false);
      
      if (this.activeModal === key) {
        this.activeModal = null;
      }

      if (this.cleanupHandlers) {
        this.cleanupHandlers();
        this.cleanupHandlers = null;
      }

      if (config.onClose) config.onClose(overlay);
      Services.Services.eventBus.emit('modal:closed', { key });
      return true;
    }

    isOpen(key = null) {
      if (key) {
        return this.activeModal === key;
      }
      return this.activeModal !== null;
    }

    closeAll() {
      this.modals.forEach((_, key) => {
        this.close(key);
      });
    }
  }

  const modalManager = new ModalManager();
  
  return { ModalManager, modalManager };
})();

// Экспортируем только один глобальный объект
window.UI = UI;

// Регистрация модальных окон о нас и деталях (после того как UI определён)
UI.modalManager.register('about', { overlayId: 'aboutModalOverlay' });
UI.modalManager.register('details', { overlayId: 'detailsModalOverlay' });