var WIDTH = 700;
var HEIGHT = 600;
var pi = Math.PI;
var UPARROW = 38;
var DOWNARROW = 40;

var canvas;
var ctx;
var keystate;

var player = {
    x: null,
    y: null,
    width: 20,
    height: 100,
    update: function() {
        if(keyState[UPARROW]) {
            this.y -= 7;
        }

        if(keyState[DOWNARROW]) {
            this.y += 7;
        }

        this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0);
    },
    draw: function() {
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

var ai = {
    x: null,
    y: null,
    width: 20,
    height: 100,
    update: function() {
        var destY = ball.y - (this.height - ball.side) * 0.5;

        this.y += (destY - this.y) * 0.1;

        this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0);
    },
    draw: function() {
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

var ball = {
    x: null,
    y: null,
    velocity: null,
    side: 20,
    speed: 12,
    serve: function(side) {
        var r = Math.random();

        this.x = side === 1 ? player.x + player.width : ai.x - this.side;
        this.y = (HEIGHT - this.side) * r;

        var phi = 0.1 * pi * (1 - 2 * r);

        this.velocity = {
            x: side * this.speed * Math.cos(phi),
            y: this.speed * Math.sin(phi)
        };
    },

    update: function() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        if(0 > this.y || this.y + this.side > HEIGHT) {
            var offset = this.velocity.y < 0 ? 0 - this.y : HEIGHT - (this.y + this.side);

            this.y += 2 * offset;
            this.velocity.y *= -1;
        }

        var AABBIntersect = function(ax, ay, aw, ah, bx, by, bw, bh) {
            return (ax < bx + bw) && (ay < by + bh) && (bx < ax + aw) && (by < ay + ah);
        };

        var paddle = this.velocity.x < 0 ? player : ai;

        if(AABBIntersect(paddle.x, paddle.y, paddle.width, paddle.height, this.x, this.y, this.side, this.side)) {
            this.x = paddle === player ? player.x + player.width : ai.x - this.side;

            var n = (this.y + this.side - paddle.y) / (paddle.height + this.side);
            var phi = 0.25 * pi * (2 * n - 1);
            var smash = Math.abs(phi) > 0.2 * pi ? 1.5 : 1;

            this.velocity.x = smash * (paddle === player ? 1 : -1) * this.speed * Math.cos(phi);
            this.velocity.y = smash * this.speed * Math.sin(phi);
        }

        if(0 > this.x + this.side || this.x > WIDTH) {
            this.serve(paddle === player ? 1 : -1);
        }
    },

    draw: function() {
        ctx.fillRect(this.x, this.y, this.side, this.side);
    }
};

function main() {
    canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    ctx = canvas.getContext('2d');

    document.body.appendChild(canvas);

    keyState = {};

    document.addEventListener('keydown', function(event) {
        keyState[event.keyCode] = true;
    });

    document.addEventListener('keyup', function(event) {
        delete keyState[event.keyCode];
    });

    init();

    var loop = function() {
        update();
        draw();

        window.requestAnimationFrame(loop, canvas);
    };

    window.requestAnimationFrame(loop, canvas);
}

function init() {
    player.x = player.width;
    player.y = (HEIGHT - player.height) / 2;

    ai.x = WIDTH - (player.width + ai.width);
    ai.y = (HEIGHT - ai.height) / 2;

    ball.serve(1);
}

function update() {
    ball.update();
    player.update();
    ai.update();
}

function draw() {
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.save();

    ctx.fillStyle = '#fff';

    ball.draw();
    player.draw();
    ai.draw();

    var w = 4;
    var x = (WIDTH - w) * 0.5;
    var y = 0;
    var step = HEIGHT / 20;

    while (y < HEIGHT) {
        ctx.fillRect(x, y + step * 0.25, w, step * 0.5);
        y += step;
    }

    ctx.restore();
}

main();
