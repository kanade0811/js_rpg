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
            for (let k of game.items) {
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

class Item {
    /**
    * @param {number} x itemのx座標
    * @param {number} y itemのy座標
    * @param {image} image itemの画像
    */
    constructor(x, y, image, text) {
        this.x = x
        this.y = y
        this.image = image
        this.text = text
    }
    draw(ctx) {
        ctx.drawImage(
            this.image,
            this.x * width + width / 10,
            this.y * width + width / 10,
            width * 4 / 5,
            width * 4 / 5
        )
    }
    act() {
        let dxyData = [[1, 0], [0, -1], [-1, 0], [0, 1]]
        let dxy = dxyData[game.actors[0].dir]
        let playerXY = [game.actors[0].x + dxy[0], game.actors[0].y + dxy[1]]
        for (let k = 0; k < game.items.length; k++) {
            let itemXY = [game.items[k].x, game.items[k].y]
            if (playerXY[0] === itemXY[0] && playerXY[1] === itemXY[1]) {
                console.log("You can action to this item.")
                game.taking = game.items[k]
                console.log(game.taking)
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
        this.items = [];
        this.item = new Item();
        // moving,taking,reading
        this.status = "moving";
        this.taking = null;
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
    setItems()
    setTextWindow()
    setKeyActions()
}

function setBackground() {
    game.floorImage = new Image();
    game.floorImage.src = "./images/floor.png";
    game.wallImage = new Image();
    game.wallImage.src = "./images/wall.png"
    game.inventoryImage = new Image();
    game.inventoryImage.src = "./images/inventory.png"
}

function setActors() {
    const playerImage = new Image();
    playerImage.src = "./images/kintoki.png";
    let player = new Actor(3, 2, playerImage);
    game.player = player;
    game.actors.push(player)
}

function setItems() {
    // item(x,y,image,text[テキスト全体][窓ごとのテキスト][各行の文章])
    const ticketBlueImage = new Image()
    ticketBlueImage.src = "./images/ticketBlue.png"
    const ticketBlue = new Item(
        3, 4, ticketBlueImage,
        [[
            "青い半券が落ちている",
            "俺が記名したチケットだ"
        ], [
            "でもどうしてこんなところに",
            "落ちているんだろう……"
        ]]
    );
    game.items.push(ticketBlue)
}

function setTextWindow() {
    game.textWindowImage = new Image();
    game.textWindowImage.src = "./images/textWindow.png";
    game.fonts.push(
        new FontFace(
            "dot",
            "url(./fonts/Best10-FONT/BestTen-DOT.otf)"
        )
    )
    for (let k = 0; k < game.fonts.length; k++) {
        game.fonts[k].load().then(
            () => {
                document.fonts.add(game.fonts[k])
                console.log("font : 「", game.fonts[k]["family"], "」 finish loading")
            },
            (err) => {
                console.log("loading error")
            }
        )
    }
    game.k=0
    game.fullText=null
    game.nowText=null
    game.textCount=0
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
            if (game.status === "moving") {
                game.item.act()
                console.log("Next action is reading.")
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
    drawItem(ctx)
    drawActor(ctx)
    drawText(ctx)

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

function drawText(ctx) {
    if (game.status === "reading") {
        ctx.drawImage(
            game.textWindowImage,
            (1 / 4) * width,
            (4 + 3 / 4) * width,
            (game.map.lenX - 1 / 2) * width,
            3 * width
        )

        ctx.fillStyle = "white"
        ctx.font = "20px 'dot'";
        if (game.fullText ===null) {
            game.fullText = game.taking.text[0][0]
            game.nowText = ""
            game.textCount = 0
            console.log(game.fullText)
            console.log("do")
        }else if(game.textCount<game.taking.text[0][0].length){
            console.log(game.textCount)
            game.nowText +=game.fullText[game.textCount]
            ctx.fillText(
                game.nowText,
                width,
                (5 + 3 / 4) * width + game.k * 30
            )
            game.textCount++
        }else{
            ctx.fillText(
                game.nowText,
                width,
                (5 + 3 / 4) * width + game.k * 30
            )
            console.log(game.nowText)
        }
    }
}