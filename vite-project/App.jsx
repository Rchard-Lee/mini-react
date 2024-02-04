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

let showBar1 = false;
const UpdateContainer1 = () => {
  const Foo = () => <div>foo</div>;
  const bar = <p>bar</p>;

  function handleShowBar() {
    showBar1 = !showBar1;
    React.update();
  }

  return (
    <div>
      Update1
      <div>{showBar1 ? bar : <Foo></Foo>}</div>
      <button onClick={handleShowBar}>show bar1</button>
    </div>
  );
};

let showBar2 = false;
const UpdateContainer2 = () => {
  const foo = (
    <div>
      foo
      <div>child1</div>
      <div>child2</div>
    </div>
  );
  const bar = <div>bar</div>;

  function handleShowBar() {
    showBar2 = !showBar2;
    React.update();
  }

  return (
    <div>
      Update2
      <div>{showBar2 ? bar : foo}</div>
      <button onClick={handleShowBar}>show bar2</button>
    </div>
  );
};

// console.log(AppFC.toString());
// 输出:
// ({ num }) => {
//   function handleClick() {
//     console.log("click");
//     count++;
//     props.id = count;
//     React.update();
//   }
//   return /* @__PURE__ */ React.createElement("div", { ...props }, "num: ", num, "count: ", count, /* @__PURE__ */ React.createElement("button", { onClick: handleClick }, "click"));
// }

function App() {
  return (
    <div>
      hello React 更新props:<AppFC num={10}></AppFC>
      更新:新的dom和老dom不一致:<UpdateContainer1></UpdateContainer1>
      更新:新的dom比老的短:<UpdateContainer2></UpdateContainer2>
    </div>
  );
}

export default App;
