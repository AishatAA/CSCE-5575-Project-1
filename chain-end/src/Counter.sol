// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Counter {
    uint256 public num;
    string[10] public wordsArray;
   
    event NumberSet(uint256 newNum);
    event ContractDeployed(uint256 initialNum);
   
    constructor() {
        num = 2;
        wordsArray = ["Lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do"];
        emit ContractDeployed(num);
    }
   
    function setNum(uint256 _num) public {
        require(_num >= 0, "Number cannot be negative");
        num = _num;
        emit NumberSet(_num);
    }
   
    function getSlicedArray() public view returns (string[] memory) {
        uint256 sliceSize = num > 10 ? 10 : num;
        if (sliceSize == 0) {
            return new string[](0);
        }
       
        string[] memory sliced = new string[](sliceSize);
        for (uint256 i = 0; i < sliceSize; i++) {
            sliced[i] = wordsArray[i];
        }
        return sliced;
    }
   
    function getArrayLength() public pure returns (uint256) {
        return 10;
    }
   
    function getWord(uint256 index) public view returns (string memory) {
        require(index < 10, "Index out of bounds");
        return wordsArray[index];
    }
}

