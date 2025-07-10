import { game } from "./main.js"
import { fps, text } from "./global.js"

class Map {
    constructor() {
        // マップの配列、床は0,壁は1,アイテムは2
        this.tiles = [
            1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 0, 0, 0, 0, 0, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 1, 0, 0, 0, 0, 0, 1, 1,
            1, 1, 1, 1, 0, 1, 1, 1, 1
        ];
        // 縦と横の長さ
        this.lenX = 9;
        this.lenY = 9;
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
            if (this.dx === 1) this.actor.dir = 0;
            if (this.dy === -1) this.actor.dir = 1;
            if (this.dx === -1) this.actor.dir = 2;
            if (this.dy === 1) this.actor.dir = 3;
            //移動不可なら実行済みにして終了
            if (!(game.map.isWalkable(this.endX, this.endY))) {
                this.frame = fps;
                return this.done;
            }
            let target
            for (let k = (game.events[0] === null ? 1 : 0); k < game.events.length; k++) {
                target = game.events[k]
                if ((this.endX === target.x) && (this.endY === target.y)) {
                    this.frame = fps;
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
    * @param {strings} status eventのstatus
    * @param {strings} text eventの持つtext1,2
    * @param {sound} sound eventの持つsound
    */
    constructor(x, y, image, statuses, text, sound, event) {
        this.x = x
        this.y = y
        this.image = image
        this.statuses = statuses
        this.text = text
        this.sound = sound
        this.status = 0
        this.event = event
    }
    search() {
        let dxyData = [[1, 0], [0, -1], [-1, 0], [0, 1]]
        let dxy = dxyData[game.actors[0].dir]
        let playerXY = [game.actors[0].x + dxy[0], game.actors[0].y + dxy[1]]
        let target
        for (let k = (game.events[0] === null ? 1 : 0); k < game.events.length; k++) {
            target = game.events[k]
            if (playerXY[0] === target.x && playerXY[1] === target.y) this.act(target)
        }
    }
    act(event) {
        if (event.statuses[event.status] === "sound") {
            // 音ごとに再生するものをifで決める←対処法あれば直したいね……
            if (event.sound === "doorLockedSound") {
                // document.getElementById("textSound").play()
                document.getElementById("doorLoockedSound").play()
                event.status++
                game.status = "waiting"
            }
        } else if (event.statuses[event.status] === "text1") {
            text.talking = event
            text.l = 0
            event.status++
            game.status = "talking"
        } else if (event.statuses[event.status] === "event") {
            event.event()
            // 終了したらevent.status++
        } else if (event.statuses[event.status] === "text2") {
            text.talking = event
            text.l = 1
            game.status = "talking"
        }
    }
}

export { Map, Actor, Move, Event }