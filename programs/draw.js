import { game } from "./main.js"
import { fps, width, ctx, text, cursor, schedule } from "./global.js"

ctx.font = "20px 'dot'"

function draw() {
    clear()
    floorAndWall()
    inventory()
    events()
    actors()
    drawText()
    if (game.status === "feadout") sceneFadeout()
    if (game.status === "feadin") sceneFadein()
}

function clear() {
    ctx.clearRect(0, 0, game.map.lenX * width, (game.map.lenY + 2) * width)
}

function floorAndWall() {
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

function inventory() {
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
        ctx.strokeRect(
            x * width + 1,
            y * width,
            width - 2,
            width - 2
        )
    }
}

function events() {
    let target;
    if (game.events[0] !== null) {
        target = game.events[0]
        ctx.drawImage(
            game.wallImage,
            target.x * width,
            target.y * width,
            width,
            width
        )
        ctx.drawImage(
            target.image,
            target.x * width + width * 3 / 16,
            target.y * width,
            width * 5 / 8,
            width
        )
    }
    for (let k = 1; k < game.events.length; k++) {
        target=game.events[k]
        if (target.image !== null) {
            /*
            ctx.drawImage(
                target.image,
                target.x * width + width / 10,
                target.y * width + width / 10,
                width * 4 / 5,
                width * 4 / 5
            )
            */
            ctx.drawImage(
                target.image,
                target.x * width,
                target.y * width,
                width,
                width
            )
        } else {
            ctx.fillStyle = "blue"
            ctx.fillRect(
                target.x * width + width / 10,
                target.y * width + width / 10,
                width * 4 / 5,
                width * 4 / 5
            )
        }
    }
}

function actors() {
    for (let k of game.actors) {
        if (k.image !== null) {
            ctx.drawImage(
                k.image,
                k.x * width,
                k.y * width,
                width,
                width
            )
        } else {
            ctx.fillStyle = "red"
            ctx.fillRect(
                k.x * width + width / 10,
                k.y * width + width / 10,
                width * 4 / 5,
                width * 4 / 5
            )
        }
    }
}

function drawText() {
    if (!(["talking", "talkFinish", "choosing", "chooseFinish"].includes(game.status))) return
    ctx.drawImage(
        game.textWindowImage,
        (1 / 4) * width,
        (5 + 3 / 4) * width,
        (game.map.lenX - 1 / 2) * width,
        3 * width
    )
    ctx.fillStyle = "white"
    if(["talking","talkFinish"].includes(game.status)){
        for (let k = 0; k < text.n; k++) {
            ctx.fillText(
                text.talking.text[text.l][text.m][k],
                width,
                (6 + 3 / 4) * width + k * 30
            )
        }
    }
    if (text.full === null) {
        text.full = text.talking.text[text.l][text.m][text.n]
        text.now = ""
        text.count = 0
    } else if (text.count < text.talking.text[text.l][text.m][text.n].length) {
        document.getElementById("textSound").play()
        text.now += text.full[text.count]
        ctx.fillText(
            text.now,
            width,
            (6 + 3 / 4) * width + text.n * 30
        )
        text.count++
    } else if (text.count === text.talking.text[text.l][text.m][text.n].length) {
        ctx.fillText(
            text.full,
            width,
            (6 + 3 / 4) * width + text.n * 30
        )
        if (game.status === "talking" && text.timer === 0) game.status = "talkFinish"
        if (game.status === "talkFinish") {
            if (text.timer % fps < fps / 2) {
                ctx.drawImage(
                    game.textStarImage,
                    (game.map.lenX - 5 / 4) * width,
                    (7 + 3 / 4) * width,
                    width / 2,
                    width / 2
                )
            }
        }
        if (game.status === "choosing" && text.timer === 0) game.status = "chooseFinish"
        if (game.status === "chooseFinish") {
            // 現時点ではイリアス1のみ適応
            if (text.timer == 0) {
                game.status = "chooseFinish"
                cursor.y = 0
            }
            text.timer++
            ctx.drawImage(
                game.choiseWindowImage,
                6 * width,
                5 * width,
                3 * width,
                2 * width
            )
            ctx.fillStyle = "white"
            ctx.fillText(
                "やる！",
                (6 + 7 / 8) * width,
                (5 + 3 / 4) * width
            )
            ctx.fillText(
                "後で……",
                (6 + 7 / 8) * width,
                (6 + 1 / 2) * width
            )
            if (text.timer % fps < fps / 2) {
                ctx.drawImage(
                    game.cursorImage,
                    (6 + 1 / 16) * width,
                    (5 + 1 / 8 + cursor.y * (3 / 4)) * width,
                    width,
                    width
                )
            }
        }
    }
}

function sceneFadeout() {
    game.opacity -= 1 / fps
    if (game.opacity >= 0) {
        ctx.globalAlpha = game.opacity
        ctx.fillStyle = "black"
        ctx.fillRect(
            0, 0,
            game.map.lenX * width,
            game.map.lenY * width
        )
        ctx.globalAlpha = 1
    } else {
        game.opacity = 1
        // 最初の会話窓のトリガー
        game.status = "talking"
        text.talking = schedule[game.chapter]
        text.l = 0
    }
}

function sceneFadein() {
    game.opacity += 1 / fps
    if (game.opacity < 1) {
        ctx.globalAlpha = game.opacity
        ctx.fillStyle = "black"
        ctx.fillRect(
            0, 0,
            game.map.lenX * width,
            game.map.lenY * width
        )
        ctx.globalAlpha = 1
    } else {
        game.opacity = 1
        game.status = "setting"
        console.log("feadin")
    }
}

export { draw }