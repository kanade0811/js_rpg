import { game } from "./main.js"
import { text, cursor } from "./global.js"
import { Map, Move, Event } from "./classDate.js"
import { kintoki1, nakamu1, lliad1 } from "./character.js"

class Game {
    constructor() {
        this.map = new Map();
        this.event = new Event();
        this.player = null;
        this.actors = [];
        this.commands = [];
        this.events = [];
        this.phase = 0
        /*
        setting→キャラやイベントの配置中
        scene→何もできない
        moving→移動と行動
        reading→読む
        waiting→次行動へ待つ
        choosing→選択する際の文章を読み進めている
        chooseFinish→実際の選択画面
        */
        this.status = "moving";
        this.opacity = 1;
        this.talking = null;
        this.fonts = [];
        this.chapter = 0
        this.chapters = [
            kintoki1,
            nakamu1,
            lliad1
        ]
    }
    set() {
        this.player = null;
        this.actors = [];
        this.commands = [];
        this.events = [];
    }
}

function setBackground() {
    game.floorImage = new Image();
    game.floorImage.src = "./images/background/floor.png";
    game.wallImage = new Image();
    game.wallImage.src = "./images/background/wall.png"
    game.inventoryImage = new Image();
    game.inventoryImage.src = "./images/background/inventory.png"
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
    game.choiseWindowImage = new Image();
    game.choiseWindowImage.src = "./images/background/choiseWindow.png";
    game.cursorImage = new Image();
    game.cursorImage.src = "./images/background/cursor.png"
}

function resetText() {
    if (text.n === text.talking.text[text.l][text.m].length - 1) {
        if (text.m < text.talking.text[text.l].length - 1) {
            text.m++
            game.status = "talking"
        } else {
            text.talking = null
            text.l = null
            text.m = 0
            text.n = 0
            text.full = null
            text.now = null
            text.count = 0
            text.timer = 0
            game.status = "moving"
        }
        text.n = 0
    } else {
        text.n++
        game.status = "talking"
    }
    text.full = null
    text.now = null
    text.count = 0
    text.timer = 0
}

function setKeyActions() {
    document.addEventListener("keydown", (event) => {
        // WASD→移動、選択画面でのカーソル移動
        if (["KeyW", "KeyA", "KeyS", "KeyD"].includes(event.code)) {
            if (game.status === "moving") {
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
            } else if (game.status === "chooseFinish") {
                // 選択肢が2つの場合のみを考える
                if (event.code === "KeyS" && cursor.y === 0) cursor.y += 1
                if (event.code === "KeyW" && cursor.y === 1) cursor.y -= 1
            }
        }
        // space→取得、会話等
        if (event.code === "Space") {
            if (["moving", "waiting"].includes(game.status)) {
                game.event.search()
            } else if (game.status === "talking") {
                text.count = text.talking.text[text.l][text.m][text.n].length
                text.timer = 0
            } else if (game.status === "talkFinish") {
                resetText()
            } else if (game.status === "choosing") {
                console.log("now choosing")
            }
        }
    });
}

export { Game, setBackground, setTextWindow, resetText, setKeyActions }