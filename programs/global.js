// 環境変数
const fps = 20;
const width = 50
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

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

let cursor = {
    y: 0
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
    }, {
        text: [[[
            "b"
        ]], [[]]]
    }
]

export { fps, width, ctx, text, cursor, schedule }