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

function createDom(type) {
  return type === "TEXT_ELEMENT"
    ? document.createTextNode(type)
    : document.createElement(type);
}

function updateProps(dom, props) {
  Object.keys(props).forEach((key) => {
    if (key !== "children") {
      dom[key] = props[key];
    }
  });
}

function initChildren(fiber) {
  const children = fiber.props.children;

  // 记录上一个孩子节点
  let prevChild = null;
  children.forEach((child, index) => {
    // 这里的child其实是vdom，如果直接把parent、child、sibling等属性挂载到其身上，会破坏其原有结构，所以使用新对象去记录这种链式结构
    const newFiber = {
      type: child.type,
      props: child.props,
      child: null,
      parent: fiber,
      sibling: null,
      dom: null,
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }
    prevChild = newFiber;
  });
}

// 第一个执行的任务
let root = null;
// 将要执行的任务
let nextWorkOfUnit = null;

function render(el, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el],
    },
  };

  root = nextWorkOfUnit;
}

// 实现任务调度器
function workLoop(deadline) {
  let shouldYield = false;
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);

    shouldYield = deadline.timeRemaining() < 1;
  }

  // 如果下一个任务已经不存在了，说明已经执行完毕，可以批量渲染 且 只渲染一次（渲染完成之后root为null了）
  if (!nextWorkOfUnit && root) {
    commitRoot();
  }

  // 不会继续上一次，而是新开一个
  requestIdleCallback(workLoop);
}

function commitRoot() {
  commitWork(root.child);
  root = null;
}

function commitWork(fiber) {
  if (!fiber) return;
  // 将当前节点挂载至父级节点上
  fiber.parent.dom.append(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function performWorkOfUnit(fiber) {
  if (!fiber.dom) {
    // 1. 创建dom
    const dom = (fiber.dom = createDom(fiber.type));

    // 2. 处理props
    // 处理props中非children属性
    updateProps(dom, fiber.props);
  }

  // 3. 转换链表，建立指针关系
  initChildren(fiber);

  // 4. 返回下一个要执行的任务
  // 先看当前节点有没有孩子节点
  if (fiber.child) {
    return fiber.child;
  }
  // 再看当前节点有没有兄弟节点
  if (fiber.sibling) {
    return fiber.sibling;
  }
  // 返回叔叔节点（父级的兄弟节点）
  return fiber.parent?.sibling;
}

requestIdleCallback(workLoop);

const React = {
  render,
  createElement,
};

export default React;
