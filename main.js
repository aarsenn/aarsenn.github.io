// state
const localStorageStateProvider = () => ({
  getState: () => localStorage.getItem('state'),
  setState: state => localStorage.setItem('state', state)
});

const initState = stateProvider => JSON.parse(stateProvider.getState()) || { count: 0 };

const createSetState = (state, provider) => newState => {
  state = mergeDeep(state, newState);
  provider.setState(JSON.stringify(state));
  return state;
};

// render
const createRender = rootElement => (component, lib) => {
  window.__handlers = [];
  rootElement.innerHTML = component(lib);
};

const bindHandler = (handler) => {
  if (!window.__handlers) {
    window.__handlers = [];
  }

  window.__handlers.push(handler);

  return `__handlers[${window.__handlers.length - 1}](event)`;
};

// utils
const mergeDeep = (...objects) => {
  const isObject = obj => obj && typeof obj === 'object';
  
  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach(key => {
      const pVal = prev[key];
      const oVal = obj[key];
      
      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal);
      }
      else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      }
      else {
        prev[key] = oVal;
      }
    });
    
    return prev;
  }, {});
};

//bootstrap
const bootstrap = (elementId) => {
  const stateProvider = localStorageStateProvider();
  const state = initState(stateProvider);
  const render = createRender(document.querySelector(elementId));
  const setState = createSetState(state, stateProvider);
  return { render, setState, state };
};

//components
const Image = src => `
  <img src="${src}"/>
`;

const Count = (count) => `
  <h1 style="color: #fff;">Випито чаю - ${count}</h1>
`;

const Button = (text, handler) => `
  <button type="button" onclick="${handler}">${text}</button>
`;

const AppComponent = (bag) => {
  const { state, setState, render } = bag;

  const increment = () => {
    const newState = setState({
      count: state.count + 1
    });
    render(AppComponent, { ...bag, state: newState });
  };

  const clear = () => {
    if(!confirm('Очистити лічильник чаю?')) return;
    const newState = setState({
      count: 0
    });
    render(AppComponent, { ...bag, state: newState });
  };

  const style = `
    display: flex;
    justify-content: center;
    padding: 30px;
    height: calc(100% - 60px);
    align-items: center;
  `;

  return `
    <div style="${style}">
      <div>
        ${Image('images/tea.png')}
      </div>
      <div>
        ${Count(state.count)}
        ${Button(
          'Плюс чаюха',
          bindHandler(increment),
        )}
        ${Button(
          'Обнулити',
          bindHandler(clear),
        )}
      </div>
    </div>
  `
};

// main
const main = () => {
  const bag = bootstrap('#app');
  const { render } = bag;
  render(AppComponent, bag);
};

main();
