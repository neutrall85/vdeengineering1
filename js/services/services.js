/**
 * Объединённые сервисы: EventBus, StorageService, ApiClient
 * ООО "Волга-Днепр Инжиниринг"
 */

const Services = (function() {
  // ========== Шина событий ==========
  class EventBus {
    constructor() {
      this.events = new Map();
    }

    on(event, callback) {
      if (!this.events.has(event)) {
        this.events.set(event, new Set());
      }
      this.events.get(event).add(callback);
      return () => this.off(event, callback);
    }

    off(event, callback) {
      if (this.events.has(event)) {
        this.events.get(event).delete(callback);
      }
    }

    emit(event, data) {
      if (this.events.has(event)) {
        this.events.get(event).forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`Error in event handler for ${event}:`, error);
          }
        });
      }
    }

    clear() {
      this.events.clear();
    }
  }

  // ========== Хранилище ==========
  class StorageService {
    constructor(storage = localStorage) {
      this.storage = storage;
    }

    get(key, defaultValue = null) {
      try {
        const value = this.storage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
      } catch {
        return defaultValue;
      }
    }

    set(key, value) {
      try {
        this.storage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    }

    remove(key) {
      try {
        this.storage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    }

    clear() {
      try {
        this.storage.clear();
        return true;
      } catch {
        return false;
      }
    }
  }

  // ========== API Клиент ==========
  class ApiClient {
    constructor(baseUrl = '') {
      this.baseUrl = baseUrl;
    }

    async post(endpoint, data, options = {}) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          body: JSON.stringify(data),
          ...options
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
      }
    }

    async submitForm(data) {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Form submitted:', data);
      return { success: true, message: 'Заявка успешно отправлена' };
    }
  }

  // Создаём экземпляры по умолчанию
  const eventBus = new EventBus();
  const storage = new StorageService();
  const apiClient = new ApiClient();

  return { EventBus, StorageService, ApiClient, eventBus, storage, apiClient };
})();

// Экспортируем только один глобальный объект
window.Services = Services;
