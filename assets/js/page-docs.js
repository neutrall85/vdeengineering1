// Управление превью PDF - простая инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  const frames = document.querySelectorAll('.pdf-frame');
  
  frames.forEach(frame => {
    frame.addEventListener('load', () => {
      frame.classList.add('loaded');
    });
    
    // Показываем placeholder если iframe не загрузился
    setTimeout(() => {
      if (!frame.classList.contains('loaded')) {
        const placeholder = frame.nextElementSibling;
        if (placeholder && placeholder.classList.contains('pdf-preview-placeholder')) {
          placeholder.style.display = 'flex';
        }
      }
    }, 3000);
  });
});
