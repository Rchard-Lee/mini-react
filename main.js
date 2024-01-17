/**
 * 想要在页面上显示app的几种方案
 */

// V1 原生js
// const dom = document.createElement("div");
// dom.id = "app";
// document.querySelector("#root").append(dom);

// const textNode = document.createTextNode("");
// textNode.nodeValue = "app";
// dom.append(textNode);

// v2 react -> vdom -> js object
// 固定写死
// const textEl = {
//   type: "TEXT_ELEMENT",
//   props: {
//     nodeValue: "app",
//     children: [],
//   },
// };

// const el = {
//   type: "div",
//   props: {
//     id: "app",
//     children: [
//       textEl
//     ],
//   }
// }

// const dom = document.createElement(el.type);
// dom.id = el.props.id;
// document.querySelector("#root").append(dom);

// const textNode = document.createTextNode("");
// textNode.nodeValue = textEl.props.nodeValue;
// dom.append(textNode);

// 动态创建
// function createTextNode(text) {
//   return {
//     type: "TEXT_ELEMENT",
//     props: {
//       nodeValue: text,
//       children: [],
//     },
//   };
// }

// function createElement(type, props, ...children) {
//   return {
//     type,
//     props: {
//       ...props,
//       // 处理children中有字符串的情况
//       children: children.map((child) =>
//         typeof child === "string" ? createTextNode(child) : child
//       ),
//     },
//   };
// }

// function render(el, container) {
//   const dom =
//     el.type === "TEXT_ELEMENT"
//       ? document.createTextNode(el.type)
//       : document.createElement(el.type);

//   // 处理props中非children属性
//   Object.keys(el.props).forEach((key) => {
//     if (key !== "children") {
//       dom[key] = el.props[key];
//     }
//   });

//   // 处理props中children属性
//   const children = el.props.children;
//   children.forEach((child) => render(child, dom));
//   container.append(dom);
// }

// const textEl = createTextNode("app");
// const App = createElement("div", { id: "app" }, "hello ", textEl);
// render(App, document.querySelector("#root"));

// V3 按照react中的写法渲染出app
import ReactDom from "./core/ReactDom.js";
import App from "./App.js";

ReactDom.createRoot(document.querySelector("#root")).render(App);
