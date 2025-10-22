// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CropTraceability
 * @dev Smart contract for agricultural product traceability on blockchain
 */
contract CropTraceability {
    struct CropEvent {
        uint256 cropId;
        string batchId;
        string eventType; // "planted", "treated", "harvested", "verified"
        string eventData; // JSON stringified data
        address farmer;
        uint256 timestamp;
        string location; // GPS coordinates or location name
    }

    struct CropRecord {
        uint256 cropId;
        string batchId;
        address farmer;
        uint256 createdAt;
        bool exists;
        uint256 eventCount;
    }

    // Mapping from batchId to crop record
    mapping(string => CropRecord) public crops;
    
    // Mapping from batchId to array of events
    mapping(string => CropEvent[]) public cropEvents;
    
    // Mapping from farmer address to their batch IDs
    mapping(address => string[]) public farmerBatches;
    
    // Events
    event CropRegistered(
        string indexed batchId,
        uint256 cropId,
        address indexed farmer,
        uint256 timestamp
    );
    
    event CropEventRecorded(
        string indexed batchId,
        string eventType,
        address indexed farmer,
        uint256 timestamp
    );

    /**
     * @dev Register a new crop on the blockchain
     */
    function registerCrop(
        uint256 _cropId,
        string memory _batchId,
        string memory _initialData
    ) public returns (bool) {
        require(!crops[_batchId].exists, "Crop already registered");
        require(bytes(_batchId).length > 0, "Batch ID cannot be empty");

        // Create crop record
        crops[_batchId] = CropRecord({
            cropId: _cropId,
            batchId: _batchId,
            farmer: msg.sender,
            createdAt: block.timestamp,
            exists: true,
            eventCount: 0
        });

        // Add to farmer's batches
        farmerBatches[msg.sender].push(_batchId);

        // Record initial event
        CropEvent memory initialEvent = CropEvent({
            cropId: _cropId,
            batchId: _batchId,
            eventType: "registered",
            eventData: _initialData,
            farmer: msg.sender,
            timestamp: block.timestamp,
            location: ""
        });

        cropEvents[_batchId].push(initialEvent);
        crops[_batchId].eventCount = 1;

        emit CropRegistered(_batchId, _cropId, msg.sender, block.timestamp);

        return true;
    }

    /**
     * @dev Record a new event for a crop
     */
    function recordEvent(
        string memory _batchId,
        string memory _eventType,
        string memory _eventData,
        string memory _location
    ) public returns (bool) {
        require(crops[_batchId].exists, "Crop not registered");
        require(
            crops[_batchId].farmer == msg.sender,
            "Only crop owner can record events"
        );

        CropEvent memory newEvent = CropEvent({
            cropId: crops[_batchId].cropId,
            batchId: _batchId,
            eventType: _eventType,
            eventData: _eventData,
            farmer: msg.sender,
            timestamp: block.timestamp,
            location: _location
        });

        cropEvents[_batchId].push(newEvent);
        crops[_batchId].eventCount += 1;

        emit CropEventRecorded(_batchId, _eventType, msg.sender, block.timestamp);

        return true;
    }

    /**
     * @dev Get crop record by batch ID
     */
    function getCropRecord(string memory _batchId)
        public
        view
        returns (
            uint256 cropId,
            address farmer,
            uint256 createdAt,
            uint256 eventCount
        )
    {
        require(crops[_batchId].exists, "Crop not registered");
        CropRecord memory crop = crops[_batchId];
        return (crop.cropId, crop.farmer, crop.createdAt, crop.eventCount);
    }

    /**
     * @dev Get all events for a crop
     */
    function getCropEvents(string memory _batchId)
        public
        view
        returns (CropEvent[] memory)
    {
        require(crops[_batchId].exists, "Crop not registered");
        return cropEvents[_batchId];
    }

    /**
     * @dev Get specific event by index
     */
    function getEvent(string memory _batchId, uint256 _index)
        public
        view
        returns (
            uint256 cropId,
            string memory eventType,
            string memory eventData,
            address farmer,
            uint256 timestamp,
            string memory location
        )
    {
        require(crops[_batchId].exists, "Crop not registered");
        require(_index < cropEvents[_batchId].length, "Event index out of bounds");

        CropEvent memory cropEvent = cropEvents[_batchId][_index];
        return (
            cropEvent.cropId,
            cropEvent.eventType,
            cropEvent.eventData,
            cropEvent.farmer,
            cropEvent.timestamp,
            cropEvent.location
        );
    }

    /**
     * @dev Get number of events for a crop
     */
    function getEventCount(string memory _batchId) public view returns (uint256) {
        require(crops[_batchId].exists, "Crop not registered");
        return cropEvents[_batchId].length;
    }

    /**
     * @dev Get all batch IDs for a farmer
     */
    function getFarmerBatches(address _farmer)
        public
        view
        returns (string[] memory)
    {
        return farmerBatches[_farmer];
    }

    /**
     * @dev Check if a batch exists
     */
    function batchExists(string memory _batchId) public view returns (bool) {
        return crops[_batchId].exists;
    }

    /**
     * @dev Verify crop ownership
     */
    function verifyCropOwner(string memory _batchId, address _address)
        public
        view
        returns (bool)
    {
        if (!crops[_batchId].exists) return false;
        return crops[_batchId].farmer == _address;
    }
}

