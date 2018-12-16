const express = require('express')
const rawBodyParser = require('raw-body-parser')
const app = express()
const Web3 = require('web3')
const config = require('./config')
// *** 注：本地以太坊节点的接口地址, 根据自己的环境修改
let ETHNodeHost = config.ETHNodeHost

// 合约地址, 固定值, 不需要改变
let constractAddress = config.constractAddress

// 合约转账方法的签名, 固定值, 不需要改变
let constractMethodSgin = config.constractMethodSgin

// 设置监听端口
let listenPort = config.listenPort

// 设置hostname
let hostname = config.hostname

// 创建和链沟通的web3实例
const web3 = new Web3(new Web3.providers.HttpProvider(ETHNodeHost))

app.use(rawBodyParser())

// 定义server的方法
app.post('/createAccount', createAccount)
app.post('/unlockAccount', unlockAccount)
app.get('/getAccounts', getAccounts)
app.get('/getBalance/:address', getBalance)
app.post('/sendTransaction', sendTransaction)

/**
 * createAccount
 * 创建账户
 *
 * @method POST
 * @param  password 密码, 推荐使用 32 个字符的随机密码 = 为了安全
 * @return address
 */
function createAccount (req, res, next) {
  // 获取请求参数
  try {
    let resBody = req.rawBody.toString('utf8')
    let resData = JSON.parse(resBody)
    let password = resData.password;

    web3.eth.personal.newAccount(password)
      .then(address => {
        console.log(address)
        return successResponse(res, address)
      })
      .catch(errorResult => {
        console.log(errorResult)
        return faildResponse(res, errorResult)
      })
  } catch (e) {
    console.log('[debug createAccount] request e', e)
    return faildResponse(res, 'bode parse error')
  }
}

/**
 * getAccounts
 * 获取账户列表
 *
 * @method  GET
 * @return accounts
 */
function getAccounts (req, res, next) {
  web3.eth.getAccounts()
    .then(accounts => {
        console.log(accounts)
        return successResponse(res, accounts)
    })
    .catch(errorResult => {
      console.log('[debug getAccounts] request e', e)
      return faildResponse(res, 'bode parse error')
    })
}

/**
 * getBalance
 * 获取余额
 *
 * @method  GET
 * @param   address 账户地址
 * @return  balance
 */
function getBalance (req, res, next) {
  // 获取请求参数
  try {
      let address = req.params.address

      // 获取余额信息
      web3.eth.getBalance(address)
      .then(balance => {
        console.log(balance)

          return successResponse(res, balance)
      })
      .catch(errorResult => {
        console.log(errorResult)

        return faildResponse(res, errorResult)
      })
  } catch (e) {
      console.log('[debug getBalance] request e', e)
      return faildResponse(res, 'bode parse error');
  }
}

/**
 * unlockAccount
 * 解锁账户地址
 *
 * @method  POST
 * @param   address 账户地址
 * @param   password 账户密码(创建账户是填写的)
 * @return  bool
 */
function unlockAccount (req, res, next) {
  // 获取请求参数
  try {
    let resBody = req.rawBody.toString('utf8')
    let resData = JSON.parse(resBody)

    let address = resData.address
    let password = resData.password
    let timeout = resData.timeout
    // 默认设置账户解锁时间 60 秒, 可按需求自行更改
    if (!timeout) {
      timeout = 60
    }

    // 解锁账户
    web3.eth.personal.unlockAccount(address, password, timeout)
      .then((result) => {
        console.log(result)
        if (result) {
          return successResponse(res, 'unlockAccount is success')
        } else {
          return faildResponse(res, 'unlockAccount is fail')
        }
      })
      .catch(errorResult => {
        console.log(errorResult)
        return faildResponse(res, 'bode parse error')
      })
  } catch (e) {
      console.log('[debug unlockAccount] request e', e)
      return faildResponse(res, 'bode parse error')
  }
}

/**
 * sendTransaction
 * 使用合约发送合约交易, 内置解锁流程
 *
 * @method  POST
 * @param   from 发送人地址
 * @param   fromPassword 发送人密码(创建账户是填写的)
 * @param   to 接受人地址
 * @param   int amount 转账总额
 * @return  hash 交易的 hash
 */
function sendTransaction(req, res, next) {
  // 获取请求参数
  try {
      let resBody = req.rawBody.toString('utf8')
      console.log('[debug sendTransaction] request ' + resBody)
      let resData = JSON.parse(resBody)
      console.log('[debug sendTransaction] resData ' + resData.amount)

      var from = resData.from
      var fromPassword = resData.fromPassword
      var to = resData.to
      var amount = resData.amount

      // 准备合约交易数据
      let hexAmount = web3.utils.toHex(amount);

      // 0x0000000000000000000000007ad835508e3625bf91b25dc56ee4c5ac740778fb00000000000000000000000000000000000000000000000000000000000f4240
      let paramsEncode = web3.eth.abi.encodeParameter(to, hexAmount)
      let data = paramsEncode.replace(/0x/, constractMethodSgin)

      let params = [{
          from: from,
          to: constractAddress,
          amount: hexAmount,
          data: data
      }]

      console.log(params);

      // 解锁账户 解锁有效时长60秒
      web3.eth.personal.unlockAccount(from, fromPassword, 60)
        .then((result) => {
          if (result) {
            // 发送交易
            web3.eth.sendTransaction(params, (error, hash) => {
              console.log(error, hash)
            })
          } else {
              console.log(result)
              return faildResponse(res, 'unlockAccount is fail')
          }
        })
        .catch(errorResult => {
          console.log(errorResult)
          return faildResponse(res, 'bode parse error')
        })

  } catch (e) {
      console.log('[debug sendTransaction] request e', e)
      return faildResponse(res, 'bode parse error');
  }
}

/**
 * 失败的响应
 */
function faildResponse (resObj, errorMessage, code) {
  if (!code) {
    code = -1
  }

  let responseData = {
    code,
    data: {
      errorMessage
    }
  }

  responseData = JSON.stringify(responseData)
  resObj.send(responseData)
  return resObj.end()
}

/**
 * 成功的响应
 */
function successResponse (resObj, data) {
  if (!data) {
      data = {}
  }

  let responseData = {
      code : 0,
      data : data
  }

  responseData = JSON.stringify(responseData)
  resObj.send(responseData)
  return resObj.end()
}

// 监听端口 在config里面进行设置
app.listen(listenPort, hostname)
console.log(`url地址: http://${hostname}:${listenPort}`)
console.log('server start successfully')
