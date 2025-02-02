// filepath: /e:/Programs/Dotslash/DotSlash-8.0/nextapp/contracts/Voting.sol
pragma solidity ^0.8.0;

contract Voting {
    struct Policy {
        uint id;
        string title;
        string description;
        uint yesVotes;
        uint noVotes;
    }

    mapping(uint => Policy) public policies;
    mapping(address => mapping(uint => bool)) public votes;
    uint public policyCount;

    function addPolicy(string memory _title, string memory _description) public {
        policyCount++;
        policies[policyCount] = Policy(policyCount, _title, _description, 0, 0);
    }

    function vote(uint _policyId, bool _vote) public {
        require(!votes[msg.sender][_policyId], "You have already voted on this policy");
        votes[msg.sender][_policyId] = true;
        if (_vote) {
            policies[_policyId].yesVotes++;
        } else {
            policies[_policyId].noVotes++;
        }
    }
}