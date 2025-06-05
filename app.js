// 環境変数
const fps = 30;

class Map {
    constructor() {
        // マップの配列
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
        if (x < 0 || this.lenX <= x || y < 0 || this.lenY <= y) return 1;
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
    draw(ctx, width) {
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
}

let key = new Item(2, 1, null)

class Game {
    constructor() {
        this.map = new Map();
        this.player = null;
        this.actors = [];
        this.commands = [];
    }
}
let game;

window.onload = function () {
    const image = new Image();
    image.src = "player.png";
    // ゲーム状態を初期化
    game = new Game();
    // プレイヤーを作る
    let player = new Actor(3, 3, null);
    game.player = player;
    // 初期配置のアクター
    game.actors = [player];
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
}

const draw = function () {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    // 描写に関係あるところをこの中に
    if (canvas.getContext) {
        // 1マスの大きさ
        let width = 60;
        // 背景色
        ctx.fillStyle = "orange";
        ctx.fillRect(0, 0, 480, 480);

        // 移動の描写を繰り返させる
        for (let c of game.commands) {
            c.exec();
        }
        // 実行し終わったコマンドを消す
        game.commands = game.commands.filter(c => !c.done);

        // 壁を描写
        for (let y = 0; y < game.map.lenY; y++) {
            for (let x = 0; x < game.map.lenX; x++) {
                let tile = game.map.tileAt(x, y);
                if (tile === 1) {
                    ctx.fillStyle = "brown"
                    ctx.strokeRect(width * x, width * y, width, width);
                    ctx.fillRect(width * x, width * y, width, width);
                }
            }
        }

        // アクターを描画
        for (let k of game.actors) {
            k.draw(ctx, width)
        }

        ctx.fillStyle = "orange";
        ctx.fillRect(0, 540, 480, 60);
        for (let x = 0; k < game.map.lenX; k++) {
            ctx.fillStyle = "brown"
            ctx.strokeRect(width * x, 540, width, width)
            // ctx.fillRect(width * x, 540, width, width)
        }
    } else { // 描画に関係ない部分をこの中に

    }
}

setInterval(draw, 1000 / fps);