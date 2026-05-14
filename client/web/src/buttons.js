const pcpart_list = document.getElementById('pcparts-c');

// Маппинг названий кнопок на ID компонентов для metrics.js
const COMPONENT_MAP = {
  'CPU':     'cpu',
  'GPU':     'gpu',
  'RAM':     'memory',
  'Ethernet': 'network',
  'Disk':    'disk',
  'Temp':    'temp'
};

// Текущий выбранный сервер (будет обновляться из левого сайдбара)
let currentServer = null;

function createPCPart(text, componentId) {
  const btn = document.createElement('button');
  btn.className = 'server-item';
  btn.innerHTML = `${text}`;

  // Сохраняем ID компонента в data-атрибуте
  btn.dataset.component = componentId;

  btn.addEventListener('click', function() {
    // Подсветка активной кнопки
    document.querySelectorAll('#pcparts-c .server-item').forEach(b => {
      b.classList.remove('active');
    });
    btn.classList.add('active');

    console.log(`Нажата кнопка: ${text} (${componentId})`);

    // Вызываем функцию из metrics.js
    if (typeof selectMetrics === 'function' && currentServer) {
      selectMetrics(currentServer, componentId);
    }
  });

  return btn;
}

// Если PC parts приходят динамически (например, с бэкенда):
function addPCPart(name) {
  const componentId = COMPONENT_MAP[name] || name.toLowerCase().replace(/\s+/g, '_');
  
  // Если компонент не описан в COMPONENTS (metrics.js), пропускаем
  if (typeof COMPONENTS !== 'undefined' && !COMPONENTS[componentId]) {
    console.warn(`Unknown component: ${name}, skipping`);
    return;
  }

  pcpart_list.appendChild(createPCPart(name, componentId));
}

// Пример заполнения (замените на данные с бэкенда):
const pcPartsFromBackend = ['CPU', 'GPU', 'RAM', 'Ethernet'];
pcPartsFromBackend.forEach(addPCPart);

// Если сервер выбирается в левом сайдбаре, добавьте там:
// currentServer = serverId;
// selectMetrics(currentServer, null);  // сбросить график
