/**
 * Управление модальными окнами
 * ООО "Волга-Днепр Инжиниринг"
 * 
 * Единая точка управления закрытием модалок:
 * - Клик по кнопке закрытия (.modal-close)
 * - Клик вне области модалки (по overlay)
 * - Нажатие клавиши Escape
 */

class ModalManager {
  constructor() {
    this.modals = new Map();
    this.activeModal = null;
    this.cleanupHandlers = new Map();
    this._boundKeyHandler = null;
    this._initGlobalHandlers();
  }

  register(key, config) {
    this.modals.set(key, {
      overlayId: config.overlayId,
      onOpen: config.onOpen || null,
      onClose: config.onClose || null,
      focusSelector: config.focusSelector || null
    });
    this._setupOverlayClick(key);
    return this;
  }

  /**
   * Настраивает клик по overlay для закрытия модалки
   * Клик обрабатывается только если цель - сам overlay (а не контент внутри)
   */
  _setupOverlayClick(key) {
    const config = this.modals.get(key);
    if (!config) return;
    const overlay = document.getElementById(config.overlayId);
    if (overlay && !overlay._clickHandlerAttached) {
      const clickHandler = (e) => {
        if (e.target === overlay) {
          this.close(key);
        }
      };
      overlay.addEventListener('click', clickHandler);
      overlay._clickHandlerAttached = true;
      overlay._clickHandler = clickHandler;
    }
  }

  /**
   * Инициализирует глобальные обработчики событий:
   * - KeyboardEvent (Escape) для закрытия активной модалки
   * - ClickEvent для кнопок .modal-close
   */
  _initGlobalHandlers() {
    // Обработчик нажатия клавиш (Escape)
    this._boundKeyHandler = (e) => {
      if (e.key !== 'Escape') return;
      
      // Закрываем активную модалку через ModalManager
      if (this.activeModal) {
        this.close(this.activeModal);
        return;
      }
      
      // Fallback для policy modal (если не зарегистрирована в ModalManager)
      const policyModal = document.getElementById('policyModalOverlay');
      if (policyModal && policyModal.classList.contains('active')) {
        if (typeof ComponentLoader !== 'undefined') {
          ComponentLoader.closePolicyModal();
        }
      }
    };
    document.addEventListener('keydown', this._boundKeyHandler);

    // Делегированный обработчик кликов по кнопкам закрытия
    this._boundClickHandler = (e) => {
      const closeBtn = e.target.closest('.modal-close');
      if (!closeBtn) return;
      
      const overlay = closeBtn.closest('.modal-overlay');
      if (!overlay) return;
      
      const overlayId = overlay.id;
      const modalKeyMap = {
        'modalOverlay': 'form',
        'detailsModalOverlay': 'details',
        'newsModalOverlay': 'news',
        'proposalModalOverlay': 'proposal',
        'universalApplicationModalOverlay': 'universal',
        'aboutModalOverlay': 'about',
        'projectModalOverlay': 'project',
        'serviceModalOverlay': 'service',
        'policyModalOverlay': 'policy'
      };
      
      const modalKey = modalKeyMap[overlayId];
      
      // Закрываем через ModalManager если модалка зарегистрирована
      if (modalKey && this.modals.has(modalKey)) {
        this.close(modalKey);
      } else if (overlayId === 'policyModalOverlay' && typeof ComponentLoader !== 'undefined') {
        ComponentLoader.closePolicyModal();
      } else if (overlayId === 'universalApplicationModalOverlay' && typeof window.closeUniversalApplicationModal === 'function') {
        window.closeUniversalApplicationModal();
      } else {
        // Fallback для незарегистрированных модалок
        overlay.classList.remove('active');
        ScrollManager.unlock();
      }
    };
    document.addEventListener('click', this._boundClickHandler);
  }

  open(key, options = {}) {
    const config = this.modals.get(key);
    if (!config) {
      Logger.WARN(`Modal "${key}" not registered`);
      return false;
    }

    // Синхронная проверка – предотвращает повторные вызовы
    if (this.activeModal === key) {
      return true;
    }

    if (this.activeModal && this.activeModal !== key) {
      this.close(this.activeModal);
    }

    const overlay = document.getElementById(config.overlayId);
    if (!overlay) return false;

    // ✅ Устанавливаем активное окно синхронно
    this.activeModal = key;

    // Блокируем скролл через централизованный ScrollManager
    ScrollManager.lock();

    setTimeout(() => {
      overlay.classList.add('active');

      if (key === 'form' && window.formManager) {
        window.formManager.initFileUploadOnModalOpen();
      }

      const focusTarget = options.focusSelector 
        ? document.querySelector(options.focusSelector)
        : config.focusSelector
          ? overlay.querySelector(config.focusSelector)
          : overlay.querySelector('.modal-close, button, [href], input, select, textarea');
      
      if (focusTarget) {
        setTimeout(() => focusTarget.focus(), 100);
      }

      if (config.onOpen) config.onOpen(overlay);
      if (options.onOpen) options.onOpen(overlay);

      if (window.Services?.eventBus) {
        window.Services.eventBus.emit('modal:opened', { key, overlay });
      }
    }, 50);
    
    return true;
  }

  close(key) {
    const config = this.modals.get(key);
    if (!config) return false;

    if (this.activeModal !== key) return false;

    const overlay = document.getElementById(config.overlayId);
    if (!overlay) return false;

    overlay.classList.remove('active');
    
    // Разблокируем скролл через ScrollManager
    ScrollManager.unlock();
    
    this.activeModal = null;

    if (config.onClose) config.onClose(overlay);
    if (window.Services?.eventBus) {
      window.Services.eventBus.emit('modal:closed', { key });
    }
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
  
  /**
   * Очистка ресурсов при уничтожении
   */
  destroy() {
    if (this._boundKeyHandler) {
      document.removeEventListener('keydown', this._boundKeyHandler);
    }
    if (this._boundClickHandler) {
      document.removeEventListener('click', this._boundClickHandler);
    }
    this.modals.clear();
    this.activeModal = null;
  }
}

const modalManager = new ModalManager();

window.UI = window.UI || {};
window.UI.modalManager = modalManager;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ModalManager, modalManager };
}