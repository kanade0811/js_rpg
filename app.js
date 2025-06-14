// 環境変数
const fps = 30;

class Map {
    constructor() {
        // マップの配列、床は0,壁は1,アイテムは2
        this.tiles = [
            1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 0, 0, 0, 0, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 1, 0, 0, 0, 0, 1, 1,
            1, 1, 1, 0, 0, 1, 1, 1
        ];
        // 縦と横の長さ
        this.lenX = 8;
        this.lenY = 8;
    }

    /**
     * @returns {number} 座標(x,y)タイル番号、範囲外なら1を返す
     * @param {number} x
     * @param {number} y
    */

    // 座標を配列の番号に変換
    tileAt(x, y) {
        if (x < 0 || this.lenX <= x || y < 0 || this.lenY <= y) return -1;
        return this.tiles[y * this.lenX + x];
    }
    //指定の座標が床なのか判定する
    isWalkable(x, y) {
        return (this.tileAt(x, y) === 0);
    }
}

class Actor {
    /**
    * @param {number} x キャラの初期X
    * @param {number} y キャラの初期Y
    * @param {image} image キャラのイラスト
    */
    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.dir = 3;
        this.image = image;
    }
    draw(ctx) {
        ctx.drawImage(
            this.image,
            this.x * width,
            this.y * width,
            width,
            width
        )
    }
}

class Move {
    /**
     * @param {Actor} actor 移動させたいアクター
     * @param {number} dx x軸上の移動
     * @param {number} dy y軸上の移動
     */
    constructor(actor, dx, dy) {
        this.actor = actor;
        this.dx = dx;
        this.dy = dy;
        // この下4つは仮の数
        this.beginX = -1;
        this.beginY = -1;
        this.endX = -1;
        this.endY = -1;
        // 実行したフレーム数
        this.frame = 0;
    }

    exec() {
        if (this.done) return this.done;
        this.frame++;
        if (this.frame === 1) {
            // 開始地点と終了地点の座標を計算
            this.beginX = this.actor.x;
            this.beginY = this.actor.y;
            this.endX = this.actor.x + this.dx;
            this.endY = this.actor.y + this.dy;
            if (this.dx == 1) this.actor.dir = 0;
            if (this.dy == -1) this.actor.dir = 1;
            if (this.dx == -1) this.actor.dir = 2;
            if (this.dy == 1) this.actor.dir = 3;
            //移動不可なら実行済みにして終了
            if (!(game.map.isWalkable(this.endX, this.endY))) {
                this.frame = 20;
                return this.done;
            }
            for (let k of game.events) {
                if ((this.endX == k.x) && (this.endY == k.y)) {
                    this.frame = 20;
                    return this.done;
                }
            }
        }
        // ↑で計算した座標の間を移動する
        this.actor.x = this.beginX + this.frame * this.dx / fps;
        this.actor.y = this.beginY + this.frame * this.dy / fps;
        return this.done;
    }

    /**
     * @returns {boolean} コマンドが終了していればtrue、実行中ならfalse
     */
    get done() {
        return this.frame >= fps;
    }
}

class Event {
    /**
    * @param {number} x eventのx座標
    * @param {number} y eventのy座標
    * @param {image} image eventの画像
    */
    constructor(x, y, image, text) {
        this.x = x
        this.y = y
        this.image = image
        this.text = text
    }
    draw(ctx) {
        if (this.image !== null) {
            ctx.drawImage(
                this.image,
                this.x * width + width / 10,
                this.y * width + width / 10,
                width * 4 / 5,
                width * 4 / 5
            )
        }
    }
    act() {
        let dxyData = [[1, 0], [0, -1], [-1, 0], [0, 1]]
        let dxy = dxyData[game.actors[0].dir]
        let playerXY = [game.actors[0].x + dxy[0], game.actors[0].y + dxy[1]]
        for (let k = 0; k < game.events.length; k++) {
            let eventXY = [game.events[k].x, game.events[k].y]
            if (playerXY[0] === eventXY[0] && playerXY[1] === eventXY[1]) {
                game.talking = game.events[k]
                game.status = "reading"
            }
        }
    }
}

class Game {
    constructor() {
        this.map = new Map();
        this.player = null;
        this.actors = [];
        this.commands = [];
        this.events = [];
        this.event = new Event();
        // scene,moving,reading
        this.status = "moving";
        this.opacity = 1
        this.talking = null;
        this.fonts = []
    }
}
let game;

window.onload = function () {
    // ゲーム状態を初期化
    game = new Game();
    setInterval(draw, 1000 / fps);

    setBackground()
    setActors()
    setEvents()
    setTextWindow()
    setKeyActions()
}

function setBackground() {
    game.floorImage = new Image();
    game.floorImage.src = "./images/background/floor.png";
    game.wallImage = new Image();
    game.wallImage.src = "./images/background/wall.png"
    game.inventoryImage = new Image();
    game.inventoryImage.src = "./images/background/inventory.png"
}

function setActors() {
    const playerImage = new Image();
    playerImage.src = "./images/actors/kintoki.png";
    let player = new Actor(3, 3, playerImage);
    game.player = player;
    game.actors.push(player)
}

function setEvents() {
    // event(x,y,image,text[テキスト全体][窓ごとのテキスト][各行の文章])
    const whereIsHear = new Event(
        0, 0, null,
        [[
            "あれ、俺、なんでこんなところに……？",
            "確か、DAYDREAM CIRCUSって名前の",
            "移動式サーカスのチケットを貰って、……"
        ], [
            "……ここにいる理由が思い出せないなぁ"
        ], [
            "もうそろそろ帰りたいんだけど……？"
        ]

        ]
    )
    game.events.push(whereIsHear)
    const ticketBlueImage = new Image()
    ticketBlueImage.src = "./images/events/ticketBlue.png"
    const ticketBlue = new Event(
        3, 4, ticketBlueImage,
        [[
            "青い半券が落ちている",
            "俺が記名したチケットだ"
        ], [
            "でもどうしてこんなところに",
            "落ちているんだろう……"
        ]]
    );
    game.events.push(ticketBlue)
}

function setTextWindow() {
    game.fonts.push(
        new FontFace(
            "dot",
            "url(./fonts/Best10-FONT/BestTen-DOT.otf)"
        )
    )
    game.textWindowImage = new Image();
    game.textWindowImage.src = "./images/background/textWindow.png";
    game.textStarImage = new Image()
    game.textStarImage.src = "./images/background/blueStar.png"
}

function resetText() {
    if (text.k == game.talking.text[0].length - 1) {
        text.k = 0
        game.status = "moving"
    } else {
        text.k++
    }
    text.full = null
    text.now = null
    text.count = 0
    text.timer = 0
}

function setKeyActions() {
    // 移動
    document.addEventListener("keydown", (event) => {
        if (game.commands.length > 0) return;
        let move = {
            KeyA: [-1, 0],
            KeyW: [0, -1],
            KeyD: [1, 0],
            KeyS: [0, 1]
        };
        let dxy = move[event.code];
        if (dxy !== undefined) {
            game.commands.push(new Move(game.player, dxy[0], dxy[1]));
        }
    });
    // 取得、進める等
    document.addEventListener("keydown", (event) => {
        if (event.code === "Space") {
            console.log("pressed space")
            console.log("game.status:", game.status)
            if (game.status === "moving") {
                game.event.act()
            }else if (game.status === "reading") {
                text.count = game.talking.text[text.k].length
                console.log(game.talking.text[0][text.k].length)
            }else if (game.status === "readFinish") {
                resetText()
            }
        }
    });
}

const width = 60
function draw() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    moveActor()

    drawClear(ctx)
    drawFloorAndWall(ctx)
    drawInventory(ctx)
    drawEvent(ctx)
    drawActor(ctx)
    drawText(ctx)
    if (game.status === "scene") {
        sceneFadeout(ctx)
    }

}

function moveActor() {
    for (let c of game.commands) {
        c.exec();
    }
    // 実行し終わったコマンドを消す
    game.commands = game.commands.filter(c => !c.done);
}

function drawClear(ctx) {
    ctx.clearRect(0, 0, game.map.lenX * width, (game.map.lenY + 2) * width)
}

function drawFloorAndWall(ctx) {
    for (let y = 0; y < game.map.lenY; y++) {
        for (let x = 0; x < game.map.lenX; x++) {
            let tile = game.map.tileAt(x, y);
            if (tile === 0) {
                ctx.drawImage(
                    game.floorImage,
                    x * width,
                    y * width,
                    width,
                    width
                )
            } else if (tile === 1) {
                ctx.drawImage(
                    game.wallImage,
                    x * width,
                    y * width,
                    width,
                    width
                )
            }
        }
    }
}

function drawInventory(ctx) {
    const y = game.map.lenY + 1
    ctx.strokeStyle = "brown";
    for (let x = 0; x < game.map.lenX; x++) {
        ctx.drawImage(
            game.inventoryImage,
            x * width,
            y * width,
            width,
            width
        )
        ctx.lineWidth = 2;
        ctx.strokeRect(x * width + 1, y * width, width - 2, width - 2)
    }
}

function drawEvent(ctx) {
    for (let k of game.events) {
        k.draw(ctx)
    }
}

function drawActor(ctx) {
    for (let k of game.actors) {
        k.draw(ctx)
    }
}

function drawText(ctx) {
    if (game.status === "reading" || game.status === "readFinish") {
        ctx.drawImage(
            game.textWindowImage,
            (1 / 4) * width,
            (4 + 3 / 4) * width,
            (game.map.lenX - 1 / 2) * width,
            3 * width
        )

        ctx.fillStyle = "white"
        ctx.font = "20px 'dot'";
        for (let k = 0; k < text.k; k++) {
            ctx.fillText(
                game.talking.text[0][k],
                width,
                (5 + 3 / 4) * width + k * 30
            )
        }
        if (text.full === null) {
            text.full = game.talking.text[0][text.k]
            text.now = ""
            text.count = 0
        } else if (text.count < game.talking.text[0][text.k].length) {
            document.getElementById("SE").play()
            text.now += text.full[text.count]
            console.log(text.count,text.now)
            ctx.fillText(
                text.now,
                width,
                (5 + 3 / 4) * width + text.k * 30
            )
            text.count++
        } else {
            ctx.fillText(
                text.now,
                width,
                (5 + 3 / 4) * width + text.k * 30
            )
            if (text.timer == 0) {
                console.log("text.k;", text.k)
                game.status = "readFinish"
            }
            text.timer++
            if (text.timer % fps < fps / 2) {
                ctx.drawImage(
                    game.textStarImage,
                    (game.map.lenX - 3 / 2 + 1 / 4) * width,
                    (6 + 1 / 2 + 1 / 4) * width,
                    width / 2,
                    width / 2
                )
            }
        }
    }
}

function sceneFadeout(ctx) {
    game.opacity -= 1 / fps
    ctx.globalAlpha = game.opacity
    ctx.fillStyle = "black"
    ctx.fillRect(
        0,
        0,
        game.map.lenX * width,
        game.map.lenY * width
    )
    ctx.globalAlpha = 1
    if (game.opacity < 0) {
        game.opacity = 0
        console.log("finish fadeout")
        game.status = "talking"
        game.text = new Text(game.events[0])
    }
}

let text = {
    k: 0,
    full: null,
    now: null,
    count: 0,
    timer: 0
}