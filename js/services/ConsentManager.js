/**
 * Менеджер согласий пользователя
 * Координирует работу сервисов (KISS, DRY, событийная модель)
 * Единая точка входа для работы с cookie-баннером
 * Включает в себя функциональность UserPreferencesService
 */

// Встроенный класс UserPreferencesService (бывший js/services/UserPreferencesService.js)
class UserPreferencesService {
  constructor(storageService, eventBus) {
    this.storage = storageService;
    this.eventBus = eventBus;
    // Маскированный ключ для избежания блокировок
    this.consentKey = 'user_preferences_v1';
    this.config = {
      version: '1.0',
      categories: {
        functional: {
          id: 'functional',
          name: 'Функциональные',
          description: 'Для входа в личный кабинет и работы основных функций',
          required: true
        },
        analytics: {
          id: 'analytics',
          name: 'Аналитические',
          description: 'Для сбора статистики посещений и улучшения сайта',
          required: false
        },
        marketing: {
          id: 'marketing',
          name: 'Маркетинговые',
          description: 'Для показа релевантной рекламы',
          required: false
        }
      }
    };
  }

  init() {
    const consent = this.getConsent();
    if (!consent) {
      this.eventBus.emit('preferences:required');
    } else {
      this._applyConsent(consent.categories);
    }
  }

  getConsent() {
    return this.storage.get(this.consentKey, null);
  }

  saveConsent(consent) {
    const consentData = {
      timestamp: new Date().toISOString(),
      version: this.config.version,
      categories: consent
    };
    this.storage.set(this.consentKey, consentData);
    this._applyConsent(consent);
    this.eventBus.emit('preferences:saved', consentData);
  }

  withdrawConsent() {
    this.storage.remove(this.consentKey);
    this.eventBus.emit('preferences:withdrawn');
  }

  getCategories() {
    return this.config.categories;
  }

  _applyConsent(categories) {
    if (categories && !categories.analytics) {
      this._disableAnalytics();
    }
    
    if (categories && !categories.marketing) {
      this.eventBus.emit('marketing:disabled');
    }

    this.eventBus.emit('preferences:applied', categories);
  }

  _disableAnalytics() {
    try {
      const counterId = window.CONFIG?.YANDEX?.METRIKA_COUNTER_ID || '108333042';
      
      if (typeof window.ym !== 'undefined') {
        window.ym(counterId, 'userParams', { analytics_enabled: false });
        window.ym(counterId, 'hit', window.location.href, {
          params: { analytics: 'disabled' }
        });
        console.log('[UserPreferences] Analytics disabled by user');
      }
    } catch (error) {
      console.warn('[UserPreferences] Error disabling analytics:', error.message);
    }
  }
}

class ConsentManager {
  constructor() {
    this.preferencesService = null;
    this.userNoticeUI = null;
    this.observer = null;
    this.recoveryTimer = null;
  }

  init() {
    if (!window.Services?.eventBus) {
      console.error('[ConsentManager] EventBus not available');
      return;
    }

    const eventBus = window.Services.eventBus;
    const storage = window.Services.storage;

    // Инициализация сервисов (разделение ответственностей)
    this.preferencesService = new UserPreferencesService(storage, eventBus);
    this.userNoticeUI = new UserNoticeUI(this.preferencesService, eventBus);

    // Запуск сервисов — теперь вызывается из Application.init() без задержки
    this.preferencesService.init();
    this.userNoticeUI.init();
    this._setupMutationObserver();

    console.log('[ConsentManager] Initialized with event-driven architecture');
  }

  /**
   * MutationObserver для восстановления баннера при удалении блокировщиком
   */
  _setupMutationObserver() {
    const self = this;
    const bannerId = 'user-notice-banner';

    this.observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.removedNodes.forEach(function(node) {
          if (node.nodeType === 1 && node.id === bannerId) {
            console.log('[ConsentManager] Banner removed, scheduling recovery...');
            self._scheduleRecovery();
          }
        });
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Планирование восстановления баннера через 2 секунды
   */
  _scheduleRecovery() {
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
    }

    this.recoveryTimer = setTimeout(() => {
      const consent = this.preferencesService.getConsent();
      if (!consent && !document.getElementById('user-notice-banner')) {
        console.log('[ConsentManager] Recovering banner...');
        this.userNoticeUI.show();
      }
    }, 2000);
  }

  /**
   * Очистка ресурсов при уничтожении
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
      this.recoveryTimer = null;
    }
  }
}

// Экспортируем в глобальную область для использования в index.html
window.ConsentManager = ConsentManager;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ConsentManager };
}