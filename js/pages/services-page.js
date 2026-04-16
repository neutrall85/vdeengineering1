/**
 * Страница услуг - инициализация обработчиков
 * ООО "Волга-Днепр Инжиниринг"
 * Безопасная реализация без inline-обработчиков
 */

(function() {
  'use strict';

  // Данные услуг (санитизированные)
  const servicesData = {
    1: {
      title: 'Модификация авиационной техники',
      details: ['Разработка концепции модификации', 'Проектирование изменений конструкции', 'Интеграция новых систем и компонентов', 'Испытания и валидация решений', 'Сертификация по нормам ФАП'],
      image: 'assets/images/An-124-100.jpeg',
      category: 'Услуга'
    },
    2: {
      title: 'Доказательство соответствия требованиям ФАП',
      details: ['Анализ применимых требований ФАП', 'Разработка программы доказательств', 'Выполнение расчетов и испытаний', 'Оформление отчетов по доказательству', 'Сопровождение в сертифицирующих органах'],
      image: 'assets/images/about.jpg',
      category: 'Услуга'
    },
    3: {
      title: 'Сертификация второстепенных изменений',
      details: ['Классификация изменений (мажорные/минорные)', 'Подготовка пакета документации', 'Согласование с АР МАК', 'Получение сертификата типа', 'Внесение изменений в формуляр ВС'],
      image: 'assets/images/Rossiya.jpg',
      category: 'Услуга'
    },
    4: {
      title: 'Выпуск технической документации',
      details: ['Разработка чертежей КД', 'Спецификации и ведомости материалов', 'Технические условия и инструкции', 'Руководства по эксплуатации', 'Согласование документации с заказчиком'],
      image: 'assets/images/An-124-100.jpeg',
      category: 'Услуга'
    },
    5: {
      title: 'Инженерные расчеты и анализ',
      details: ['Статические и динамические расчеты', 'Расчеты на усталостную прочность', 'Анализ напряженно-деформированного состояния', 'Оценка остаточного ресурса', 'Верификация расчетных моделей'],
      image: 'assets/images/about.jpg',
      category: 'Услуга'
    },
    6: {
      title: 'Консультационные услуги',
      details: ['Консультации по нормам ФАП и ИКАО', 'Анализ возможности модификации', 'Оценка стоимости и сроков работ', 'Экспертная поддержка проектов', 'Обучение персонала заказчика'],
      image: 'assets/images/Rossiya.jpg',
      category: 'Услуга'
    }
  };

  /**
   * Открывает модальное окно услуги с безопасной санитизацией данных
   * @param {string} title - Заголовок услуги
   * @param {Array<string>} details - Детали услуги
   * @param {string} image - Изображение
   * @param {string} category - Категория
   */
  function openServiceModal(title, details, image, category) {
    const modalTitle = document.getElementById('serviceModalTitle');
    const modalContent = document.getElementById('serviceModalContent');
    const modalCategory = document.getElementById('serviceModalCategory');

    if (!modalTitle || !modalContent || !modalCategory) {
      console.warn('Service modal elements not found');
      return;
    }

    const sanitizer = window.Utils?.Sanitizer;

    // Безопасная установка текста через textContent (автоматическое экранирование)
    modalTitle.textContent = sanitizer ? sanitizer.escapeHtml(title) : title;
    modalCategory.textContent = sanitizer ? sanitizer.escapeHtml(category) : category;

    // Безопасное создание списка элементов
    const ul = document.createElement('ul');
    ul.className = 'modal-list-ul';
    
    details.forEach(function(item) {
      const li = document.createElement('li');
      li.className = 'modal-list-li';
      li.textContent = sanitizer ? sanitizer.escapeHtml(item) : item;
      ul.appendChild(li);
    });

    // Очищаем контент и добавляем созданный список
    modalContent.innerHTML = '';
    modalContent.appendChild(ul);

    // Открываем модальное окно через ModalManager
    if (typeof modalManager !== 'undefined') {
      modalManager.open('service');
    } else {
      console.warn('modalManager not initialized');
    }
  }

  /**
   * Закрывает модальное окно услуги
   */
  function closeServiceModal() {
    if (typeof modalManager !== 'undefined') {
      modalManager.close('service');
    }
  }

  /**
   * Инициализация обработчиков после загрузки DOM
   */
  function init() {
    // Обработчики для кнопок "Подробнее" - делегирование событий
    const serviceButtons = document.querySelectorAll('.service-details-btn');
    serviceButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const serviceId = this.getAttribute('data-service-id');
        const service = servicesData[serviceId];
        if (service) {
          openServiceModal(service.title, service.details, service.image, service.category);
        }
      });
    });

    // Обработчик для кнопки закрытия модального окна
    const closeBtn = document.getElementById('serviceModalCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeServiceModal);
    }

    // Обработчик для кнопки запроса КП
    const requestQuoteBtn = document.getElementById('servicesRequestQuoteBtn');
    if (requestQuoteBtn) {
      requestQuoteBtn.addEventListener('click', function() {
        if (typeof window.openModal === 'function') {
          window.openModal();
        }
      });
    }

    // Обработчик для кнопки "Наверх"
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (scrollToTopBtn) {
      scrollToTopBtn.addEventListener('click', function() {
        if (typeof window.scrollToTop === 'function') {
          window.scrollToTop();
        }
      });
    }
  }

  // Инициализация после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
