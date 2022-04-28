class RopeBallEngine {
    constructor(width, height, ballRadius, subStebCount, maxBallCount, gravityX, gravityY, chunkSize) {
        this.width = width;
        this.height = height;
        this.subStebCount = subStebCount;
        this.maxBallCount = maxBallCount;
        if (this.maxBallCount > 2**16) throw "can't have more than 2^16 balls"
        this.ballRadius = ballRadius;
        this.gravityX = gravityX;
        this.gravityY = gravityY;
        this.balls = {
            activeCount: 0,
            x: new Float32Array(this.maxBallCount),
            y: new Float32Array(this.maxBallCount),
            px: new Float32Array(this.maxBallCount),
            py: new Float32Array(this.maxBallCount),
            cx: new Uint8Array(this.maxBallCount),
            cy: new Uint8Array(this.maxBallCount),
            collisionCount: new Uint8Array(this.maxBallCount)
        }
        this.chunkSize = chunkSize;
        this.chunks = [];
        for (let x = 0; x < this.width/this.chunkSize; x += 1) {
            this.chunks[x] = [];
            if (x >= 256) throw "too many chunks"
            for (let y = 0; y < this.height/this.chunkSize; y++) {
                if (y >= 256) throw "too many chunks"
                this.chunks[x][y] = [];
            }
        }
    }
    setSize(width, height) {
        this.width = width;
        this.height = height;
        for (let x = 0; x < this.width/this.chunkSize; x += 1) {
            if (x >= 256) throw "too many chunks"
            if (!this.chunks[x]) {
                this.chunks[x] = [];
            }
            for (let y = 0; y < this.height/this.chunkSize; y++) {
                if (y >= 256) throw "too many chunks"
                if (!this.chunks[x][y]) {
                    this.chunks[x][y] = [];
                }
            }
        }
    }
    calcCi(n, isX) { // calculate chunk index
        return Math.min(
            Math.max(Math.floor(n / this.chunkSize), 0),
            Math.floor((isX ? this.width : this.height) / this.chunkSize)-1
        );
    }
    isInCorrectChunk(i) {
        return (
            this.balls.cx[i] == this.calcCi(this.balls.x[i], true) &&
            this.balls.cy[i] == this.calcCi(this.balls.y[i], false)
        );
    }
    addToChunk(i) {
        this.balls.cx[i] = this.calcCi(this.balls.x[i], true);
        this.balls.cy[i] = this.calcCi(this.balls.y[i], false);
        this.chunks[this.balls.cx[i]][this.balls.cy[i]].push(i);
    }
    removeFromChunk(i) {
        this.chunks[this.balls.cx[i]][this.balls.cy[i]].splice(
            this.chunks[this.balls.cx[i]][this.balls.cy[i]].indexOf(i), 1
        );
    }
    addBall(x,y,dx,dy) {
        if (this.balls.activeCount >= this.maxBallCount) {
            throw "RopeBall error: max ball count exceeded."
        }
        this.balls.x[this.balls.activeCount] = x;
        this.balls.y[this.balls.activeCount] = y;
        this.balls.px[this.balls.activeCount] = x-dx;
        this.balls.py[this.balls.activeCount] = y-dy;
        this.addToChunk(this.balls.activeCount);
        this.balls.activeCount ++;
    }
    setGravity(x, y) {
        this.gravityX = x;
        this.gravityY = y;
    }
    moveBalls(dt) {
        let dx, dy, maxSpeed = 0;
        const gravity = (dt/(1000/60)*1)**2;
        for (let i = 0; i < this.balls.activeCount; i++) {
            this.balls.x[i] += gravity*this.gravityX;
            this.balls.y[i] += gravity*this.gravityY;
            dx = this.balls.x[i] - this.balls.px[i];
            dy = this.balls.y[i] - this.balls.py[i];
            if (this.balls.collisionCount[i] >= 2) {
                maxSpeed = this.ballRadius*(1/this.balls.collisionCount[i]);
            } else {
                maxSpeed = 100;
            }
            this.balls.x[i] += Math.min(Math.max(dx, -maxSpeed), maxSpeed);
            this.balls.y[i] += Math.min(Math.max(dy, -maxSpeed), maxSpeed);
            this.balls.px[i] += dx;
            this.balls.py[i] += dy;
            if (!this.isInCorrectChunk(i)) {
                this.removeFromChunk(i);
                this.addToChunk(i);
            }
        }
    }
    doConstrants() {
        let dist,depth,dx,dy,fac,cx,cy,chunk,j,n = 0;
        for (let s = 0; s < this.subStebCount; s++) {
            for (let i = 0; i < this.balls.activeCount; i++) {
                this.balls.collisionCount[i] = 0;
                if (this.balls.x[i] < this.ballRadius) this.balls.x[i] = this.ballRadius;
                if (this.balls.y[i] < this.ballRadius) this.balls.y[i] = this.ballRadius;
                if (this.balls.x[i] > this.width-this.ballRadius) this.balls.x[i] = this.width-this.ballRadius;
                if (this.balls.y[i] > this.height-this.ballRadius) this.balls.y[i] = this.height-this.ballRadius;

                for (cx = this.balls.cx[i]-1; cx <= this.balls.cx[i]+1; cx++) {
                    for (cy = this.balls.cy[i]-1; cy <= this.balls.cy[i]+1; cy++) {
                        if (!this.chunks[cx] || !this.chunks[cx][cy]) continue;
                        chunk = this.chunks[cx][cy]
                        for (n = 0; n < chunk.length; n++) {
                            j = chunk[n];
                            if (i==j) continue;
                            dx = this.balls.x[i] - this.balls.x[j];
                            dy = this.balls.y[i] - this.balls.y[j];
                            dist = Math.sqrt(dx*dx + dy*dy);
                            depth = this.ballRadius*2 - dist;
                            if (depth > 0) {
                                fac = 1/dist*depth*0.5
                                this.balls.x[i] += dx*fac;
                                this.balls.y[i] += dy*fac;
                                this.balls.x[j] -= dx*fac;
                                this.balls.y[j] -= dy*fac;
                                this.balls.collisionCount[i] ++;
                                this.balls.collisionCount[j] ++;
                            }
                        }
                    }
                }
            }
        }
    }
    drawBalls(ctx) {
        ctx.fillStyle = 'black';
        for (let i = 0; i < this.balls.activeCount; i++) {
            ctx.beginPath();
            ctx.ellipse(this.balls.x[i], this.balls.y[i], this.ballRadius, this.ballRadius, 0, 0, Math.PI*2);
            ctx.fill()
        }
    }
}