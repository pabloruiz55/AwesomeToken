var AwesomeCrowdsale = artifacts.require("./AwesomeCrowdsale.sol");
var AwesomeToken = artifacts.require("./AwesomeToken.sol");

module.exports = function(deployer) {
  deployer.deploy(AwesomeToken);
  //deployer.deploy(AwesomeCrowdsale,1510671390,1510871824,1510971224,1519671224,"0x0fc20e774ea6674087494a36f8f8f09a4ee3a131");
};
