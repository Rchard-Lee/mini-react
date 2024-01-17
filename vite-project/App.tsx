import React from "./core/React.js";

// const App = React.createElement("div", { id: "app" }, "hello ", "app");

// jsx是React搞出来的，jsx经过babel编译后，变成React.createElement()
// React.createElement在这里就走core包里面的函数逻辑了
const appFC = () => {
  return <div>hello React</div>;
};

console.log(appFC);
// 输出:
// () => {
//  return /* @__PURE__ */ React.createElement("div", null, "hello React");
// }

const App = <div>hello React</div>;

export default App;
