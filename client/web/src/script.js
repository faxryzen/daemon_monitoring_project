const server_list = document.getElementById('serverlist-c');

function createServerItem(text) {
  const btn = document.createElement('button');
  btn.className = 'server-item';
  btn.innerHTML = `DESKTOP-${text}`;

  btn.onclick = () => {
    console.log(`Нажата кнопка: PC${text}`);
  };

  return btn;
}

for (let i = 1; i <= 200; i++) {
  server_list.appendChild(createServerItem(i));
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

function initCustomScrollbar(wrapper) {
  const viewport = wrapper.querySelector('.serverlist');
  const scrollbar = wrapper.querySelector('.custom-scrollbar');
  const thumb = wrapper.querySelector('.custom-scrollbar-thumb');
  if (!viewport || !scrollbar || !thumb) return;

  function updateThumb() {
    const scrollTop = viewport.scrollTop;
    const scrollHeight = viewport.scrollHeight;
    const clientHeight = viewport.clientHeight;

    if (scrollHeight <= clientHeight) {
      thumb.style.height = '100%';
      thumb.style.top = '0';
      return;
    }

    const thumbHeight = Math.max(
      (clientHeight / scrollHeight) * scrollbar.clientHeight,
      20
    );
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop = scrollbar.clientHeight - thumbHeight;
    const thumbTop = (scrollTop / maxScrollTop) * maxThumbTop;

    thumb.style.height = thumbHeight + 'px';
    thumb.style.top = thumbTop + 'px';
  }

  viewport.addEventListener('scroll', updateThumb);
  new ResizeObserver(updateThumb).observe(viewport);
  new ResizeObserver(updateThumb).observe(scrollbar);

  // Перетаскивание
  let isDragging = false, startY, startThumbTop;

  thumb.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    startY = e.clientY;
    startThumbTop = parseFloat(thumb.style.top) || 0;
    document.body.style.userSelect = 'none';
    thumb.classList.add('dragging');              // ← добавляем класс
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
      thumb.classList.remove('dragging');         // ← убираем класс
    }
  });

  updateThumb();
}

// Инициализация всех боковых панелей
document.querySelectorAll('.sidebar-wrapper').forEach(initCustomScrollbar);
