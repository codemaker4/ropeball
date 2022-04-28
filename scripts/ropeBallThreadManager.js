class RopeBallThreadManager {
    constructor(ticktime, subTickCount, width, height, ballRadius, subStebCount, maxBallCount, gravityX, gravityY, chunkSize) {
        this.ticktime = ticktime;
        this.subTickCount = subTickCount;
        this.lastTickAt = Date.now();
        this.width = width;
        this.height = height;
        this.ballRadius = ballRadius;
        this.subStebCount = subStebCount;
        this.maxBallCount = maxBallCount;
        this.gravityX = gravityX;
        this.gravityY = gravityY;

        this.balls = {
            activeCount: 0,
            x: new Float32Array(this.maxBallCount),
            y: new Float32Array(this.maxBallCount),
            px: new Float32Array(this.maxBallCount),
            py: new Float32Array(this.maxBallCount),
        }

        this.worker = new Worker("scripts/ropeBallThread.js");
        this.worker.onmessage = (message) => {this.onWorkerMessage(message)};
        this.worker.postMessage(["init", [width, height, ballRadius, subStebCount, maxBallCount, gravityX, gravityY, chunkSize], ticktime, subTickCount])
    }
    onWorkerMessage(message) {
        const type = message.data[0];
        switch (type) {
            case "movement":
                // console.log((Date.now() - this.lastTickAt)/this.ticktime, Date.now() - this.lastTickAt)
                this.lastTickAt = Date.now();
                this.balls.px.set(this.balls.x);
                this.balls.py.set(this.balls.y);
                this.balls.x.set(message.data[1]);
                this.balls.y.set(message.data[2]);
        }
    }
    setSize(width, height) {
        this.worker.postMessage(["setSize", width, height]);
    }
    setGravity(x, y) {
        this.gravityX = x;
        this.gravityY = y;
        this.worker.postMessage(["setGravity", x, y]);
    }
    addBall(x,y,dx,dy) {
        if (this.balls.activeCount >= this.maxBallCount) {
            throw "RopeBall error: max ball count exceeded."
        }
        this.balls.activeCount ++;
        this.worker.postMessage(["addBall", [x, y, dx, dy]]);
    }

    drawBalls(ctx) {
        ctx.fillStyle = 'black';
        const tickFacA = Math.min(1, (Date.now() - this.lastTickAt)/this.ticktime);
        const tickFacB = 1-tickFacA
        for (let i = 0; i < this.balls.activeCount; i++) {
            ctx.beginPath();
            ctx.ellipse(
                this.balls.x[i]*tickFacA + this.balls.px[i]*tickFacB,
                this.balls.y[i]*tickFacA + this.balls.py[i]*tickFacB,
                this.ballRadius,
                this.ballRadius,
                0,
                0,
                Math.PI*2
            );
            ctx.fill()
        }
    }
}