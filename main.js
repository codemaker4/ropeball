let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

window.addEventListener('resize', () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    ropeBallThreadManager.setSize(innerWidth, innerHeight);
});

// setInterval(() => {
//     ropeBallThreadManager.setWidth(ropeBallThreadManager.width-1);
// }, 1000/10)

let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", (e) => {
    mouseX = e.offsetX;
    mouseY = e.offsetY;
})

// let accX = 0;
// let accY = 0;

// window.addEventListener("devicemotion", (e) => {
//     accX = -e.accelerationIncludingGravity.x;
//     accY = e.accelerationIncludingGravity.y;
// }, true);

// setInterval(() => {
//     if (accX) {
//         ropeBallThreadManager.setGravity(
//             accX/10,
//             accY/10
//         )
//     } else {
//         ropeBallThreadManager.setGravity(
//             (mouseX-(ropeBallThreadManager.width/2))/500,
//             (mouseY-(ropeBallThreadManager.height/2))/500
//         );
//     }
// }, 1000/60)

// let ropeBallEngine = new RopeBallEngine(canvas.width, canvas.height, 10, 10, 1000);
let ropeBallThreadManager = new RopeBallThreadManager(1000/60, 10, canvas.width, canvas.height, 7, 1, 3000, 0, 1, 15);

for (let i = 0; i < ropeBallThreadManager.maxBallCount; i++) {
    ropeBallThreadManager.addBall(Math.random()*canvas.width, Math.random()*canvas.height, Math.random()*10-5, Math.random()*10-5);
}

function draw() {
    ctx.clearRect(0,0,canvas.width, canvas.height)
    // ropeBallEngine.moveBalls(1000/60);
    // ropeBallEngine.doConstrants();
    ropeBallThreadManager.drawBalls(ctx);
    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
