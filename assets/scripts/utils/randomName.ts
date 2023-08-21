import { randomIndex } from "./utils"

const LastName = [
    "上官",
    "欧阳",
    "东方",
    "端木",
    "独孤",
    "司马",
    "南宫",
    "夏侯",
    "诸葛",
    "皇甫",
    "长孙",
    "宇文",
    "轩辕",
    "东郭"
]

const FirstName = [
    "子车",
    "东阳",
    "子言",
    "雀圣",
    "赌侠",
    "赌圣",
    "稳赢",
    "不输",
    "好运",
    "自摸",
    "有钱",
    "土豪",
]

const randomName = (): string => {
    return `${LastName[randomIndex(LastName.length, 0)]}${FirstName[randomIndex(FirstName.length, 0)]}`
}

export default randomName