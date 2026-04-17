/**
 * ComponentLoader - загрузчик общих компонентов (header, footer, modals)
 * Устраняет дублирование HTML между страницами
 * 
 * Использует модули:
 * - HeaderLoader для навигации
 * - FooterLoader для футера
 * - ModalBuilder для модальных окон
 */

const ComponentLoader = {
    /**
     * Инициализация компонентов на странице
     * @param {Object} options - Опции загрузки
     * @param {Function} callback - Функция обратного вызова после загрузки
     */
    init(options = {}, callback = null) {
        const { 
            loadNavbar = true, 
            loadFooter = true, 
            loadModal = true,
            activePage = '' 
        } = options;

        // Загрузка навигации через HeaderLoader
        if (loadNavbar && typeof HeaderLoader !== 'undefined') {
            HeaderLoader.load({ activePage });
        }
        
        // Подсветка активной ссылки (если не было сделано при загрузке навигации)
        if (activePage && !loadNavbar && typeof HeaderLoader !== 'undefined') {
            HeaderLoader.setActiveLink(activePage);
        }

        // Загрузка футера через FooterLoader
        if (loadFooter && typeof FooterLoader !== 'undefined') {
            FooterLoader.load();
        }

        // Загрузка модальных окон через ModalBuilder
        if (loadModal && typeof ModalBuilder !== 'undefined') {
            ModalBuilder.loadProposalModal();
            ModalBuilder.loadUniversalModal();
        }

        // Вызываем callback сначала (если есть)
        if (callback && typeof callback === 'function') {
            callback();
        }

        // Отправляем событие о завершении загрузки компонентов синхронно
        // Используем setTimeout с 0, чтобы событие ушло после выполнения всех операций
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('components:loaded'));
        }, 0);
    },
};

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentLoader;
}
