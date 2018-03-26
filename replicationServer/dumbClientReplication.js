const TransportLayer = require('./transportLayer');
const ChannelLayer = require('./channelLayer');
const ReplicationLayer = require('./replicationLayer');
const netConstants = require('./netConstants');

const TheSimulation = require('./simulation');

function getTick() {
    let hrtime = process.hrtime();
    return (hrtime[0] * 1000) + (hrtime[1] / 1000000);
}

exports.listen = (port, callback) => {
    const _transport = new TransportLayer();
    const _channel = new ChannelLayer(_transport);
    const _replication = new ReplicationLayer(_channel);

    let _lastTime = getTick();
    TheSimulation.begin();

    setInterval(() => {
        let now = getTick();
        let elapsed = now - _lastTime;
        let frame = TheSimulation.calculateFrame(elapsed);

        // TODO allocate buffer big enough for simulation frame
        let buffer = Buffer.alloc(32);

        // TODO serialize frame into buffer
        //buffer.writeUInt8(frame[0].Id, 0);
        //buffer.writeUInt8(frame[0].Player, 1);
        //buffer.writeUInt8(frame[0].Type, 2);
        buffer.writeDoubleLE(_lastTime, 0);
        buffer.writeFloatLE(frame[0].Position[0], 8); //Same as below.
        buffer.writeFloatLE(frame[0].Position[1], 12); //Cap this depending on world size
        buffer.writeFloatLE(frame[0].Rotation, 16); //This could be a char

        console.log("Time: " + _lastTime);
        console.log("Position: " + frame[0].Position);
        console.log("Rotation: " + frame[0].Rotation);

        _replication.broadcast(buffer);

        _lastTime = now;
    }, 1000 * netConstants.simulationRate);

    _replication.on('received', (player, data) => {
        // TODO: Parse received data to get player input
        let playerInput = {};
        playerInput.Left = data & 1;
        playerInput.Right = data & 2;
        playerInput.Thrust = data & 4;
        playerInput.Fire = data & 8;

        TheSimulation.acceptInput(player, playerInput);
    });

    _transport.listen(port, callback);
};

