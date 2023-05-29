pragma solidity ^0.5.0;

contract File {
    string public filehash;
    mapping(address => bool) public accessPermissions;

    event AccessGranted(address doctor);
    event AccessRevoked(address doctor);

    function set(string memory _filehash) public {
        filehash = _filehash;
    }

    function get() public view returns (string memory) {
        return filehash;
    }

    function grantAccess(address doctor) public {
        accessPermissions[doctor] = true;
        emit AccessGranted(doctor);
    }

    function revokeAccess(address doctor) public {
        accessPermissions[doctor] = false;
        emit AccessRevoked(doctor);
    }
}