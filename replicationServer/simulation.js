let existingObjects = [];
const PlayerSpinDPS = 200.0;
const PlayerAcceleration = 15.0;

exports.begin = () => {
    // TODO initialize simulation
    let object = {
        Id: 0,
        Player: 1,
        Type: "Unknown",
        Position: [0, 0],
        Rotation: 0,
        Velocity: [0, 0]
    };
    existingObjects.push(object);
};

exports.acceptInput = (player, input) => {
    // TODO capture player input but don't apply it yet
    player.rot = 0;
    player.trans = 0;
    //if (input.hasOwnProperty('None'))
    //{
    //    //Do nothing
    //    return;
    //}
    if (input.hasOwnProperty('Left'))
    {
        //Apply left rotation
        player.rot += -1;
    }
    if (input.hasOwnProperty('Right'))
    {
        //Apply right rotation
        player.rot += 1;
    }
    if (input.hasOwnProperty('Thrust'))
    {
        //Apply thrust
        player.thrust = 1;
    }
};

exports.calculateFrame = (elapsed) => {
    // TODO update simulation
    let frameObjects = [];
    for (let obj of existingObjects)
    {
        if (player.rot != 0)
        {
            if (player.rot < 0)
            {
                player.Rotation += (PlayerSpinDPS * elapsed);
            }
            else if (player.rot > 0)
            {
                player.Rotation -= (PlayerSpinDPS * elapsed);
            }
        }
        if (player.thrust != 0)
        {
            player.Velocity[0] = Math.cos(player.Rotation * (180 / Math.PI)) * PlayerAcceleration * elapsed;
            player.Velocity[1] = Math.sin(player.Rotation * (180 / Math.PI)) * PlayerAcceleration * elapsed;
        }
        
        obj.Position[0] = obj.Position[0] + (obj.Velocity[0] * elapsed);
        obj.Position[1] = obj.Position[1] + (obj.Velocity[1] * elapsed);
        frameObjects.push(obj);
    }
    // TODO return frame
    return frameObjects;
};
