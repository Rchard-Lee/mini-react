function createTextNode(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      // 处理children中有字符串的情况
      children: children.map((child) =>
        typeof child === "string" ? createTextNode(child) : child
      ),
    },
  };
}

function render(el, container) {
  const dom =
    el.type === "TEXT_ELEMENT"
      ? document.createTextNode(el.type)
      : document.createElement(el.type);

  // 处理props中非children属性
  Object.keys(el.props).forEach((key) => {
    if (key !== "children") {
      dom[key] = el.props[key];
    }
  });

  // 处理props中children属性
  const children = el.props.children;
  children.forEach((child) => render(child, dom));
  container.append(dom);
}

const React = {
  render,
  createElement,
};

export default React;
