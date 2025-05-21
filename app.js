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
        this.image = image;
    }
}

class Camera {
    /**
     * @param {number} x カメラのx
     * @param {number} y カメラのy
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Move {
    /**
     * @param {Actoor} actor 移動させたいアクター
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

class Game {
    constructor() {
        this.map = new Map();
        this.player = null;
        this.actors = [];
        this.camera = new Camera(0, 0);
        this.commands = [];
    }
}
let game;

function setup() {
    // ゲーム状態を初期化
    game = new Game();
    // プレイヤーを作る
    let player = new Actor(3, 3, "🕺");
    game.player = player

    // 初期配置のactor
    game.actors = [player];
    // キャンバスを作る
    createCanvas(480, 480)
}

function draw() {

    // 1マスの大きさ
    let width = 40;

    // プレイヤーの入力を受け入れる
    if (keyIsPressed && game.commands.length === 0) {
        // xyの移動を配列化
        let dxy = { 37: [-1, 0], 38: [0, -1], 39: [1, 0], 40: [0, 1] }[keyCode];
        if (dxy !== undefined) {
            game.commands.push(new Move(game.player, dxy[0], dxy[1]));
        }
    }

    for (let c of game.commands) {
        c.exec();
    }
    // 実行し終わったコマンドを消す
    game.commands = game.commands.filter(c => !c.done);

    // 背景色
    background("Bisque");
    // カメラ位置の固定
    textAlign(LEFT, TOP);
    // 表示に余裕を持たせる
    textSize(width * 7 / 8);

    // 壁の描写
    for (let y = 0; y < game.map.lenY; y++) {
        for (let x = 0; x < game.map.lenX; x++) {
            let tile = game.map.tileAt(x, y);
            if (tile === 1) {
                text("🌳", width * x, width * y);
            }
        }
    }

    // actorを描画
    for (let k of game.actors) {
        text(k.image, width * k.x, width * k.y)
    }

}