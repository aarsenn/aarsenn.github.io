const createPersistProvider = key => {
  const get = () => {
    const str = localStorage.getItem(key)
    return Number(str) || 0;
  };

  const set = count => localStorage.setItem(key, count);

  return { get, set }
};

const TeaCounter = (
  { message, addButtonMessage, resetButtonMessage, confirmResetMessage }
) => {
  const countPersist = createPersistProvider('count');

  const $count = obs(countPersist.get());

  const $message = compute(
    count => `${message} - ${count}`,
    $count
  );

  const increment = () => $count.set($count.get() + 1);

  const reset = () => {
    if(!confirm(confirmResetMessage)) return;
    $count.set(0)
  };

  const style = `
    display: flex;
    justify-content: center;
    padding: 30px;
    height: calc(100% - 60px);
    align-items: center;
    display: flex;
    color: #fff
  `;

  const btnStyle = `
    margin-right: 15px
  `;

  $count.subscribe(
    count => countPersist.set(count)
  );

  return div({ style, className: 'tea-counter' }, [
    img({ src: 'images/tea.png' }),
    div({}, [
      h1({ innerText: $message }),
      button({
        style: btnStyle,
        innerText: addButtonMessage,
        onclick: increment
      }),
      button({
        innerText: resetButtonMessage,
        onclick: reset
      })
    ])
  ]);
};

const App = () => {
  return TeaCounter({
    message: 'Випито чаю',
    addButtonMessage: 'Плюс чаюха',
    resetButtonMessage: 'Обнулити',
    confirmResetMessage: 'Обнулити чаюхи?'
  })
};

const main = () => {
  const rootCmp = App();
  const rootEl = document.querySelector('#app');
  rootEl.appendChild(rootCmp.elRef());
};

main();
