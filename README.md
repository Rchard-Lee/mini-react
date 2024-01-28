# mini-react

## 在页面中呈现出文字（开始重构React api）
#### -（1）vdom写死，dom渲染写死
#### -（2）vdom动态生成，dom渲染写死
#### -（3）vdom动态生成，dom动态递归生产

#### ps：jsx语法本质是通过借助babel、vite、webpack等工具，转换成React.createElement函数，该函数返回vdom
#### ps1： 如果不想被转换成React.createElement，可以在页面顶部通过注释（这种注释叫做：js pragma）: /**@jsx LReact.create(自定义名) */ 即可。（vite中如此，其他工具有待考证）

## 实现任务调度器
#### 为什么要实现任务调度器？
#### - dom树特别大，导致页面渲染卡顿
#### 解决思路
#### - 把大任务拆分到多个task里面完成
#### 实现
#### - 采用requestIdleCallback分帧运算
#### requestIdleCallback(calc)在浏览器有空余时间时会调用回调函数，但是如果回调函数calc一直执行，浏览器依然会卡住，这时候就需要采用注入calc(deadline)中deadline.timeRemaining()拿到剩余空闲时间决定当前回调是否继续执行。

## 实现fiber架构
#### 问题：如何做到每次只渲染几个节点？下次执行时依然从之前的位置执行？
#### 解决思路：把树结构转变成链表结构：
#### - child
#### - sibling
#### - parent
#### 实现performUnitOfWork
#### 1. 创建dom
#### 2. 把dom添加到父级容器内
#### 3. 设置dom的props
#### 4. 建立关系child sibling parent
#### 5. 返回下一个节点

## 目标：统一提交
#### 问题：中途有可能没有空余时间，用户会看到渲染到一半的dom
#### 解决思路：计算结束后统一添加到屏幕里面。


==========================================================================================
## 实现支持Function Component
#### 解决思路: 把FC当作一个盒子，返回值为需要拆解的内容
#### 实现：
#### 1. type的处理（判断是不是FC）
#### 2. 根据type区别FC和非FC
#### 3. 添加到视图的处理（FC不需要挂载真实DOM，其孩子节点需要通过递归等挂载到其FC的父DOM上）

## 实现绑定事件
#### 解决思路：基于onClick来注册点击事件
