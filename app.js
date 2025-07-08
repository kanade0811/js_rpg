// 環境変数
const fps = 20;

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
    draw() {
        if (this.image !== null) {
            ctx.drawImage(
                this.image,
                this.x * width,
                this.y * width,
                width,
                width
            )
        } else {
            ctx.fillStyle = "red"
            ctx.fillRect(
                this.x * width + width / 10,
                this.y * width + width / 10,
                width * 4 / 5,
                width * 4 / 5
            )
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
            if (this.dx === 1) this.actor.dir = 0;
            if (this.dy === -1) this.actor.dir = 1;
            if (this.dx === -1) this.actor.dir = 2;
            if (this.dy === 1) this.actor.dir = 3;
            //移動不可なら実行済みにして終了
            if (!(game.map.isWalkable(this.endX, this.endY))) {
                this.frame = fps;
                return this.done;
            }
            for (let k of game.events) {
                if ((this.endX === k.x) && (this.endY === k.y)) {
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
    draw() {
        if (this.image !== null) {
            ctx.drawImage(
                this.image,
                this.x * width + width / 10,
                this.y * width + width / 10,
                width * 4 / 5,
                width * 4 / 5
            )
        } else {
            ctx.fillStyle = "blue"
            ctx.fillRect(
                this.x * width + width / 10,
                this.y * width + width / 10,
                width * 4 / 5,
                width * 4 / 5
            )
        }
    }
    drawDoor() {
        ctx.drawImage(
            game.wallImage,
            this.x * width,
            this.y * width,
            width,
            width
        )
        ctx.drawImage(
            this.image,
            this.x * width + width * 3 / 16,
            this.y * width,
            width * 5 / 8,
            width
        )
    }
    search() {
        let dxyData = [[1, 0], [0, -1], [-1, 0], [0, 1]]
        let dxy = dxyData[game.actors[0].dir]
        let playerXY = [game.actors[0].x + dxy[0], game.actors[0].y + dxy[1]]
        for (let k = 0; k < game.events.length; k++) {
            if (playerXY[0] === game.events[k].x && playerXY[1] === game.events[k].y) {
                this.act(game.events[k])
            }
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
            this.event()
            // 終了したらevent.status++
        } else if (event.statuses[event.status] === "text2") {
            text.talking = event
            text.l = 1
            game.status = "talking"
        }
    }
}

class Game {
    constructor() {
        this.map = new Map();
        this.event = new Event();
        this.player = null;
        this.actors = [];
        this.commands = [];
        this.events = [];
        /*
        setting→キャラやイベントの配置中
        scene→何もできない
        moving→移動と行動
        reading→読む
        waiting→次行動へ待つ
        */
        this.phase = 0
        this.status = "moving";
        this.opacity = 1;
        this.talking = null;
        this.fonts = [];
        this.chapter = 0
        this.chapters = [
            kintoki1,
            nakamu1
        ]
    }
    set() {
        this.player = null;
        this.actors = [];
        this.commands = [];
        this.events = [];
    }
}
let game;

window.onload = function () {
    // ゲーム状態を初期化
    game = new Game();
    setInterval(draw, 1000 / fps);
    setBackground()
    setTextWindow()
    setKeyActions()

    kintoki1()
}

function kintoki1() {
    const kintokiImage = new Image();
    kintokiImage.src = "./images/actors/kintoki.png";
    let kintoki = new Actor(4, 4, kintokiImage);
    game.player = kintoki;
    game.actors.push(kintoki)

    // event(x,y,image,events,text[テキスト全体][窓ごとのテキスト][各行の文章],sound)
    
    const doorImage = new Image()
    doorImage.src = "./images/events/door.png"
    const door = new Event(
        4, 8, doorImage,
        ["sound", "text1","text2"],
        [[[
            "あれ、ドアの鍵が閉まってるみたい",
            "……ってことは、閉じ込められてる？"
        ], [
            "どうしよう、どうしよう……",
            "帰れないと困っちゃうんだけど……！"
        ]], [[
            "開かないドアだ"
        ]]],
        "doorLockedSound",
        null
    )
    game.events.push(door)

    const chandelierImage = new Image()
    chandelierImage.src="./images/events/chandelier.png"
    const chandelier = new Event(
        4, 3, chandelierImage,
        ["text1", "text2"],
        [[[
            "こんなに大きいシャンデリアを",
            "見たのは始めてだ"
        ], [
            "それにしても、よく落ちてこないな……"
        ], [
            "もし仮にでも落ちてきたら……"
        ], [
            "いや、怖いことを考えるのはやめよう"
        ]], [[
            "大きいシャンデリアがぶら下がっている"
        ]]],
        null,
        null
    )
    game.events.push(chandelier)

    const ticketBlueImage = new Image()
    ticketBlueImage.src = "./images/events/ticketBlue.png"
    const ticketBlue = new Event(
        4, 5, ticketBlueImage,
        ["text1", "text2"],
        [[[
            "青い半券が落ちている",
            "俺が記名したチケットだ"
        ], [
            "でもどうしてこんなところに",
            "落ちているんだろう……？"
        ]], [[
            "僕が記入した半券だ"
        ]]],
        null,
        null
    );
    game.events.push(ticketBlue)
}

function nakamu1() {
    game.set()

    // playerを追加
    const nakamuImage = new Image();
    // nakamuImage.src = null;
    nakamuImage.src = "./images/actors/kintoki.png";
    let nakamu = new Actor(4, 7, nakamuImage);
    game.player = nakamu;
    game.actors.push(nakamu)

    const feedShelfImage = new Image();
    feedShelfImage.src = "./images/events/feedShelf.png";
    const feedShelf = new Event(
        6, 1, feedShelfImage,
        ["text1", "event", "text2"],
        [[[
            "食べ物がいっぱいあるみたい",
            "人参、リンゴ、肉に魚……"
        ], [
            "料理の材料にしては、",
            "変なのばっかりだなぁ"
        ], [
            "もしかしたら動物たちの",
            "餌なのかもしれない！",
        ], [
            "餌だけでこんなにいっぱいあるなら",
            "きっともっといっぱいの",
            "動物がいるんだろうなぁ"
        ]], [[
            "動物たちの餌が入った棚だ"
        ]]],
        null,
        function feed() {
            console.log("feed event")
        }
    )
    game.events.push(feedShelf)
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
}

function resetText() {
    if (text.n === text.talking.text[text.l][text.m].length - 1) {
        if (text.m < text.talking.text[text.l].length - 1) {
            text.m++
            game.status = "talking"
        } else {
            text = {
                talking: null,
                l: null,
                m: 0,
                n: 0,
                full: null,
                now: null,
                count: 0,
                timer: 0
            }
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
        // 移動
        if (game.status === "moving") {
            if (event.code === "KeyA" || event.code === "KeyW" || event.code === "KeyD" || event.code === "KeyS") {
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
            }
            if (event.code === "KeyQ") {
                for (let k of game.events) console.log(k.statuses[k.status])
            }
        }
        // 取得、進める等
        if (event.code === "Space") {
            if (["moving", "waiting"].includes(game.status)) {
                game.event.search()
            } else if (game.status === "talking") {
                text.count = text.talking.text[text.l][text.m][text.n].length
                text.timer = 0
            } else if (game.status === "talkFinish") {
                resetText()
            }
        }
    });
}

const width = 50
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
function draw() {
    moveActor()
    update()
    nextCharacter()
}

function update() {
    drawClear()
    drawFloorAndWall()
    drawInventory()
    drawEvent()
    drawActor()
    drawText()
    if (game.status === "feadout") sceneFadeout()
    if (game.status === "feadin") sceneFadein()
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

function drawClear() {
    ctx.clearRect(0, 0, game.map.lenX * width, (game.map.lenY + 2) * width)
}

function drawFloorAndWall() {
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

function drawInventory() {
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

function drawEvent() {
    for (let k = 0; k < game.events.length; k++) {
        if (game.events[k].x === 4 && game.events[k].y === game.map.lenY-1) {
            game.events[k].drawDoor()
        } else {
            game.events[k].draw()
        }
    }
}

function drawActor() {
    for (let k of game.actors) {
        k.draw()
    }
}

function drawText() {
    if (game.status === "talking" || game.status === "talkFinish") {
        ctx.drawImage(
            game.textWindowImage,
            (1 / 4) * width,
            (5 + 3 / 4) * width,
            (game.map.lenX - 1 / 2) * width,
            3 * width
        )

        ctx.fillStyle = "white"
        ctx.font = "20px 'dot'";
        for (let k = 0; k < text.n; k++) {
            ctx.fillText(
                text.talking.text[text.l][text.m][k],
                width,
                (6 + 3 / 4) * width + k * 30
            )
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
            if (text.timer == 0) {
                game.status = "talkFinish"
            }
            text.timer++
            if (text.timer % fps < fps / 2) {
                ctx.drawImage(
                    game.textStarImage,
                    (game.map.lenX - 3 / 2 + 1 / 4) * width,
                    (7 + 3 / 4) * width,
                    width / 2,
                    width / 2
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
        firstTalk()
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

let text = {
    nextTalking: null,
    talking: null,
    l: null,
    m: 0,
    n: 0,
    full: null,
    now: null,
    count: 0,
    timer: 0
}

let schedule = [
    {
        text: [[[
            "あれ、俺、なんでこんなところに……？",
            "確か、DAYDREAM CIRCUSって名前の",
            "移動式サーカスのチケットを貰って……"
        ], [
            "……ここにいる理由が思い出せないなぁ"
        ], [
            "もうそろそろ帰りたいんだけど……？"
        ]], [[]]]
    },
    {
        text: [[[
            "a"
        ]], [[]]]
    }
]

function firstTalk() {
    game.status = "talking"
    text.talking = schedule[game.chapter]
    text.l = 0
}