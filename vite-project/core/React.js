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
      children: children.map((child) => {
        const isTextNode =
          typeof child === "string" || typeof child === "number";
        return isTextNode ? createTextNode(child) : child;
      }),
    },
  };
}

function createDom(type) {
  return type === "TEXT_ELEMENT"
    ? document.createTextNode(type)
    : document.createElement(type);
}

function updateProps(dom, nextProps, prevProps) {
  // 分三种情况处理：
  // 1. 老的有新的没有 删除
  Object.keys(prevProps).forEach((key) => {
    if (key !== "children") {
      if (!(key in nextProps)) {
        dom.removeAttribute(key);
      }
    }
  });
  // 2. 老的没有新的有 添加
  // 3. 老的有新的也有 修改
  Object.keys(nextProps).forEach((key) => {
    if (key !== "children") {
      if (nextProps[key] !== prevProps[key]) {
        if (key.startsWith("on")) {
          const eventType = key.slice(2).toLowerCase();
          dom.removeEventListener(eventType, prevProps[key]);
          dom.addEventListener(eventType, nextProps[key]);
        } else {
          dom[key] = nextProps[key];
        }
      }
    }
  });
}

function reconcileChildren(fiber, children) {
  let oldFiber = fiber.alternate?.child;
  // 记录上一个孩子节点
  let prevChild = null;
  children.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child.type;

    let newFiber = null;
    if (isSameType) {
      // update
      newFiber = {
        type: child.type,
        props: child.props,
        child: null,
        parent: fiber,
        sibling: null,
        dom: oldFiber.dom,
        effectTag: "update",
        alternate: oldFiber,
      };
    } else {
      // 这里的child其实是vdom，如果直接把parent、child、sibling等属性挂载到其身上，会破坏其原有结构，所以使用新对象去记录这种链式结构
      newFiber = {
        type: child.type,
        props: child.props,
        child: null,
        parent: fiber,
        sibling: null,
        dom: null,
        effectTag: "placement",
      };
    }

    // 如果不止一个孩子节点
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }
    prevChild = newFiber;
  });
}

// work in progress 正在工作中的节点
let wipRoot = null;
// 对根节点任务的一个缓存(更新的时候使用)
let currentRoot = null;
// 将要执行的任务
let nextWorkOfUnit = null;

function render(el, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [el],
    },
  };

  nextWorkOfUnit = wipRoot;
}

// 实现任务调度器
function workLoop(deadline) {
  let shouldYield = false;
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);

    shouldYield = deadline.timeRemaining() < 1;
  }

  // 如果下一个任务已经不存在了，说明已经执行完毕，可以批量渲染 且 只渲染一次（渲染完成之后root为null了）
  if (!nextWorkOfUnit && wipRoot) {
    commitRoot();
  }

  // 不会继续上一次，而是新开一个
  requestIdleCallback(workLoop);
}

function commitRoot() {
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) return;

  let fiberParent = fiber.parent;
  // 函数组件上面是没有dom的，所以需要去取更上一级以上的dom挂载
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }

  if (fiber.effectTag === "update") {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
  } else if (fiber.effectTag === "placement") {
    // 将当前节点挂载至父级节点上，函数组件不挂载(不存在dom)
    fiber.dom && fiberParent.dom.append(fiber.dom);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

// 处理函数组件
function updateFunctionComponent(fiber) {
  // 函数组件不需要创建dom
  // 对函数组件的返回值用数组包裹一层
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

// 处理正常组件
function updateHostComponent(fiber) {
  if (!fiber.dom) {
    // 1. 创建dom
    const dom = (fiber.dom = createDom(fiber.type));

    // 2. 处理props
    // 处理props中非children属性
    updateProps(dom, fiber.props, {});
  }

  const children = fiber.props.children;
  // 3. 转换链表，建立指针关系
  reconcileChildren(fiber, children);
}

function performWorkOfUnit(fiber) {
  const isFunctionComponent = typeof fiber.type === "function";

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // 4. 返回下一个要执行的任务
  // 先看当前节点有没有孩子节点
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    // 看当前节点有没有兄弟节点
    if (nextFiber.sibling) return nextFiber.sibling;
    // 没有递归找父级的兄弟节点
    nextFiber = nextFiber.parent;
  }
}

requestIdleCallback(workLoop);

function update() {
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    // 指向老节点
    alternate: currentRoot,
  };

  nextWorkOfUnit = wipRoot;
}

const React = {
  render,
  update,
  createElement,
};

export default React;
