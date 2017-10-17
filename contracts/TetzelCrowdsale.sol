pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/crowdsale/Crowdsale.sol';
import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import './TetzelCoin.sol';

contract TetzelCrowdsale is Crowdsale {
  address public teamWallet = 0x244b236b19ea4cA308A994edd51A786C726B7864; // xcxc - Change this to real address
  address public charityWallet = 0x8b2448602f53608F86cf2c31D60eb3142a1596d4; // xcxc - Change this to real address
  address public ownerWallet = 0xeFDA35E0CdF4E70CB616ef3265204AD1B037CFb9; // xcxc - Change this to real address
  uint256 public totalCost = 1 ether; // xcxc - change this to real value once final costs are known
  uint256 public rate = 500; // 1 eth = 500 SIN
  uint256 public startTime = block.timestamp;
  uint256 public endTime = block.timestamp + 60*60*24*7;

  bool teamTokensMinted = false;

  function TetzelCrowdsale() Crowdsale(startTime, endTime, rate, teamWallet) {}

  function createTokenContract() internal returns (MintableToken) {
    return new TetzelCoin();
  }

  function forwardFunds() internal {

    uint256 msgValue = msg.value;

    // Keep refunding owner until we recover the costs of the project
    if (weiRaised < totalCost) {
      if (msgValue + weiRaised <= totalCost) {
        ownerWallet.transfer(msgValue);
        return;
      } else {
        uint256 diff = totalCost - weiRaised;
        ownerWallet.transfer(diff);
        msgValue -= diff;
      }
    }

    uint256 teamValue = msgValue * 15 / 100; // Team keeps 15%
    uint256 charityValue = msgValue - teamValue; // Charity keeps 85%    
    teamWallet.transfer(teamValue);
    charityWallet.transfer(charityValue);

  }

  /*
    Slightly customized version of buyTokens so that we can check the amount
    of funds raised before forwarding funds to the right wallet.
  */
  function buyTokens(address beneficiary) public payable {
    require(beneficiary != 0x0);
    require(validPurchase());

    uint256 weiAmount = msg.value;

    // calculate token amount to be created
    uint256 tokens = weiAmount.mul(rate);

    token.mint(beneficiary, tokens);
    TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

    forwardFunds();

    // update state - this is after `forwardFunds` since `forwardFunds`
    // needs to check the amount of weiRaised before adding in the current
    // amount to be purchased
    weiRaised = weiRaised.add(weiAmount);
  }

  function mintTeamTokens() public {
    require(hasEnded() && !teamTokensMinted);
    token.mint(teamWallet, token.totalSupply() * 15 / 85);
    teamTokensMinted = true;
  }

}
