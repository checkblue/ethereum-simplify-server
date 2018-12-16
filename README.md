**简介** 快速和以太坊链条进行沟通的server

# 连接以太坊链条Server


[![NPM Version][npm-image]][npm-url]

请仔细阅读下方使用说明

## 依赖环境

#### 如果以下依赖环境都存在请直接看使用方法

### Node

```js
node版本 >= 6.0.0
node下载地址
http://nodejs.cn/download

linux安装node说明
http://www.cnblogs.com/liuqi/p/6483317.html

windows安装node说明
http://www.runoob.com/nodejs/nodejs-install-setup.html
```

### Npm

```js
npm版本 >= 5.0.0 (node安装完成之后npm也安装完成，如没有发现npm请baidu或者google)
```

### Python

```js
Python版本 <= 2.7 (3.x.x不要安装3以上的版本) 此环境是以太坊web3在本地进行编译的时候需要的

python在windows的安装
http://www.cnblogs.com/windinsky/archive/2012/09/20/2695520.html

python在linux安装
http://www.cnblogs.com/feng18/p/5854912.html
```

## 启动以太坊区块链
```js
// 使用geth进行启动
geth --identity "itari" --datadir data0 --networkid 899 --port 30303 --rpc --rpcaddr localhost --rpcport 8545 --rpcapi "web3" --rpccorsdomain "*" console 2>> data.log

--datadir 使用那个目录作为数据目录
--networkid 网络ID 加入哪个网络
--port 连接端口
--rpc 启动RPC连接
--rpcaddr 连接该客户端的地址
--rpcport 连接该客户端的端口
--rpcapi  支持哪些接口调用
--rpccorsdomain 允许哪些域名请求 * 为所有请求
```

## 启动Server

### 安装

```js
在指定目录下执行:
npm install ethereum-simplify-server

(因为有墙的缘故如果下载过慢请执行:)
npm install ethereum-simplify-server --registry=https://registry.npm.taobao.org
```

### 配置

```js
npm安装完成之后进入ethereum-simplify-server目录中
用编辑器打开config.js文件进行相关配置:

const config = {
  // 本地以太坊节点的接口地址, 连接方式暂时只支持http
  ETHNodeHost: 'http://127.0.0.1:8546',
  
  // 域链合约地址, 固定值, 不需要改变
  DOCConstractAddress: '0x450bbc727100D806797CD617c88d1319563F8416',
  
  // 域链合约转账方法的签名, 固定值, 不需要改变
  DOCConstractMethodSgin: '0xa9059cbb',
  
  // 启动http server的时候要监听的端口(3000为默认端口)
  listenPort: 3000,
  
  // 设置hostname
  hostname: '127.0.0.1'
}


```

### 启动

```js
在ethereum-simplify-server目录中:
node index.js

执行完成之后会显示:
url地址: http:127.0.0.1:3000
server start successfully
```

## 使用方法

### 请求方式
```js
使用能发送http请求的工具即可
```

### 方法

(以下http://127.0.0.1:3000 只是举例请按照自己配置为主)

```js
// 创建账号
createAccount
url:http://127.0.0.1:3000/createAccount
method: POST
Body: 
  password: '密码' 推荐使用 32 个字符的随机密码 = 为了安全
```

```js
// 获取账号列表
getAccounts
url: http://127.0.0.1:3000/createAccount
method: GET
Query:
```

```js
// 获取余额
getBalance
url: http://127.0.0.1:3000/getBalance/$address
method: GET
Params:
  $address: '地址' 必填 要查询的账户地址
例: curl http://127.0.0.1:3000/getBalance/xxxxxxxxxxxxxxxx
```

```js
// 解锁账号
unlockAccount
url: http://127.0.0.1:3000/unlockAccount
method: POST
Body:
  address: '解锁账户地址' 必填
  password: '解锁账户密码' 必填
  timeout: '超时时间' 选填 默认60

```

```js
// 发送交易
sendDochainTransaction
url: http://127.0.0.1:3000/sendDochainTransaction
method: POST
Body:
  from: '发送人地址'
  fromPassword: '发送人密码'
  to: '接受人地址'
  amount: '转账总额'
```

### 请求返回格式

#### 成功
```js
//返回格式
{
      code : 0,
      // data 返回的格式
      data : data
}
```

#### 失败
```js
//返回格式
{
    code : -1,
    // 错误信息
    data: {
      errorMessage: '错误信息'
    }
  }
```

[npm-image]: https://img.shields.io/npm/v/express.svg
[npm-url]: https://npmjs.org/package/express
