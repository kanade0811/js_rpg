import { fps, width, ctx } from "./global.js"
import { Game, setBackground, setTextWindow, setKeyActions } from "./setting.js"
import { kintoki1, nakamu1, lliad1 } from "./character.js"
import { draw } from "./draw.js"

export let game;

window.onload = function () {
    // ゲーム状態を初期化
    game = new Game();
    setInterval(update, 1000 / fps);
    setBackground()
    setTextWindow()
    setKeyActions()

    // game.chapters[game.chapter]()
    // テスト用
    lliad1()
}

function update() {
    moveActor()
    draw()
    nextCharacter()
}

// 全てのeventsを調べ終わったらシーンとキャラを変更する
function nextCharacter() {
    if (game.status === "moving") {
        if (game.events.length === 0) return
        for (let k of game.events) {
            if (k.statuses[k.status] !== "text2") return
        }
        game.opacity = 0
        game.status = "feadin"
        console.log("finish")
    }
    if (game.status === "setting") {
        ctx.globalAlpha = 1
        ctx.fillStyle = "black"
        ctx.fillRect(
            0, 0,
            game.map.lenX * width,
            game.map.lenY * width
        )
        game.chapter++
        game.chapters[game.chapter]()
        game.status = "feadout"
    }
}

function moveActor() {
    for (let c of game.commands) {
        c.exec();
    }
    // 実行し終わったコマンドを消す
    game.commands = game.commands.filter(c => !c.done);
}