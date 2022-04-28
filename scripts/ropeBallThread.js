importScripts('ropeBall.js');

let ropeBallEngine;
let tickInterval;
let ticktime;
let subTickCount;

onmessage = function(message) {
    const type = message.data[0];
    switch (type) {
        case "init":
            ropeBallEngine = new RopeBallEngine(...message.data[1]);
            ticktime = message.data[2];
            subTickCount = message.data[3];
            tickInterval = setInterval(() => {
                for (let i = 0; i < subTickCount; i++) {
                    ropeBallEngine.moveBalls(ticktime/subTickCount);
                    ropeBallEngine.doConstrants();
                }
                postMessage(["movement", ropeBallEngine.balls.x, ropeBallEngine.balls.y]);
            }, ticktime);
            break;
        case "setGravity":
            ropeBallEngine.setGravity(message.data[1], message.data[2]);
            break;
        case "setSize":
            ropeBallEngine.setSize(message.data[1], message.data[2]);
            break;
        case "addBall":
            ropeBallEngine.addBall(...message.data[1])

    }
}