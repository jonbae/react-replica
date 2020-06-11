import {
  createElement,
  render,
  useState,
  useEffect,
} from "./Pedantic";

/** @jsx Pedantic.createElement */
const container = document.getElementById("root");

const Counter = () => {
  const [state, setState] = useState(1);
  useEffect(() => {
    console.log(state);
  }, []);

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
render(element, container);

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
