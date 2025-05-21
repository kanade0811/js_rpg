class Map {
    constructor() {
        // マップの配列
        this.tiles = [
            1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 1, 1, 1, 1, 1, 1, 1
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
    constructor(x,y,image){
        this.x=x;
        this.y=y;
        this.image=image;
    }
}

class Camera {
    /**
     * @param {number} x カメラのx
     * @param {number} y カメラのy
     */
    constructor(x,y){
        this.x=x;
        this.y=y;
    }
}

class Move{
    /**
     * 
     * @param {Actoor} actor 移動させたいアクター
     * @param {number} dx x軸上の移動
     * @param {number} dy y軸上の移動
     */
    constructor(actor,dx,dy){
        this.actor=actor;
        this.dx=dx;
        this.dy=dy;
        // この下4つは仮の数
        this.beginX=-1;
        this.biginY=-1;
        this.endX=-1;
        this.endY=-1;
    }
}

class Game{
    constructor(){
        this.map = new Map();
        this.player=null;   
        this.actors=[];
        this.camera=new Camera(0,0);
        this.commands=[];
    }
}
let game;

function setup(){
    // ゲーム状態を初期化
    game = new Game();
    // プレイヤーを作る
    let player=new Actor(1,1,"🏃‍♂️‍➡️");
    game.player=player

    // 初期配置のactor
    game.actors=[player];
    // キャンバスを作る
    createCanvas(480,480)
}

function draw(){

    // 1マスの大きさ
    let width=40;
    // 背景色
    background("Bispue");
    // カメラ位置の固定
    textAlign(LEFT,TOP);
    // 表示に余裕を持たせる
    textSize( width*7/8 );

    // 壁の描写
    for (let y=0 ; y<game.map.lenY ; y++){
        for (let x=0 ; x<game.map.lenX ; x++ ){
            let tile=game.map.tileAt(x,y);
            if ( tile === 1 ){
                text("🕺",width*x,width*y);
            }
        }
    }

    // プレイヤーの入力を受け入れる
    // →commands配列が分かんない
    if(keyIsPressed){
        // xyの移動を配列化
        let dxy={37:[-1,0],38:[0,-1],39:[1,0],40:[0,1]}[keyCode];
        if (dxy !== undefined){
            game.commands.push(new Move(game.player,dxy[0],dxy[1]));
        }
    }

    // 1フレームずつ実行、コマンド消すが良く分からん
    // コマンドを消すということは理解、しかしdoneって何？

    // actorを描画
    for(let k of game.actors){
        text(k.image,width*k.x,width*k.y)
    }

}