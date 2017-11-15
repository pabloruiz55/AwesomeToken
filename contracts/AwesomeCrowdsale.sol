pragma solidity ^0.4.18;

import './AwesomeToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';
import './config/TokenSaleConfig.sol';

/**
 * @title Crowdsale
 * @dev Crowdsale is a base contract for managing a token crowdsale.
 * Crowdsales have a start and end timestamps, where investors can make
 * token purchases and the crowdsale will assign them tokens based
 * on a token per ETH rate. Funds collected are forwarded to a wallet
 * as they arrive.
 */
contract AwesomeCrowdsale is Pausable, TokenSaleConfig {
  using SafeMath for uint256;

  // The token being sold
  AwesomeToken public token;

  // start and end timestamps where investments are allowed (both inclusive)
  uint256 public startTime;
  uint256 public tier2Time;
  uint256 public tier3Time;
  uint256 public endTime;

  // address where funds are collected
  address public wallet;

  // amount of raised money in wei
  uint256 public weiRaised;

  //Tokens minted/sold in the crowdsale
  uint256 public tokensMintedForSale;

  //keeps track of whether or not the crowdsale has ended.
  //Will be set to true either when the time is up or when the hard cap is reached
  bool public isFinalized = false;

  ////////////
  // EVENTS //
  ////////////

  event Finalized();

  ///////////////
  // MODIFIERS //
  ///////////////

  modifier onlyDuringSale() {
        require(hasStarted() && !hasEnded());
        _;
    }

  modifier onlyAfterSale() {
      // require finalized is stronger than hasSaleEnded
      require(hasEnded());
      _;
  }

  /////////////////////////////////////////

  /**
   * event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);


  function AwesomeCrowdsale(uint256 _startTime, uint256 _tier2Time, uint256 _tier3Time, uint256 _endTime, address _wallet) {
    require(_startTime >= now);
    require(_endTime >= _startTime);
    require(_wallet != address(0));

    //Validate constants
    require(TIER1_RATE > 0);
    require(TIER2_RATE > 0);
    require(TIER3_RATE > 0);

    token = createTokenContract();
    startTime = _startTime;
    tier2Time = _tier2Time;
    tier3Time = _tier3Time;
    endTime = _endTime;
    wallet = _wallet;
  }

  // creates the token to be sold.
  // override this method to have crowdsale of a specific mintable token.
  function createTokenContract() internal returns (AwesomeToken) {
    return new AwesomeToken();
  }


  // fallback function can be used to buy tokens
  function () public payable whenNotPaused onlyDuringSale {
    buyTokens(msg.sender);
  }

  // low level token purchase function
  function buyTokens(address beneficiary) public payable whenNotPaused onlyDuringSale {
    require(beneficiary != address(0));
    require(msg.value > 0); // Prevent 0 eth purchases

    //contribution received in wei
    uint256 weiAmount = msg.value;

    // calculate token amount to be created
    uint256 exchangeRate = calculateTierBonus();
    uint256 tokens = weiAmount.mul(exchangeRate);

    // Make sure we don't sell more tokens than those available to the crowdsale
    // TBD change this so we can sell the difference.
    require (tokensMintedForSale.add(tokens) <= TOKENS_SALE);

    // update state
    weiRaised = weiRaised.add(weiAmount);  //Keep track of wei raised
    tokensMintedForSale = tokensMintedForSale.add(tokens); //Keep track of tokens sold

    token.mint(beneficiary, tokens);

    TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

    // If all tokens available for sale have been sold, finalize the sale automatically.
    if (tokensMintedForSale == TOKENS_SALE) {
        finalizeInternal();
    }

    forwardFunds();
  }

  //Calculate how many tokens correspond given the ether payed and the current tier.
  function calculateTierBonus() public view returns (uint256){

    if(now >= startTime && now < tier2Time){
      return TIER1_RATE;
    }

    if(now >= tier2Time && now < tier3Time){
      return TIER2_RATE;
    }

    if(now >= tier3Time && now <= endTime){
      return TIER3_RATE;
    }

    //SHOULD NOT be possible to buy tokens in the following cases.
    //Enforced by validPurchase() called in buyTokens().
    if(now < startTime || now > endTime){
      return 0;
    }

  }

  // The internal one will be called if tokens are sold out or
  // the end time for the sale is reached, in addition to being called
  // from the public version of finalize().
  function finalizeInternal() internal returns (bool) {
      require(!isFinalized);

      isFinalized = true;
      Finalized();
      return true;
  }

  // send ether to the fund collection wallet
  // override to create custom fund forwarding mechanisms
  function forwardFunds() internal {
    wallet.transfer(msg.value);
  }

  //
  //Helper functions for onlyDuringSale / onlyAfterSale modifiers
  //

  // @return true if crowdsale event has ended
  function hasEnded() public constant returns (bool) {
    bool _saleIsOver = now > endTime;
    return _saleIsOver || isFinalized;
  }

  // @return true if crowdsale event has started
  function hasStarted() public constant returns (bool) {
    return now >= startTime;
  }
  
  //
  //Utility functions
  //

  function tellTime() public constant returns (uint) {
    return now;
  }


}
