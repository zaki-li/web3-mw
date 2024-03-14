const Web3 = require("web3");

const EventEmitter = require("events");
const myEmitter = new EventEmitter();

myEmitter.setMaxListeners(99999); // 增加监听器的限制

const PRIVATEKEY = ""; // 私钥
const DEF_ADDRESS_TO = ""; // 地址

const PRC_NODE_URL = "https://polygon-bor.publicnode.com"; // BSC节点URL
const PRC_TX_URL = "https://polygonscan.com/tx/";

const BSC_NODE_URL = "https://bsc-dataseed2.bnbchain.org"; // BSC节点URL
const BSC_TX_URL = "https://bscscan.com/tx/";

const AVAX_NODE_URL = "https://avax.meowrpc.com"; // BSC节点URL
const AVAX_TX_URL = "https://snowtrace.io/tx/";

const MANTA_NODE_URL = "https://1rpc.io/manta";
const MANTA_TX_URL = "https://pacific-explorer.manta.network/tx/";

const OPBNB_NODE_URL = "https://opbnb-mainnet-rpc.bnbchain.org";
const OPBNB_TX_URL = "https://opbnb.bscscan.com/tx/";

// =======================================配置=======================================
const CUR_NODE_URL = OPBNB_NODE_URL;
const CUR_TX_URL = OPBNB_TX_URL;

const opbrd = 'data:application/json,{"p":"opbrc","op":"mint","tick":"opbn"}';
const MNT_DATA = opbrd; // 要转换的字符串
const SEND_VALUE = "0"; // 发送的金额
const ADDRESS_TO = "";  // 发送的地址

// =======================================配置=======================================

const web3 = new Web3(new Web3.providers.HttpProvider(CUR_NODE_URL));
async function main() {
  const wallet = await initWallet(PRIVATEKEY);

  const hexData = web3.utils.utf8ToHex(MNT_DATA);
  console.log("铭文内容：", hexData);
  while (true) {
    try {
      // await doMWPro(wallet, wallet.address, hexData);
      await doMWPro(wallet, ADDRESS_TO, hexData);
      await sleep(200);
    } catch (error) {
      await sleep(2000);
    }
  }
}

async function initWallet(privateKey) {
  const wallet = web3.eth.accounts.privateKeyToAccount(privateKey);
  console.log("钱包地址:" + wallet.address);
  return wallet;
}

async function doMWPro(wallet, to, data) {
  const address = wallet.address;
  // console.log(`[${address}]`);
  console.log(`开始铭刻... `);
  const balance = await web3.eth.getBalance(address);
  // Convert the balance from wei to ether (1 ether = 10^18 wei)
  const etherBalance = web3.utils.fromWei(balance, "ether");
  console.log(`账户余额: ${etherBalance}`);
  return new Promise(async (resolve, reject) => {
    // 执行代码
    const timeoutId = setTimeout(() => {
      console.log("执行超时了");
      resolve();
      // 在这里可以添加超时时的处理逻辑，例如终止代码执行或者抛出异常
    }, 20000);
    try {
      await doMW(wallet, to, data);
    } catch (error) {
      console.log(error);
      console.log("铭刻失败");
      await sleep(2000);
    }
    clearTimeout(timeoutId);
    console.log("铭刻结束");
    resolve();
  });
}

async function doMW(wallet, to, data) {
  let gasPrice = await web3.eth.getGasPrice();
  gasPrice = Math.floor(parseInt(gasPrice) * 1).toString();
  let maxGasPrice = Math.floor(parseInt(gasPrice) * 1.5).toString();
  const gasPriceInGwei = web3.utils.fromWei(gasPrice, "gwei");
  const maxGasPriceInGwei = web3.utils.fromWei(maxGasPrice, "gwei");
  const maxGas = web3.utils.toWei(maxGasPriceInGwei, "gwei");
  const priGas = web3.utils.toWei(gasPriceInGwei, "gwei");
  console.log(`[GAS PRICE] ${gasPriceInGwei} gwei`);
  console.log(`[MAX GAS PRICE] ${maxGasPriceInGwei} gwei`);
  let mintValue = web3.utils.toWei(SEND_VALUE, "ether");
  const signedTx = await wallet.signTransaction({
    from: wallet.address,
    to,
    data,
    maxFeePerGas: maxGas,
    maxPriorityFeePerGas: priGas,
    gasLimit: 35162,
    // gas: 35162,
    // gasPrice: priGas,
    value: mintValue, // 0值
    nonce: await web3.eth.getTransactionCount(wallet.address),
  });
  const txResponse = await web3.eth.sendSignedTransaction(
    signedTx.rawTransaction
  );
  console.log("交易结束：", `${CUR_TX_URL}${txResponse.transactionHash}`);
}

function getDateTime(timestamp) {
  // 创建一个新的 Date 对象，传入时间戳作为参数
  const date = new Date(timestamp);

  // 使用 Date 对象的方法获取各种时间信息
  const year = date.getFullYear();
  const month = formatNumberWithLeadingZero(date.getMonth() + 1); // 加 1 是因为月份从 0 开始
  const day = formatNumberWithLeadingZero(date.getDate());
  const hours = formatNumberWithLeadingZero(date.getHours());
  const minutes = formatNumberWithLeadingZero(date.getMinutes());
  const seconds = formatNumberWithLeadingZero(date.getSeconds());

  // 构建时间字符串
  const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedTime;
}

function formatNumberWithLeadingZero(number) {
  return number.toString().padStart(2, "0");
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

main();
