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
        this.dir = -1;
        this.image = image;
    }
    draw(ctx) {
        if (this.image && this.image.complete) {
            ctx.drawImage(
                this.image,
                this.x * width,
                this.y * width,
                width,
                width
            )
        } else {
            // 画像が読み込まれていないときの仮
            ctx.fillStyle = "blue"

            let rad = Math.PI / 2 * this.dir
            ctx.beginPath();
            ctx.moveTo(
                width * (this.x + 1 / 2 + Math.cos(rad) / 2),
                width * (this.y + 1 / 2 - Math.sin(rad) / 2)
            );
            ctx.lineTo(
                width * (this.x + 1 / 2 + Math.cos(rad) / 2) + 2 / Math.sqrt(3) * width * 0.7 * Math.cos(rad + 5 / 6 * Math.PI),
                width * (this.y + 1 / 2 - Math.sin(rad) / 2) - 2 / Math.sqrt(3) * width * 0.7 * Math.sin(rad + 5 / 6 * Math.PI)
            );
            ctx.lineTo(
                width * (this.x + 1 / 2 + Math.cos(rad) / 2) + 2 / Math.sqrt(3) * width * 0.7 * Math.cos(rad + 7 / 6 * Math.PI),
                width * (this.y + 1 / 2 - Math.sin(rad) / 2) - 2 / Math.sqrt(3) * width * 0.7 * Math.sin(rad + 7 / 6 * Math.PI)
            );
            ctx.fill();

            /*
            ctx.fillRect(
                this.x * width + width / 6,
                this.y * width + width / 6,
                width * 2 / 3,
                width * 2 / 3
            )
            */
        }
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
            for (let k of game.items) {
                if ((this.endX == k.x) && (this.endY == k.y)) {
                    this.frame = 20;
                    return this.done;
                }
            }
        }
        // ↑で計算した座標の間を移動する
        this.actor.x = this.beginX + this.frame * this.dx / 20;
        this.actor.y = this.beginY + this.frame * this.dy / 20;
        return this.done;
    }

    /**
     * @returns {boolean} コマンドが終了していればtrue、実行中ならfalse
     */
    get done() {
        return this.frame >= 20;
    }
}

class Item {
    /**
    * @param {number} x itemのx座標
    * @param {number} y itemのy座標
    * @param {image} image itemの画像
    */
    constructor(x, y, image) {
        this.x = x
        this.y = y
        this.image = image
    }
    draw(ctx) {
        if (this.image && this.image.complete) {
            ctx.drawImage(
                this.image,
                this.x * width + width / 10,
                this.y * width + width / 10,
                width * 8 / 10,
                width * 8 / 10
            )
        } else {
            // 画像が読み込まれていないときの仮
            ctx.fillStyle = "red"
            ctx.fillRect(
                this.x * width + width / 6,
                this.y * width + width / 6,
                width * 2 / 3,
                width * 2 / 3
            )
        }
    }
    act() {
        let dxyData = [[1, 0], [0, -1], [-1, 0], [0, 1]]
        let dxy = dxyData[game.actors[0].dir]
        let playerXY = [game.actors[0].x + dxy[0], game.actors[0].y + dxy[1]]
        let itemXY = [game.items[0].x, game.items[0].y]
        if (playerXY[0] === itemXY[0] && playerXY[1] === itemXY[1]) {
            console.log("You can do this act.")
        }
    }
}

class Game {
    constructor() {
        this.map = new Map();
        this.player = null;
        this.actors = [];
        this.commands = [];
        this.items = [];
        this.item = new Item();
        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");
        setInterval(draw, 1000 / fps);
    }
}
let game;

window.onload = function () {
    // ゲーム状態を初期化
    game = new Game();

    // 背景の画像を設定
    game.floorImage = new Image();
    game.floorImage.src = "./images/floor.png";
    game.wallImage = new Image();
    game.wallImage.src = "./images/wall.png"
    game.inventoryImage = new Image();
    game.inventoryImage.src = "./images/inventory.png"

    // playerを作る
    const playerImage = new Image();
    playerImage.src = "./images/kintoki.png";
    let player = new Actor(3, 3, playerImage);
    game.player = player;
    // 初期配置のactor
    game.actors = [player];

    // itemの作成
    // const keyImage = new Image();
    // keyImage.src = "./images/key.png"
    // const key = new Item(2, 1, keyImage);
    // game.items.push(key);
    const ticketBlueImage = new Image();
    ticketBlueImage.src = "./images/ticketBlue.png"
    const ticketBlue = new Item(3, 7, ticketBlueImage);
    game.items.push(ticketBlue);

    // キー入力がトリガーとなり移動が始まる
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
    document.addEventListener("keydown", (event) => {
        if (event.code === "Enter") {
            game.item.act()
        }
    });
}

const width = 60
function draw() {
    moveActor()
    if (canvas.getContext) {    // 描写に関係あるところをこの中に
        game.draw.floorAndWall()
        game.draw.inventory()
        game.draw.item()
        game.draw.actor()
    } else { // 描画に関係ない部分をこの中に
    }
}

function moveActor() {
    for (let c of game.commands) {
        c.exec();
    }
    // 実行し終わったコマンドを消す
    game.commands = game.commands.filter(c => !c.done);
}

function draw() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    moveActor()

    if (canvas.getContext) {    // 描写に関係あるところをこの中に
        drawClear(ctx)
        drawFloorAndWall(ctx)
        drawInventory(ctx)
        drawItem(ctx)
        drawActor(ctx)
    } else { // 描画に関係ない部分をこの中に
    }
}

function drawClear(ctx){
    ctx.clearRect(0, 0, game.map.lenX*width,(game.map.lenY+2)*width)
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

function drawInventory(ctx){
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

function drawItem(ctx) {
    for (let k of game.items) {
        k.draw(ctx)
    }
}

function drawActor(ctx) {
    for (let k of game.actors) {
        k.draw(ctx)
    }
}