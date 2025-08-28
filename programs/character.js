import { game } from "./main.js";
import { Actor, Event } from "./classDate.js";
import { text } from "./global.js"

function kintoki1() {
    const kintokiImage = new Image();
    kintokiImage.src = "./images/actors/kintoki.png";
    let kintoki = new Actor(4, 4, kintokiImage);
    game.player = kintoki;
    game.actors.push(kintoki)

    const doorImage = new Image()
    doorImage.src = "./images/events/door.png"
    const door = new Event(
        4, 8, doorImage,
        ["sound", "text1", "text2"],
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
    chandelierImage.src = "./images/events/chandelier.png"
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
        null, null
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
        null, null
    );
    game.events.push(ticketBlue)
}

function nakamu1() {
    game.set()

    // playerを追加
    const nakamuImage = new Image();
    nakamuImage.src = null;
    let nakamu = new Actor(4, 7, null);
    game.player = nakamu;
    game.actors.push(nakamu)

    game.events.push(null)

    const feedShelfImage = new Image();
    feedShelfImage.src = "./images/events/feedShelf.png";
    const feedShelf = new Event(
        5, 7, feedShelfImage,
        ["text1","event", "text2"],
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
        null, null
    )
    game.events.push(feedShelf)

    const elephantImage = new Image();
    elephantImage.src = "./images/events/elephant.png";
    const elephant = new Event(
        4, 8, elephantImage,
        ["text1", "text2"],
        [[[
            "出口をゾウが塞いじゃっているみたいだ"
        ], [
            "うーん、避けてくれたら",
            "嬉しいんだけど……"
        ], [
            "でも、重すぎて到底動かせそうにないや"
        ], [
            "餌とかあったら、",
            "誘導できたりするのかな……？"
        ], [
            "……でも、この子の",
            "好きなものなんて分からないや"
        ]], [[
            "大きなゾウが出口を塞いでいる"
        ]]],
        null, null
    )
    game.events.push(elephant);
}

function lliad1() {
    const lliadImage = new Image();
    lliadImage.src = null;
    let lliad = new Actor(4, 7, null);
    game.player = lliad;
    game.actors.push(lliad)

    const doorImage = new Image()
    doorImage.src = "./images/events/door.png"
    const door = new Event(
        4, 8, doorImage,
        ["text1", "text2"],
        [[[
            "鍵が締まっているドアだ",
            "鍵、どこにやったっけな……？"
        ]], [[
            "鍵がかかって開かないドアだ"
        ]]],
        null, null
    )
    game.events.push(door)

    const feedShelfImage = new Image();
    feedShelfImage.src = "./images/events/feedShelf.png";
    const feedShelf = new Event(
        4, 5, feedShelfImage,
        ["event", "text2"],
        [[[
            "今まで体が覚えていた通りに",
            "餌やりしていたけど……"
        ], [
            "……これを全部整理するとなると",
            "だいぶ大変だなぁ"
        ], [
            "……！よし、頑張んないと！"
        ]], [[
            "餌の整理、頑張ったなぁ……！"
        ]]],
        null,
        function feed() {
            console.log("feed event")
            // テキストを表示→するかどうかの選択→するなら画面遷移
            text.talking = {
                text: [[["餌の整理、するかぁ……"]], [[]]]
            }
            text.l = 0
            game.status = "choosing"
        }
    )
    game.events.push(feedShelf)
}

export { kintoki1, nakamu1, lliad1 }