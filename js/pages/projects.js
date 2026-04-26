/**
 * Инициализация страницы проектов
 * ООО "Волга-Днепр Инжиниринг"
 * Автоматическая инициализация после загрузки DOM
 */

// Данные проектов
const projectsData = {
  1: {
    title: 'Суперпроект',
    details: ['Реализация 1', 'Реализация 2', 'Реализация 3', 'Реализация 4', 'Реализация 5'],
    image: 'assets/images/placeholder.jpg',
    category: 'Какая-то категория'
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
        openProjectModal(project.title, project.details, project.image, project.category);
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

function openProjectModal(title, details, image, category) {
  const modalTitle = document.getElementById('projectModalTitle');
  const modalContent = document.getElementById('projectModalContent');
  const modalCategory = document.getElementById('projectModalCategory');
  const modalImage = document.getElementById('projectModalImage');

  if (!modalTitle || !modalContent || !modalCategory || !modalImage) {
    Logger.WARN('Элементы модального окна проекта не найдены');
    return;
  }

  const sanitizer = window.Utils?.Sanitizer;
  modalTitle.textContent = sanitizer ? sanitizer.escapeHtml(title) : title;
  modalCategory.textContent = sanitizer ? sanitizer.escapeHtml(category) : category;
  modalImage.src = sanitizer ? (sanitizer.isValidUrl(image) ? image : 'assets/images/placeholder.jpg') : image;
  modalImage.alt = sanitizer ? sanitizer.escapeHtml(title) : title;
  
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

  if (typeof modalManager !== 'undefined') {
    modalManager.open('project');
  } else {
    Logger.ERROR('ModalManager не доступен');
  }
}

// Автоматическая инициализация после загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjectsPage);
} else {
  initProjectsPage();
}
