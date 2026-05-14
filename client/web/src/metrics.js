/* ============================================ */
/* METRICS — одиночный график по выбору          */
/* ============================================ */

// Конфигурация всех возможных компонентов
var COMPONENTS = {
  cpu:     { label: 'CPU Usage',     color: '#715899', unit: '%',   maxValue: 100 },
  gpu:     { label: 'GPU Usage',     color: '#E91E63', unit: '%',   maxValue: 100 },
  memory:  { label: 'Memory Usage',  color: '#4CAF50', unit: '%',   maxValue: 100 },
  disk:    { label: 'Disk Usage',    color: '#FF9800', unit: '%',   maxValue: 100 },
  network: { label: 'Network Speed', color: '#2196F3', unit: 'KB/s', maxValue: null },
  temp:    { label: 'Temperature',   color: '#f44336', unit: '°C',  maxValue: 100 }
};

var MAX_POINTS = 60;
var metricsData = [];                    // массив [timestamp, value]
var currentComponent = null;             // 'cpu', 'gpu', 'memory', и т.д.
var currentServer = null;                // имя выбранного сервера
var mainChart = null;

// Инициализация одного графика
function initMainChart() {
  var container = document.getElementById('chart-main');
  if (!container) return;

  mainChart = echarts.init(container);

  mainChart.setOption({
    grid: {
      left: 50,
      right: 20,
      top: 30,
      bottom: 40
    },
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: '#ccc' } },
      axisLabel: {
        fontSize: 11,
        color: '#888',
        formatter: function(value) {
          var d = new Date(value);
          return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
      },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      min: 0,
      axisLabel: {
        fontSize: 11,
        color: '#888',
        formatter: function(value) { return value; }
      },
      splitLine: {
        lineStyle: { color: '#eeeeee' }
      }
    },
    series: [{
      type: 'line',
      data: [],
      smooth: 0.3,
      symbol: 'none',
      lineStyle: { color: '#715899', width: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#71589940' },
          { offset: 1, color: '#71589905' }
        ])
      }
    }],
    animation: false,
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        var p = params[0];
        var d = new Date(p.axisValue);
        var time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return time + '<br/><strong>' + p.value[1] + '</strong>';
      }
    }
  });
}

// Ресайз
window.addEventListener('resize', function() {
  if (mainChart) mainChart.resize();
});

if (window.ResizeObserver) {
  var chartContainer = document.getElementById('chart-main');
  if (chartContainer) {
    new ResizeObserver(function() {
      if (mainChart) mainChart.resize();
    }).observe(chartContainer);
  }
}

/* --------------------------------------------------
 * Выбрать сервер и компонент
 * -------------------------------------------------- */
function selectMetrics(serverId, componentId) {
  currentServer = serverId;
  
  // Если компонент не выбран — показываем заглушку
  if (!componentId) {
    currentComponent = null;
    metricsData = [];
    
    var headerText = document.querySelector('.metrics-header-text');
    if (headerText) {
      headerText.textContent = serverId + ' — select a component';
    }
    
    var valueEl = document.getElementById('metric-value');
    var labelEl = document.getElementById('metric-label');
    if (labelEl) labelEl.textContent = '--';
    if (valueEl) valueEl.textContent = '--';
    
    if (mainChart) {
      mainChart.setOption({ series: [{ data: [] }] });
    }
    return;
  }

  currentComponent = componentId;
  metricsData = [];

  var comp = COMPONENTS[componentId];
  if (!comp) {
    console.warn('Unknown component:', componentId);
    return;
  }

  // Обновляем заголовок
  var headerText = document.querySelector('.metrics-header-text');
  if (headerText) {
    headerText.textContent = serverId + ' — ' + comp.label;
  }

  // Обновляем карточку
  var labelEl = document.getElementById('metric-label');
  var valueEl = document.getElementById('metric-value');
  var fillEl = document.getElementById('metric-fill');
  if (labelEl) labelEl.textContent = comp.label;
  if (valueEl) valueEl.textContent = '-- ' + comp.unit;
  if (fillEl) fillEl.style.width = '0%';

  // Обновляем график
  if (!mainChart) initMainChart();

  if (mainChart) {
    mainChart.setOption({
      yAxis: {
        max: comp.maxValue || undefined,
        axisLabel: {
          formatter: function(value) { return value + ' ' + comp.unit; }
        }
      },
      series: [{
        data: [],
        lineStyle: { color: comp.color, width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: comp.color + '40' },
            { offset: 1, color: comp.color + '05' }
          ])
        }
      }]
    });
  }
}

/* --------------------------------------------------
 * Принять метрику от C++ бэкенда
 * -------------------------------------------------- */
function addMetric(metric) {
  // metric = {
  //   time: "2024-12-30T20:00:67Z",
  //   data: {
  //     cpu:     { usage: 60 },
  //     memory:  { usage: 45 },
  //     disk:    { usage: 32 },
  //     network: { bytes_per_sec: 1024 },
  //     gpu:     { usage: 80 },
  //     temp:    { cpu: 55 }
  //   }
  // }

  if (!currentComponent) return;

  var timestamp = new Date(metric.time).getTime();
  var comp = COMPONENTS[currentComponent];
  var value = null;

  // Извлекаем значение в зависимости от компонента
  var d = metric.data;
  if (!d) return;

  switch (currentComponent) {
    case 'cpu':     value = d.cpu     ? d.cpu.usage     : null; break;
    case 'gpu':     value = d.gpu     ? d.gpu.usage     : null; break;
    case 'memory':  value = d.memory  ? d.memory.usage  : null; break;
    case 'disk':    value = d.disk    ? d.disk.usage    : null; break;
    case 'network': value = d.network ? +(d.network.bytes_per_sec / 1024).toFixed(1) : null; break;
    case 'temp':    value = d.temp    ? (d.temp.cpu || d.temp.gpu || null) : null; break;
  }

  if (value == null) return;

  // Добавляем точку
  metricsData.push([timestamp, value]);
  if (metricsData.length > MAX_POINTS) metricsData.shift();

  // Обновляем график
  if (mainChart) {
    mainChart.setOption({
      series: [{ data: metricsData.slice() }]
    });
  }

  // Обновляем карточку
  var valueEl = document.getElementById('metric-value');
  var fillEl = document.getElementById('metric-fill');
  if (valueEl) valueEl.textContent = value + ' ' + comp.unit;

  if (fillEl && comp.maxValue) {
    var pct = Math.min(100, Math.max(0, value));
    fillEl.style.width = pct + '%';
    if (pct > 80) fillEl.style.background = '#f44336';
    else if (pct > 60) fillEl.style.background = '#FF9800';
    else fillEl.style.background = comp.color;
  }

  updateFooter(timestamp);
}

function updateFooter(timestamp) {
  var footer = document.querySelector('.fetch-status');
  if (!footer) return;
  var d = new Date(timestamp);
  var timeStr = d.toLocaleString('ru-RU', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  var ago = Math.round((Date.now() - timestamp) / 1000);
  var agoStr = ago < 60 ? ago + 's ago'
    : ago < 3600 ? Math.floor(ago / 60) + 'm ago'
    : Math.floor(ago / 3600) + 'h ago';
  footer.textContent = 'Metrics collected on ' + timeStr + ' [' + agoStr + ']';
}

// Инициализация при загрузке
initMainChart();
