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
        let buffer = Buffer.alloc(0);

        // TODO serialize frame into buffer

        _replication.broadcast(buffer);

        _lastTime = now;
    }, 1000 * netConstants.simulationRate);

    _replication.on('received', (player, data) => {
        // TODO: Parse received data to get player input
        let playerInput = { };

        TheSimulation.acceptInput(player, playerInput);
    });

    _transport.listen(port, callback);
};

