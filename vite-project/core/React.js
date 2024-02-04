// #region 虚拟dom

// 创建文本类型虚拟dom节点
function createTextNode(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// 创建其他类型虚拟dom节点
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

// 创建虚拟dom节点
function createDom(type) {
  return type === "TEXT_ELEMENT"
    ? document.createTextNode(type)
    : document.createElement(type);
}

// #endregion

// #region 更新Props

// 更新Props
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
        // 如果是事件类型
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

// #endregion

// #region 构建fiber链式关系

// 协调孩子形成fiber结构（构建链式关系）
function reconcileChildren(fiber, children) {
  // 原来的fiber结构
  let oldFiber = fiber.alternate?.child;
  // 记录上一个孩子节点
  let prevChild = null;
  // 广度优先遍历孩子
  children.forEach((child, index) => {
    // 判断类型是否一致
    const isSameType = oldFiber && oldFiber.type === child.type;
    let newFiber = null;
    if (isSameType) {
      // 如果类型一致则更新
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
      // 处理{isTrue && <comp></comp>}这种写法，此时若isTrue为false，会直接渲染false从而导致出错
      if (child) {
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
      // 如果旧fiber存在，就把它放入删除数组中
      oldFiber && deletions.push(oldFiber);
    }

    // 指向旧fiber的兄弟节点（与新fiber一样，广度优先遍历，保持同步）
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    // 构建链式关系
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }

    if (newFiber) {
      // 把当前节点作为上一个节点
      prevChild = newFiber;
    }
  });

  // 如果孩子节点遍历完了，oldFiber还有值，说明oldFiber有多余兄弟节点，需要继续删除
  while (oldFiber) {
    deletions.push(oldFiber);
    oldFiber = oldFiber.sibling;
  }
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

    // 2. 处理props(这里其实就是对dom的属性进行赋值)
    // 处理props中非children属性
    updateProps(dom, fiber.props, {});
  }

  const children = fiber.props.children;
  // 3. 转换链表，建立指针关系
  reconcileChildren(fiber, children);
}

// #endregion

// #region 批量渲染

function commitRoot() {
  deletions.forEach(commitDeletion);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
  deletions = [];
}

// 删除不需要再渲染的fiber
function commitDeletion(fiber) {
  if (fiber.dom) {
    let fiberParent = fiber.parent;
    while (!fiberParent.dom) {
      fiberParent = fiberParent.parent;
    }
    fiberParent.dom.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child);
  }
}

// 构建dom树
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

// #endregion

// #region 全局变量

// work in progress 正在工作中的节点（构建dom渲染的时候使用）
let wipRoot = null;
// 对根节点任务的一个缓存(更新的时候使用)
let currentRoot = null;
// 将要执行的任务（调度任务的时候使用）
let nextWorkOfUnit = null;
// 将要删除的节点放入一个数组存储
let deletions = [];

// #endregion

// 处理每一个任务
function performWorkOfUnit(fiber) {
  // 判断是否是函数组件
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

// 通过requestIdleCallback利用浏览器空余时间调度任务
requestIdleCallback(workLoop);

// #region 提供初次渲染及更新

// 处理初次渲染
function render(el, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [el],
    },
  };

  nextWorkOfUnit = wipRoot;
}

// 处理更新
function update() {
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    // 指向老节点
    alternate: currentRoot,
  };

  nextWorkOfUnit = wipRoot;
}

// #endregion

const React = {
  render,
  update,
  createElement,
};

export default React;
