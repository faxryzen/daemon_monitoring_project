const server_list = document.getElementById('serverlist-c');

function createItem(text) {
  const btn = document.createElement('button');
  btn.className = 'server-item';
  btn.innerHTML = `PCвапвапвапвапвапав${text}`;

  btn.onclick = () => {
    console.log(`Нажата кнопка: PC${text}`);
  };

  return btn;
}

for (let i = 1; i <= 200; i++) {
  server_list.appendChild(createItem(i));
}

document.addEventListener('DOMContentLoaded', () => {
  const resizableBlocks = document.querySelectorAll('.resizable');

  resizableBlocks.forEach(block => {
    const resizer = block.querySelector('.resizer');
    //const isRight = block.id === 'right-sidebar';

    resizer.addEventListener('mousedown', (e) => {
      e.preventDefault();

      const doResize = (event) => {
        let newWidth;
        //if (isRight) {
          //newWidth = document.documentElement.clientWidth - event.clientX;
        //} else {
          newWidth = event.clientX - block.getBoundingClientRect().left;
        //}

        if (newWidth > 100 && newWidth < 600) {
          block.style.width = newWidth + 'px';
        }
      };

      const stopResize = () => {
        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('mouseup', stopResize);
      };

      document.addEventListener('mousemove', doResize);
      document.addEventListener('mouseup', stopResize);
    });
  });
});

(function() {
  const viewport = document.getElementById('serverlist');   // скроллящийся элемент
  const thumb = document.getElementById('custom-scrollbar-thumb');
  const scrollbar = document.getElementById('custom-scrollbar');

  if (!viewport || !thumb) return;

  // Обновить размер и положение ползунка
  function updateThumb() {
    const scrollTop = viewport.scrollTop;
    const scrollHeight = viewport.scrollHeight;
    const clientHeight = viewport.clientHeight;

    // Если контент меньше высоты — ползунок во весь размер
    if (scrollHeight <= clientHeight) {
      thumb.style.height = '100%';
      thumb.style.top = '0';
      return;
    }

    const thumbHeight = Math.max((clientHeight / scrollHeight) * scrollbar.clientHeight, 20);
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop = scrollbar.clientHeight - thumbHeight;
    const thumbTop = (scrollTop / maxScrollTop) * maxThumbTop;

    thumb.style.height = thumbHeight + 'px';
    thumb.style.top = thumbTop + 'px';
  }

  viewport.addEventListener('scroll', updateThumb);
  // Отслеживаем изменение размеров контейнера
  new ResizeObserver(updateThumb).observe(viewport);
  new ResizeObserver(updateThumb).observe(scrollbar);

  // Перетаскивание ползунка
  let isDragging = false, startY, startThumbTop;

  thumb.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    startY = e.clientY;
    startThumbTop = parseFloat(thumb.style.top) || 0;
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaY = e.clientY - startY;
    const maxThumbTop = scrollbar.clientHeight - thumb.clientHeight;
    let newThumbTop = Math.min(Math.max(startThumbTop + deltaY, 0), maxThumbTop);

    const maxScrollTop = viewport.scrollHeight - viewport.clientHeight;
    const scrollRatio = newThumbTop / maxThumbTop;
    viewport.scrollTop = scrollRatio * maxScrollTop;

    updateThumb();
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.userSelect = '';
    }
  });

  // Первичная отрисовка
  updateThumb();
})();
