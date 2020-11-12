const createApplyChildren = el => (children = [], observe) => {
  const applyChildren = (children) => {
    const removeNeedlessElements = () => {
      const index = children.length;
      let toRemoveElem = el.children[index];
      while(toRemoveElem) {
        el.removeChild(toRemoveElem);
        toRemoveElem = el.children[index];
      }
    };
  
    children.forEach((child, index) => {
      const oldEl = el.children[index];
      const newEl = child.elRef();
  
      if (oldEl === newEl) return;
      if (!oldEl) return el.appendChild(newEl);
  
      el.insertBefore(newEl, oldEl);
      el.removeChild(el.children[index + 1]);
    });
  
    removeNeedlessElements();
  };
  return observe(children, applyChildren) || applyChildren(children)
};

const createApplyOptions = el => (opts, observe) => {
  Object.keys(opts).forEach(k => {
    const att = opts[k];
    if (el[k] === att) return;
    const assignValue = val => { el[k] = val };
    return observe(att, assignValue) || assignValue(att);
  });
};

const createListenDomRemoved = el => cb => {
  el.addEventListener(
    'DOMNodeRemoved',
    event => {
      if (event.target !== el) return;
      cb();
    },
    false
  );
};

const createObserve = subs => (obs, cb) => {
  if (!obs || !obs.subscribe) return false;
  cb(obs.get());
  [obs.subscribe(cb)]
    .flat()
    .forEach(unsub => subs.push(unsub));
  return true;
};

const createElement = tag => (...vnode) => {
  const el = document.createElement(tag);
  const [ options, children ] = vnode;
  const subscriptions = [];
  
  const observe = createObserve(subscriptions);
  const applyChildren = createApplyChildren(el);
  const applyOptions = createApplyOptions(el);
  const listenDomRemoved = createListenDomRemoved(el);

  applyOptions(options, observe);
  applyChildren(children, observe);

  listenDomRemoved(
    () => subscriptions.forEach(unsub => unsub())
  );

  return {
    vnode: () => vnode,
    elRef: () => el,
  }
};

const obs = value => {
  const subs = new Map();

  const set = _value => {
    value = _value;
    [...subs.values()].forEach(s => s(value));
    return value;
  };

  const get = () => value;

  const subscribe = f => {
    subs.set(f, f);
    return () => subs.delete(f);
  }

  return { get, set, subscribe };
};

const compute = (comp, ...deps) => {
  const get = () => comp(...deps.map(d => d.get()));

  const subscribe = fn => deps.map(
    d => d.subscribe(
      () => fn(get())
    )
  );

  return { get, subscribe }
};

const [ div, h1, h2, input, button, span, ul, li, img ] = ['div', 'h1', 'h2', 'input', 'button', 'span', 'ul', 'li', 'img']
  .map(t => createElement(t));
  