# mini-react

## 问题1. 如何在页面中呈现出文字？（开始重构React api）
#### -（1）vdom写死，dom渲染写死
#### -（2）vdom动态生成，dom渲染写死
#### -（3）vdom动态生成，dom动态递归生产

#### ps：jsx语法本质是通过借助babel、vite、webpack等工具，转换成React.createElement函数，该函数返回vdom
#### ps1： 如果不想被转换成React.createElement，可以在页面顶部通过注释（这种注释叫做：js pragma）: /**@jsx LReact.create(自定义名) */ 即可。（vite中如此，其他工具有待考证）