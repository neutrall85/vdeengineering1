/**
 * Страница проектов - инициализация обработчиков
 * ООО "Волга-Днепр Инжиниринг"
 * Безопасная реализация без inline-обработчиков
 */

(function() {
  'use strict';

  // Данные проектов (санитизированные)
  const projectsData = {
    1: {
      title: 'Модернизация грузового отсека Ан-124-100',
      details: ['Разработка усиленной системы крепления', 'Модернизация конструкции грузового отсека', 'Испытания и сертификация по нормам АП-25', 'Увеличение грузоподъемности до 150 тонн', 'Совместимость с различными типами грузов'],
      image: 'assets/images/An-124-100.jpeg',
      category: 'Транспортная авиация'
    },
    2: {
      title: 'Установка современной навигационной системы',
      details: ['Интеграция комплекса К-НВС-10', 'Повышение точности навигации до 0.1 NM', 'Соответствие требованиям RNAV/RNP', 'Автоматическое планирование маршрута', 'Совместимость с существующими системами'],
      image: 'assets/images/about.jpg',
      category: 'Авионика'
    },
    3: {
      title: 'Модернизация газотурбинного двигателя',
      details: ['Увеличение межремонтного ресурса на 30%', 'Снижение расхода топлива на 5%', 'Внедрение новых материалов турбины', 'Улучшение системы охлаждения', 'Сертификация по нормам ИКАО'],
      image: 'assets/images/Rossiya.jpg',
      category: 'Двигательные системы'
    },
    4: {
      title: 'Сертификация модификаций Ил-76ТД',
      details: ['Комплексная модернизация навигационного оборудования', 'Установка нового связного оборудования', 'Получение сертификата типа', 'Соответствие требованиям ЕАС АВ', 'Поддержка эксплуатации'],
      image: 'assets/images/An-124-100.jpeg',
      category: 'Сертификация'
    },
    5: {
      title: 'Внедрение цифровой кабины пилота',
      details: ['Установка 6 LCD-дисплеев', 'Интеграция с бортовыми системами', 'Резервирование критических систем', 'Эргономичное расположение приборов', 'Снижение нагрузки на экипаж'],
      image: 'assets/images/about.jpg',
      category: 'Цифровизация'
    },
    6: {
      title: 'Разработка ремонтной документации',
      details: ['Разработка РЭ и Формуляра', 'Карты дефектации и контроля', 'Технологические инструкции', 'Каталоги деталей и сборочных единиц', 'Согласование с заказчиком и сертифицирующими органами'],
      image: 'assets/images/Rossiya.jpg',
      category: 'Документация'
    }
  };

  /**
   * Открывает модальное окно проекта с безопасной санитизацией данных
   * @param {string} title - Заголовок проекта
   * @param {Array<string>} details - Детали проекта
   * @param {string} image - Изображение
   * @param {string} category - Категория
   */
  function openProjectModal(title, details, image, category) {
    const modalTitle = document.getElementById('projectModalTitle');
    const modalContent = document.getElementById('projectModalContent');
    const modalCategory = document.getElementById('projectModalCategory');
    const modalImage = document.getElementById('projectModalImage');

    if (!modalTitle || !modalContent || !modalCategory || !modalImage) {
      console.warn('Project modal elements not found');
      return;
    }

    const sanitizer = window.Utils?.Sanitizer;

    // Безопасная установка текста через textContent (автоматическое экранирование)
    modalTitle.textContent = sanitizer ? sanitizer.escapeHtml(title) : title;
    modalCategory.textContent = sanitizer ? sanitizer.escapeHtml(category) : category;
    
    // Безопасная установка изображения с валидацией URL
    const safeImageUrl = sanitizer && typeof sanitizer.isValidUrl === 'function' 
      ? (sanitizer.isValidUrl(image) ? image : 'assets/images/placeholder.jpg')
      : image;
    modalImage.src = safeImageUrl;
    modalImage.alt = sanitizer ? sanitizer.escapeHtml(title) : title;

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
      modalManager.open('project');
    } else {
      console.warn('modalManager not initialized');
    }
  }

  /**
   * Закрывает модальное окно проекта
   */
  function closeProjectModal() {
    if (typeof modalManager !== 'undefined') {
      modalManager.close('project');
    }
  }

  /**
   * Инициализация обработчиков после загрузки DOM
   */
  function init() {
    // Обработчики для кнопок "Подробнее" - делегирование событий
    const projectButtons = document.querySelectorAll('.project-details-btn');
    projectButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const projectId = this.getAttribute('data-project-id');
        const project = projectsData[projectId];
        if (project) {
          openProjectModal(project.title, project.details, project.image, project.category);
        }
      });
    });

    // Обработчик для кнопки закрытия модального окна
    const closeBtn = document.getElementById('projectModalCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeProjectModal);
    }

    // Обработчик для кнопки запроса КП
    const requestQuoteBtn = document.getElementById('projectsRequestQuoteBtn');
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
