const AwesomeToken = artifacts.require("./AwesomeToken.sol");
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545")) // Hardcoded development port

const timeTravel = function (time) {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [time], // 86400 is num seconds in day
      id: new Date().getTime()
    }, (err, result) => {
      if(err){ return reject(err) }
      return resolve(result)
    });
  })
}

const mineBlock = function () {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_mine"
    }, (err, result) => {
      if(err){ return reject(err) }
      return resolve(result)
    });
  })
}

contract('AwesomeToken', function(accounts) {

  let decimals = 0;
  let initialSupply = 0;
  let totalSupply = 0;
  let token;

  // TEST DECIMALS
  it("should have 18 decimals", async function () {
    token = await AwesomeToken.deployed();
    decimals = await token.decimals({from:accounts[0]});
    assert.equal(decimals.valueOf(), 18, "Decimals were not set to 18");
  });

  // // TEST INITIAL SUPPLY
  // it("should have an initial supply of 1.000.000 tokens", async function () {
  //   let token = await AwesomeToken.deployed();
  //   initialSupply = await token.INITIAL_SUPPLY({from:accounts[0]});
  //   assert.equal(initialSupply.valueOf(), 1000000 * (10 ** decimals), "INITIAL_SUPPLY was not 10.000");
  // });

  // TEST NAME
  it("should be named Awesome Token", async function () {
    assert.equal(await token.name({from:accounts[0]}).valueOf(), "Awesome Token", "Name was not set to AwesomeToken");
  });

  // TEST SYMBOL
  it("should have the symbol AWE", async function () {
    let token = await AwesomeToken.deployed();
    let symbol = await token.symbol({from:accounts[0]});
    assert.equal(symbol.valueOf(), "AWE", "Symbol was not set to AWE");
  });

  // // TEST INITIAL_SUPPLY == TOTAL SUPPLY
  // it("Total supply and initial supply should be the same when token is initialized", async function () {
  //   let token = await AwesomeToken.deployed();
  //   totalSupply = await token.totalSupply({from:accounts[0]});
  //   assert.equal(totalSupply.valueOf(), initialSupply, "Total supply and initial supply were not the same");
  // });
  //
  // // TEST INITIAL_SUPPLY == TOTAL SUPPLY
  // it("Total supply should be assigned to msg.sender", async function () {
  //   let token = await AwesomeToken.deployed();
  //   let senderBalance = await token.balanceOf(accounts[0],{from:accounts[0]});
  //   assert.equal(senderBalance.valueOf(), totalSupply, "Total supply should be assigned to msg.sender");
  // });

  // it("should fail because function does not exist on contract", async function () {
  //   let meta = await MetaCoin.deployed();
  //   try {
  //     await meta.someNonExistantFn();
  //   } catch (e) {
  //     return true;
  //   }
  //   throw new Error("I should never see this!")
  // })
  //
  // it("should fail specialFn because not enough time passed", async function () {
  //   let meta = await MetaCoin.new();
  //   try {
  //     await timeTravel(10) // Just here so you can play around with time
  //     await mineBlock() //workaround for https://github.com/ethereumjs/testrpc/issues/336
  //     await meta.specialFn.call();
  //   } catch (e) {
  //     return true;
  //   }
  //   throw new Error("Calling specialFn should have failed but somehow succeeded")
  // })
  //
  // it("should successfully call specialFn because enough time passed", async function () {
  //   let meta = await MetaCoin.new();
  //   await timeTravel(86400 * 3) //3 days later
  //   await mineBlock() // workaround for https://github.com/ethereumjs/testrpc/issues/336
  //   let status = await meta.specialFn.call();
  //   assert.equal(status, true, "specialFn should be callable after 1 day")
  // })
  //
  // it("should call a function that depends on a linked library", async function () {
  //   let meta = await MetaCoin.deployed();
  //   let outCoinBalance = await meta.getBalance.call(accounts[0]);
  //   let outCoinBalanceEth = await meta.getBalanceInEth.call(accounts[0]);
  //
  //   let metaCoinBalance = outCoinBalance.toNumber();
  //   let metaCoinEthBalance = outCoinBalanceEth.toNumber();
  //
  //   assert.equal(metaCoinEthBalance, 2 * metaCoinBalance, "Library function returned unexpected function, linkage may be broken");
  // });
  //
  // it("should send coin correctly", async function () {
  //   // Get initial balances of first and second account.
  //   var account_one = accounts[0];
  //   var account_two = accounts[1];
  //
  //   var amount = 10;
  //
  //   let meta = await MetaCoin.deployed();
  //   let balance1 = await meta.getBalance.call(account_one);
  //   let balance2 = await meta.getBalance.call(account_two);
  //
  //   let account_one_starting_balance = balance1.toNumber();
  //   let account_two_starting_balance = balance2.toNumber();
  //
  //   await meta.sendCoin(account_two, amount, {from: account_one});
  //
  //   let balance3 = await meta.getBalance.call(account_one);
  //   let balance4 = await meta.getBalance.call(account_two);
  //
  //   let account_one_ending_balance = balance3.toNumber();
  //   let account_two_ending_balance = balance4.toNumber();
  //
  //   assert.equal(account_one_ending_balance, account_one_starting_balance - 10, "Amount wasn't correctly taken from the sender");
  //   assert.equal(account_two_ending_balance, account_two_starting_balance + 10, "Amount wasn't correctly sent to the receiver");
  // });
});
