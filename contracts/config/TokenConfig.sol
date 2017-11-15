pragma solidity ^0.4.18;

contract TokenConfig {

    string  public constant TOKEN_SYMBOL   = "AWE";
    string  public constant TOKEN_NAME     = "Awesome Token";
    uint8   public constant TOKEN_DECIMALS = 18;

    uint256 public constant DECIMALSFACTOR = 10**uint256(TOKEN_DECIMALS);
}
