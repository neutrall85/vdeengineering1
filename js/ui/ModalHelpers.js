/**
 * ModalHelpers - утилиты для работы с модальными окнами
 * ООО "Волга-Днепр Инжиниринг"
 * 
 * Единая точка входа для всех операций с модальными окнами:
 * - ModalHelpers.open(key, options) - открытие модалки
 * - ModalHelpers.close(key) - закрытие модалки
 * - ModalHelpers.isOpen(key) - проверка состояния
 * - ModalHelpers.closeAll() - закрытие всех модалок
 * 
 * Все остальные способы открытия/закрытия модалок считаются устаревшими
 */

const ModalHelpers = {
  /**
   * Инициализация обработчиков для data-атрибутов
   * Автоматически находит все элементы с [data-modal-open] и вешает обработчики
   */
  init() {
    this._setupModalOpenHandlers();
    this._setupGlobalFunctions();
    Logger.INFO('ModalHelpers initialized');
  },

  /**
   * Настройка обработчиков для элементов с data-modal-open
   * Поддерживаемые значения: proposal, application
   */
  _setupModalOpenHandlers() {
    document.addEventListener('click', (e) => {
      // Обработка кнопки открытия КП
      const proposalTrigger = e.target.closest('[data-modal-open="proposal"]');
      if (proposalTrigger) {
        e.preventDefault();
        this.open('proposal');
        return;
      }

      // Обработка кнопки отклика на вакансию
      const applicationTrigger = e.target.closest('[data-modal-open="application"]');
      if (applicationTrigger) {
        e.preventDefault();
        this.openApplicationModal(applicationTrigger);
        return;
      }
    });
  },

  /**
   * Настройка глобальных функций для обратной совместимости
   * Все глобальные функции делегируют вызовы к ModalHelpers
   */
  _setupGlobalFunctions() {
    // Глобальная функция открытия основной формы
    window.openModal = () => this.open('form');

    // Глобальная функция закрытия основной формы
    window.closeModal = () => this.close('form');
    
    // Глобальные функции для специфичных модалок (обратная совместимость)
    window.openDetailsModal = (title, details) => {
      const modalTitle = document.getElementById('detailsModalTitle');
      const modalList = document.getElementById('detailsModalList');
      
      if (modalTitle && modalList) {
        const sanitizer = window.Utils?.Sanitizer;
        modalTitle.textContent = sanitizer ? sanitizer.escapeHtml(title) : title;
        
        modalList.replaceChildren();
        const ul = document.createElement('ul');
        details.forEach(item => {
          const li = document.createElement('li');
          li.textContent = sanitizer ? sanitizer.escapeHtml(item) : item;
          ul.appendChild(li);
        });
        modalList.appendChild(ul);
        this.open('details');
      }
    };
    
    window.closeAboutModal = () => this.close('about');
    window.closeDetailsModal = () => this.close('details');
    window.closeNewsModal = () => this.close('news');
    window.closePolicyModal = () => this.close('policy');
    window.closeServiceModal = () => this.close('service');
    window.closeProjectModal = () => this.close('project');
  },

  /**
   * Получение экземпляра ModalManager с фоллбэком
   * @returns {ModalManager|null}
   */
  _getManager() {
    return (typeof modalManager !== 'undefined') 
      ? modalManager 
      : (window.App?.services?.modalManager || null);
  },

  /**
   * Универсальный метод открытия модалки по ключу
   * @param {string} key - ключ модалки (form, proposal, news, details, universal, policy, project, service, about)
   * @param {Object} options - опции для открытия { keepParentModal, focusSelector, onOpen }
   * @returns {boolean}
   */
  open(key, options = {}) {
    const manager = this._getManager();
    if (manager) {
      return manager.open(key, options);
    }
    Logger.WARN(`ModalManager not available for key: ${key}`);
    return false;
  },

  /**
   * Универсальный метод закрытия модалки по ключу
   * @param {string} key - ключ модалки
   * @returns {boolean}
   */
  close(key) {
    const manager = this._getManager();
    if (manager) {
      return manager.close(key);
    }
    Logger.WARN(`ModalManager not available for key: ${key}`);
    return false;
  },

  /**
   * Проверка состояния модалки
   * @param {string|null} key - ключ модалки или null для любой активной
   * @returns {boolean}
   */
  isOpen(key = null) {
    const manager = this._getManager();
    if (manager) {
      return manager.isOpen(key);
    }
    return false;
  },

  /**
   * Закрытие всех модалок
   */
  closeAll() {
    const manager = this._getManager();
    if (manager) {
      manager.closeAll();
    }
  },

  /**
   * Открытие универсального модального окна заявки/отклика
   * @param {HTMLElement} triggerElement - элемент, вызвавший модалку
   */
  openApplicationModal(triggerElement) {
    if (typeof window.openApplicationModal === 'function') {
      window.openApplicationModal(triggerElement);
    } else {
      Logger.WARN('openApplicationModal function not available');
    }
  },

  /**
   * Открытие модального окна политики
   * @param {string} policyKey - ключ политики (terms, privacy, personal-data, cookies)
   * @param {boolean} keepParentModal - если true, не закрывать родительскую модалку
   */
  openPolicyModal(policyKey, keepParentModal = true) {
    if (typeof PolicyModalManager !== 'undefined') {
      PolicyModalManager.openPolicyModal(policyKey, keepParentModal);
    } else {
      Logger.WARN('PolicyModalManager not available');
    }
  }
};

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModalHelpers;
}
