import React from "./core/React.js";

// const App = React.createElement("div", { id: "app" }, "hello ", "app");

// jsx是React搞出来的，jsx经过babel编译后，变成React.createElement()
// React.createElement在这里就走core包里面的函数逻辑了
let count = 10;
let props = { id: count };
const AppFC = ({ num }) => {
  function handleClick() {
    console.log("click");
    count++;
    props.id = count;
    React.update();
  }
  return (
    <div {...props}>
      num: {num}
      count: {count}
      <button onClick={handleClick}>click</button>
    </div>
  );
};

// console.log(AppFC);
// 输出:
// () => {
//  return /* @__PURE__ */ React.createElement("div", null, "hello React");
// }

function App() {
  return (
    <div>
      hello React
      <AppFC num={10}></AppFC>
      <AppFC num={20}></AppFC>
    </div>
  );
}

export default App;
