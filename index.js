const createElement = (type, props, ...children) => {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object"
          ? child
          : createTextElement(child)
      ),
    },
  };
};

const createTextElement = (text) => {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
};

const createDom = (fiber) => {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
};
const isEvent = (key) => key.startsWith("on");
const isProperty = (key) =>
  key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) =>
  prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);

const updateDom = (dom, prevProps, nextProps) => {
  //TODO

  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      (key) =>
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    )
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => (dom[name] = ""));

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => (dom[name] = nextProps[name]));

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
};

const commitRoot = () => {
  //TODO add nodes to dom
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
};

const commitWork = (fiber) => {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;
  if (
    fiber.effectTag === "PLACEMENT" &&
    fiber.dom !== null
  ) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent);
  } else if (
    fiber.effectTag === "UPDATE" &&
    fiber.dom !== null
  ) {
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    );
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
};

const commitDeletion = (fiber, domParent) => {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
};

const render = (element, container) => {
  //TODO set next unit of work
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
};

let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;
let deletions = null;

const workLoop = (deadline) => {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
};

requestIdleCallback(workLoop);

const performUnitOfWork = (fiber) => {
  //TODO add dom node
  const isFunctionComponent =
    fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
};

let wipFiber = null;
let hookIndex = null;

const updateFunctionComponent = (fiber) => {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
};

const useState = (initial) => {
  //TODO
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    hook.state = action(hook.state);
  });

  const setState = (action) => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
};

const updateHostComponent = (fiber) => {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
};

//TODO create new fibers
const reconcileChildren = (wipFiber, elements) => {
  let index = 0;
  let oldFiber =
    wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];

    const newFiber = null;

    //TODO compare oldFiber to element
    const sameType =
      oldFiber && element && element.type == oldFiber.type;

    if (sameType) {
      //TODO update the node
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }
    if (element && !sameType) {
      //TODO add this node
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }

    if (oldFiber && !sameType) {
      //TODO delete the oldFiber's node
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
};

const Pedantic = {
  createElement,
  render,
  useState,
};

// const element = Pedantic.createElement(
//   "div",
//   { id: "foo" },
//   Pedantic.createElement("a", null, "bar"),
//   Pedantic.createElement("b")
// )

/** @jsx Pedantic.createElement */
const container = document.getElementById("root");

// const updateValue = (e) => {
//   rerender(e.target.value);
// };

// const rerender = (value) => {

//   const element = (
//     <div>
//       <input onInput={updateValue} value={value} />
//       <h2>Hello {value}</h2>
//     </div>
//   );

//   Pedantic.render(element, container);
// };

// rerender("World");

const Counter = () => {
  const [state, setState] = Pedantic.useState(1);
  return (
    <h1 onClick={() => setState((c) => c + 1)}>
      Count: {state}
    </h1>
  );
};

const App = (props) => {
  return <h1>Hi {props.name}</h1>;
};

const element = (
  <div>
    <App name="counter" />
    <Counter />
  </div>
);
Pedantic.render(element, container);
