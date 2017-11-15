pragma solidity ^0.4.18;
import "zeppelin-solidity/contracts/token/MintableToken.sol";
import "./config/TokenConfig.sol";

/**
 * @title AwesomeToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `StandardToken` functions.
 */
contract AwesomeToken is MintableToken, TokenConfig {

  string public constant name = TOKEN_NAME;
  string public constant symbol = TOKEN_SYMBOL;
  uint8 public constant decimals = TOKEN_DECIMALS;
}
