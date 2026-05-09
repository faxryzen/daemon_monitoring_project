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
