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
      : document.createElement(element.type);
  const isProperty = (key) => key !== "children";
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });

  return dom;
};

const render = (element, container) => {
  //TODO set next unit of work
  //   element.props.children.forEach((child) =>
  //     render(child, dom)
  //   );
  //   container.appendChild(dom);
};

let nextUnitOfWork = null;

const workLoop = (deadline) => {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
};

requestIdleCallback(workLoop);

const performUnitOfWork = (nextUnitOfWork) => {
  //TODO
};

const Pedantic = {
  createElement,
  render,
};

// const element = Pedantic.createElement(
//   "div",
//   { id: "foo" },
//   Pedantic.createElement("a", null, "bar"),
//   Pedantic.createElement("b")
// )
/** @jsx Pedantic.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);

const container = document.getElementById("root");
Pedantic.render(element, container);
