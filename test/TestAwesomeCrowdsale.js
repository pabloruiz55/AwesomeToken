const AwesomeCrowdsale = artifacts.require("./AwesomeCrowdsale.sol");
const AwesomeToken = artifacts.require("./AwesomeToken.sol");
const Web3 = require('web3')

//The following line is required to use timeTravel with web3 v1.x.x
Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;

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

const logTitle = function (title) {
  console.log("*****************************************");
  console.log(title);
  console.log("*****************************************");
}

const logError = function (err) {
  console.log("-----------------------------------------");
  console.log(err);
  console.log("-----------------------------------------");
}

contract('AwesomeCrowdsale', function(accounts) {

  //Crowdsale will start two minutes from now.
  let crowdsaleStart = Math.floor(new Date().getTime() /1000 + 120);
  // Crowdsale tiers
  let crowdsaleTier2 = Math.floor(new Date().getTime() /1000 +3600 * 24);
  let crowdsaleTier3 = Math.floor(new Date().getTime() /1000 +3600 * 48);
  //Crowdsale will end 24 hours from now
  let crowdsaleEnd = Math.floor(new Date().getTime() /1000 +3600 * 72);

  let crowdsale;
  let token;

  // INITIALIZATION
  it("should correctly initialize token", async function () {
    crowdsale = await AwesomeCrowdsale.new(crowdsaleStart,crowdsaleTier2,crowdsaleTier3,crowdsaleEnd,accounts[0]);
    let tokenAddress = await crowdsale.token({from:accounts[0]});
    token = await AwesomeToken.at(tokenAddress);

    assert.notEqual(token.valueOf(), "0x0000000000000000000000000000000000000000", "Token was not initialized");
  });

  ///////////////////////////////////////////////////////////////
  //THIS TEST GOES AT THE BEGINNING, TEST CASES BEFORE CROWDSALE STARTS
  ///////////////////////////////////////////////////////////////

  //Trying to buy tokens before the crowdsale started. (CS starts in 2 minutes)
  it("should not allow to buy tokens if crowdsale hasn't started yet", async function () {
    try {
      await crowdsale.buyTokens(accounts[1],{from:accounts[1],value:1 * 10 ** 18});
    } catch (e) {
      return true;
    }
    throw new Error("I should never see this!")
  });

  ///////////////////////////////////////////////////////////////
  //CROWDSALE HAS BEGAN
  ///////////////////////////////////////////////////////////////

  it("Exchange rate should correspond to tier 1 rate: 100k per eth", async function () {
    await timeTravel(600) // Move forward 10 mins in time so the crowdsale has started
    await mineBlock() // workaround for https://github.com/ethereumjs/testrpc/issues/336

    let exchangeRate = await crowdsale.calculateTierBonus({from:accounts[0]});
    assert.equal(exchangeRate.valueOf(),100000, "Exchange rate should be 100k tokens per eth in tier 1");
  });

  it("should be able to buy tokens if the crowdsale started", async function () {
    let ethToSpend = 1 * 10 ** 18; // The buyer will spend 1 eth to buy tokens
    let buyer = accounts[1];
    let exchangeRate = await crowdsale.calculateTierBonus({from:accounts[0]});

    let startingBalance = await token.balanceOf(buyer,{from:buyer});
    //Buy the tokens
    await crowdsale.buyTokens(buyer,{from:buyer,value:ethToSpend});

    //Check buyers token balance
    let newBalance = await token.balanceOf(buyer,{from:buyer});

    //The balance should be equal to
    assert.equal(newBalance.valueOf(),parseInt(startingBalance) + parseInt(ethToSpend) * parseInt(exchangeRate), "Buyers token balance should be equal to what he spent multiplied by the exchange rate");
  });

  it("should NOT allow to buy more tokens than available to crowdsale", async function () {
    try {
      logTitle("Will try to buy and mint more tokens than available");
      await crowdsale.buyTokens(accounts[1],{from:accounts[1],value:95 * 10 ** 18});

    } catch (e) {
      let exchangeRate = await crowdsale.calculateTierBonus({from:accounts[1]});
      let triedToBuy = (95 * 10 ** 18) * parseInt(exchangeRate);
      let mintedForSale = await crowdsale.tokensMintedForSale({from:accounts[1]});
      let hardcap = await crowdsale.TOKENS_SALE({from:accounts[1]});
      logError("Caught ERROR: Tried to buy more tokens than available - Hard cap:" + hardcap + "-- already bought:" + mintedForSale + " -- Tried to buy:" + triedToBuy);
      return true;
    }
    throw new Error("I should never see this!")
  });

  it("should NOT allow to buy tokens if the crowdsale is paused", async function () {
    try {
      logTitle("Will try to buy while the crowdsale is paused");
      await crowdsale.pause({from:accounts[0]});
      console.log(await crowdsale.paused({from:accounts[0]}));
      await crowdsale.buyTokens(accounts[1],{from:accounts[1],value:1 * 10 ** 16});

    } catch (e) {
      logError("Caught ERROR: Tried to buy tokens while crowdsale was paused");
      await crowdsale.unpause({from:accounts[0]});
      return true;
    }
    throw new Error("I should never see this!")
  });

  ///////////////////////////////////////////////////////////////
  //MOVE FORWARD TO TIER 2
  ///////////////////////////////////////////////////////////////

  it("Exchange rate should correspond to tier 2 rate: 70k per eth", async function () {
    await timeTravel(3600 * 25)// Move forward in time so the crowdsale has started
    await mineBlock() // workaround for https://github.com/ethereumjs/testrpc/issues/336

    let exchangeRate = await crowdsale.calculateTierBonus({from:accounts[0]});
    assert.equal(exchangeRate.valueOf(),70000, "Exchange rate should be 70k tokens per eth in tier 2");
  });

  ///////////////////////////////////////////////////////////////
  //MOVE FORWARD TO TIER 3
  ///////////////////////////////////////////////////////////////

  it("Exchange rate should correspond to tier 3 rate: 50k per eth", async function () {
    await timeTravel(3600 * 25)// Move forward in time so the crowdsale has started
    await mineBlock() // workaround for https://github.com/ethereumjs/testrpc/issues/336

    let exchangeRate = await crowdsale.calculateTierBonus({from:accounts[0]});
    assert.equal(exchangeRate.valueOf(),50000, "Exchange rate should be 50k tokens per eth in tier 3");
  });

  ///////////////////////////////////////////////////////////////
  //THIS TEST GOES AT THE END, WE ARE PAST THE CROWDSALE DATE
  ///////////////////////////////////////////////////////////////

  it("should NOT allow to buy tokens if crowdsale has finished", async function () {
    logTitle("Will move forward in time after crowdsale finished and try to buy tokens");
    await timeTravel(3600 * 24 * 6) // Move forward 6 days in time so the crowdsale has ended
    await mineBlock() // workaround for https://github.com/ethereumjs/testrpc/issues/336

    try {
      await crowdsale.buyTokens(accounts[1],{from:accounts[1],value:1*10**18});
    } catch (e) {
      logError("Caught ERROR: Tried to buy tokens after crowdsale had finished");
      return true;
    }
    throw new Error("I should never see this!")
  });




});
