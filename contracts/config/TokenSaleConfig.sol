pragma solidity ^0.4.18;

import "./TokenConfig.sol";

contract TokenSaleConfig is TokenConfig {

    /*uint256 public constant START_TIME                = 1510664400; // xxxx-xx-xx xx:xx:xx UTC
    uint256 public constant PHASE2_START_TIME         = 1510750800; // xxxx-xx-xx xx:xx:xx UTC
    uint256 public constant PHASE3_START_TIME         = 1510750800; // xxxx-xx-xx xx:xx:xx UTC
    uint256 public constant END_TIME                  = 1511269199; // xxxx-xx-xx xx:xx:xx UTC*/

    uint256 public constant TIER1_RATE                  = 100000;
    uint256 public constant TIER2_RATE                  =  70000;
    uint256 public constant TIER3_RATE                  =  50000;


    uint256 public constant CONTRIBUTION_MIN          = 1 * 10 ** 17; // 0.1 ether
    uint256 public constant CONTRIBUTION_MAX          = 100 ether;

    uint256 public constant TOKENS_SALE               = 500000 * DECIMALSFACTOR;  // 50%
    uint256 public constant TOKENS_FOUNDERS           = 200000  * DECIMALSFACTOR; // 30%
    uint256 public constant TOKENS_ADVISORS           =  50000  * DECIMALSFACTOR; // 5%
    uint256 public constant TOKENS_EARLY_INVESTORS    = 200000  * DECIMALSFACTOR; // 15%
    //uint256 public constant TOKENS_ACCELERATOR_MAX    = 257558034 * DECIMALSFACTOR;
    //uint256 public constant TOKENS_FUTURE             = 120000000 * DECIMALSFACTOR;

}
