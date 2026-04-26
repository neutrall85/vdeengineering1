/**
 * Инициализация страницы проектов
 * ООО "Волга-Днепр Инжиниринг"
 * Автоматическая инициализация после загрузки DOM
 */

// Данные проектов с поддержкой нескольких изображений
const projectsData = {
  1: {
    title: 'Модернизация грузового отсека Ан-124-100',
    details: ['Разработка усиленной системы крепления', 'Модернизация конструкции грузового отсека', 'Испытания и сертификация по нормам АП-25', 'Увеличение грузоподъемности до 150 тонн', 'Совместимость с различными типами грузов'],
    images: ['assets/images/An-124-100.jpeg', 'assets/images/about.jpg', 'assets/images/Rossiya.jpg'],
    category: 'Транспортная авиация'
  },
  2: {
    title: 'Установка современной навигационной системы',
    details: ['Интеграция комплекса К-НВС-10', 'Повышение точности навигации до 0.1 NM', 'Соответствие требованиям RNAV/RNP', 'Автоматическое планирование маршрута', 'Совместимость с существующими системами'],
    images: ['assets/images/about.jpg', 'assets/images/An-124-100.jpeg'],
    category: 'Авионика'
  },
  3: {
    title: 'Модернизация газотурбинного двигателя',
    details: ['Увеличение межремонтного ресурса на 30%', 'Снижение расхода топлива на 5%', 'Внедрение новых материалов турбины', 'Улучшение системы охлаждения', 'Сертификация по нормам ИКАО'],
    images: ['assets/images/Rossiya.jpg', 'assets/images/about.jpg', 'assets/images/An-124-100.jpeg'],
    category: 'Двигательные системы'
  },
  4: {
    title: 'Сертификация модификаций Ил-76ТД',
    details: ['Комплексная модернизация навигационного оборудования', 'Установка нового связного оборудования', 'Получение сертификата типа', 'Соответствие требованиям ЕАС АВ', 'Поддержка эксплуатации'],
    images: ['assets/images/An-124-100.jpeg', 'assets/images/Rossiya.jpg'],
    category: 'Сертификация'
  },
  5: {
    title: 'Внедрение цифровой кабины пилота',
    details: ['Установка 6 LCD-дисплеев', 'Интеграция с бортовыми системами', 'Резервирование критических систем', 'Эргономичное расположение приборов', 'Снижение нагрузки на экипаж'],
    images: ['assets/images/about.jpg', 'assets/images/Rossiya.jpg', 'assets/images/An-124-100.jpeg'],
    category: 'Цифровизация'
  },
  6: {
    title: 'Разработка ремонтной документации',
    details: ['Разработка РЭ и Формуляра', 'Карты дефектации и контроля', 'Технологические инструкции', 'Каталоги деталей и сборочных единиц', 'Согласование с заказчиком и сертифицирующими органами'],
    images: ['assets/images/Rossiya.jpg', 'assets/images/about.jpg'],
    category: 'Документация'
  }
};

/**
 * Основная функция инициализации
 */
function initProjectsPage() {
  // Обработчик для кнопок "Подробнее" через делегирование событий
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.news-card-link[data-project-id]');
    if (btn) {
      e.preventDefault();
      const projectId = btn.getAttribute('data-project-id');
      const project = projectsData[projectId];
      if (project) {
        openProjectModal(project.title, project.details, project.images, project.category);
      }
    }
  });

  // Обработчик для кнопки запроса КП
  const requestQuoteBtn = document.getElementById('projectsRequestQuoteBtn');
  if (requestQuoteBtn) {
    requestQuoteBtn.addEventListener('click', function() {
      if (typeof window.openApplicationModal === 'function') {
        window.openApplicationModal();
      }
    });
  }
}

function openProjectModal(title, details, images, category) {
  const modalTitle = document.getElementById('projectModalTitle');
  const modalContent = document.getElementById('projectModalContent');
  const modalCategory = document.getElementById('projectModalCategory');
  const modalImageContainer = document.getElementById('projectModalImageContainer');
  const modalImage = document.getElementById('projectModalImage');

  if (!modalTitle || !modalContent || !modalCategory || !modalImage) {
    Logger.WARN('Элементы модального окна проекта не найдены');
    return;
  }

  const sanitizer = window.Utils?.Sanitizer;
  modalTitle.textContent = sanitizer ? sanitizer.escapeHtml(title) : title;
  modalCategory.textContent = sanitizer ? sanitizer.escapeHtml(category) : category;
  
  // Создаем список через DOM API для безопасности
  modalContent.replaceChildren();
  const ul = document.createElement('ul');
  ul.className = 'modal-list-ul';
  details.forEach(item => {
    const li = document.createElement('li');
    li.className = 'modal-list-li';
    li.textContent = sanitizer ? sanitizer.escapeHtml(item) : item;
    ul.appendChild(li);
  });
  modalContent.appendChild(ul);

  // Инициализация галереи изображений
  initProjectGallery(images, modalImageContainer, modalImage);

  if (typeof modalManager !== 'undefined') {
    modalManager.open('project');
  } else {
    Logger.ERROR('ModalManager не доступен');
  }
}

/**
 * Инициализация галереи с навигацией
 */
function initProjectGallery(images, container, mainImage) {
  const sanitizer = window.Utils?.Sanitizer;
  
  // Очищаем контейнер галереи
  if (container) {
    container.replaceChildren();
  }
  
  // Если только одно изображение или массив пустой
  if (!images || images.length === 0) {
    if (mainImage) {
      mainImage.src = 'assets/images/placeholder.jpg';
      mainImage.alt = 'Изображение проекта';
    }
    return;
  }
  
  // Текущий индекс изображения
  let currentIndex = 0;
  
  // Функция обновления главного изображения
  function updateMainImage(index) {
    if (!mainImage) return;
    const safeUrl = sanitizer && sanitizer.isValidUrl 
      ? (sanitizer.isValidUrl(images[index]) ? images[index] : 'assets/images/placeholder.jpg')
      : images[index];
    mainImage.src = safeUrl;
    mainImage.alt = `Изображение ${index + 1} из ${images.length}`;
  }
  
  // Если только одно изображение - просто показываем его
  if (images.length === 1) {
    updateMainImage(0);
    // Добавляем обработчик для открытия лайтбокса
    if (mainImage && typeof openProjectLightbox === 'function') {
      mainImage.style.cursor = 'zoom-in';
      mainImage.addEventListener('click', () => {
        openProjectLightbox(images, 0);
      });
    }
    return;
  }
  
  // Создаем элементы управления навигацией
  if (container) {
    // Кнопка влево
    const prevBtn = document.createElement('button');
    prevBtn.className = 'gallery-nav gallery-nav-prev';
    prevBtn.setAttribute('aria-label', 'Предыдущее изображение');
    prevBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateMainImage(currentIndex);
    });
    container.appendChild(prevBtn);
    
    // Контейнер для основного изображения
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'gallery-image-wrapper';
    mainImage.parentNode.insertBefore(imageWrapper, mainImage);
    imageWrapper.appendChild(mainImage);
    
    // Кнопка вправо
    const nextBtn = document.createElement('button');
    nextBtn.className = 'gallery-nav gallery-nav-next';
    nextBtn.setAttribute('aria-label', 'Следующее изображение');
    nextBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>';
    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % images.length;
      updateMainImage(currentIndex);
    });
    container.appendChild(nextBtn);
    
    // Индикаторы (точки)
    const indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'gallery-indicators';
    
    images.forEach((_, index) => {
      const indicator = document.createElement('button');
      indicator.className = 'gallery-indicator' + (index === 0 ? ' active' : '');
      indicator.setAttribute('aria-label', `Изображение ${index + 1}`);
      indicator.addEventListener('click', () => {
        currentIndex = index;
        updateMainImage(currentIndex);
        // Обновляем активный индикатор
        indicatorsContainer.querySelectorAll('.gallery-indicator').forEach((ind, i) => {
          ind.classList.toggle('active', i === index);
        });
      });
      indicatorsContainer.appendChild(indicator);
    });
    
    container.appendChild(indicatorsContainer);
  }
  
  // Добавляем обработчик для открытия лайтбокса по клику на изображение
  if (mainImage && typeof openProjectLightbox === 'function') {
    mainImage.style.cursor = 'zoom-in';
    mainImage.addEventListener('click', () => {
      openProjectLightbox(images, currentIndex);
    });
  }
  
  // Показываем первое изображение
  updateMainImage(0);
}

/**
 * Открытие лайтбокса для проектов
 */
function openProjectLightbox(images, startIndex = 0) {
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxIndicators = document.getElementById('lightboxIndicators');
  const prevBtn = document.getElementById('lightboxPrevBtn');
  const nextBtn = document.getElementById('lightboxNextBtn');
  
  if (!lightboxOverlay || !lightboxImage) {
    Logger.WARN('Lightbox элементы не найдены');
    return;
  }
  
  const sanitizer = window.Utils?.Sanitizer;
  let currentIndex = startIndex;
  
  // Функция обновления изображения в лайтбоксе
  function updateLightboxImage(index) {
    const safeUrl = sanitizer && sanitizer.isValidUrl 
      ? (sanitizer.isValidUrl(images[index]) ? images[index] : 'assets/images/placeholder.jpg')
      : images[index];
    lightboxImage.src = safeUrl;
    lightboxImage.alt = `Изображение ${index + 1} из ${images.length}`;
    
    // Обновляем индикаторы
    if (lightboxIndicators) {
      lightboxIndicators.querySelectorAll('.lightbox-indicator').forEach((ind, i) => {
        ind.classList.toggle('active', i === index);
      });
    }
  }
  
  // Создаем индикаторы если их нет
  if (lightboxIndicators && images.length > 1) {
    lightboxIndicators.replaceChildren();
    images.forEach((_, index) => {
      const indicator = document.createElement('button');
      indicator.className = 'lightbox-indicator' + (index === startIndex ? ' active' : '');
      indicator.setAttribute('aria-label', `Изображение ${index + 1}`);
      indicator.addEventListener('click', () => {
        currentIndex = index;
        updateLightboxImage(currentIndex);
      });
      lightboxIndicators.appendChild(indicator);
    });
  } else if (lightboxIndicators) {
    lightboxIndicators.replaceChildren();
  }
  
  // Обработчики навигации
  function navigate(direction) {
    currentIndex = (currentIndex + direction + images.length) % images.length;
    updateLightboxImage(currentIndex);
  }
  
  // Временные обработчики для кнопок
  const tempPrevHandler = () => navigate(-1);
  const tempNextHandler = () => navigate(1);
  
  if (prevBtn) {
    prevBtn.style.display = images.length > 1 ? 'flex' : 'none';
    prevBtn.onclick = tempPrevHandler;
  }
  
  if (nextBtn) {
    nextBtn.style.display = images.length > 1 ? 'flex' : 'none';
    nextBtn.onclick = tempNextHandler;
  }
  
  // Показываем первое изображение
  updateLightboxImage(currentIndex);
  
  // Открываем лайтбокс
  lightboxOverlay.classList.add('active');
  
  // Блокируем скролл
  if (window.ScrollManager && !ScrollManager.isLocked()) {
    ScrollManager.lock();
  }
  
  // Закрытие по кнопке
  const closeBtn = document.getElementById('lightboxCloseBtn');
  const closeHandler = () => closeLightbox(lightboxOverlay, lightboxImage, prevBtn, nextBtn);
  if (closeBtn) {
    closeBtn.onclick = closeHandler;
  }
  
  // Закрытие по клику на оверлей
  lightboxOverlay.onclick = (e) => {
    if (e.target === lightboxOverlay) {
      closeHandler();
    }
  };
  
  // Закрытие по Escape
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      closeHandler();
    }
  };
  document.addEventListener('keydown', escapeHandler, { once: true });
  
  // Сохраняем обработчики для очистки
  lightboxImage.dataset.closeHandler = closeHandler.toString();
  lightboxImage.dataset.escapeHandler = escapeHandler.toString();
}

/**
 * Закрытие лайтбокса
 */
function closeLightbox(lightboxOverlay, lightboxImage, prevBtn, nextBtn) {
  if (!lightboxOverlay) return;
  
  lightboxOverlay.classList.remove('active');
  
  // Разблокируем скролл
  if (window.ScrollManager) {
    ScrollManager.unlock();
  }
  
  // Очищаем src после анимации
  setTimeout(() => {
    if (lightboxImage) {
      lightboxImage.src = '';
    }
  }, 300);
  
  // Очищаем обработчики
  if (prevBtn) prevBtn.onclick = null;
  if (nextBtn) nextBtn.onclick = null;
  const closeBtn = document.getElementById('lightboxCloseBtn');
  if (closeBtn) closeBtn.onclick = null;
  lightboxOverlay.onclick = null;
}

// Автоматическая инициализация после загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjectsPage);
} else {
  initProjectsPage();
}
