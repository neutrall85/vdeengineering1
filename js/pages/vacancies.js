/**
 * Инициализация обработчиков для страницы вакансий
 * ООО "Волга-Днепр Инжиниринг"
 * 
 * Примечание: Основные обработчики открытия модалок реализованы
 * через делегирование событий в app.js (data-modal-open="proposal")
 */

// Экспортируем функцию инициализации для module режима
window.initVacanciesPage = function() {
  // Дополнительная логика может быть добавлена здесь при необходимости
  // Например, передача данных о вакансии в модальное окно
  
  console.log('Страница вакансий инициализирована');
};

// Автозапуск если не используется как модуль, или ожидание DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initVacanciesPage);
} else {
  window.initVacanciesPage();
}
