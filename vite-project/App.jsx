import React from "./core/React.js";

// const App = React.createElement("div", { id: "app" }, "hello ", "app");

// jsx是React搞出来的，jsx经过babel编译后，变成React.createElement()
// React.createElement在这里就走core包里面的函数逻辑了

const AppFC = ({num}) => {
  return <div>Function {num}</div>;
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
