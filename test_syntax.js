const fs = require('fs');

// Загружаем все JS файлы в порядке как в index.html
const files = [
  'js/config.js',
  'js/utils/DOMUtils.js',
  'js/utils/Services.js',
  'js/services/EventBus.js',
  'js/services/StorageService.js',
  'js/services/ApiClient.js',
  'js/ui/ModalManager.js',
  'js/ui/NavigationManager.js',
  'js/ui/AnimationManager.js',
  'js/ui/NewsRenderer.js',
  'js/ui/NewsManager.js',
  'js/ui/FormManager.js',
  'js/ui/MapManager.js',
  'js/data/newsData.js',
  'js/services/ConsentManager.js',
  'js/app.js'
];

console.log('Проверка синтаксиса JS файлов...');
let hasErrors = false;

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    new Function(content);
    console.log('✓', file, '- OK');
  } catch (e) {
    console.log('✗', file, '- ERROR:', e.message);
    hasErrors = true;
  }
});

if (!hasErrors) {
  console.log('\nВсе файлы прошли проверку синтаксиса!');
} else {
  console.log('\nОбнаружены ошибки!');
  process.exit(1);
}
