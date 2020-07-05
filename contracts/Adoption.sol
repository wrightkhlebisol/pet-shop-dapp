pragma solidity ^0.5.0;

contract Adoption {
    // Declare public variable - get automatic getter methods
    // but beacuse we have an array, the getter needs a key and we can only return a single value
    address[16] public adopters;

    // Adopting a pet
    // msg.sender is the address of the person or contract calling this function
    function adopt(uint petId) public returns (uint) {
        require(petId >= 0 && petId <= 15);

        adopters[petId] = msg.sender;

        return petId;
    }

    // Retreiving the adopters
    // memory gives data location of the adopters variable
    // view means function doesnt modify state of contract
    function getadopters() public view returns (address[16] memory){
        return adopters;
    }

    
}