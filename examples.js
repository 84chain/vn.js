const Sequence = {
    scenes: [], // list of scenes
    bgm: {} // bgm src, volume
}

const staticScene = {
    id: 0, // number
    type: "static",

    background: "",  // image src
    characters: [], // Array<Character>
    animations: [], // Array<Animation>
    sounds: [], // {src, start, volume}

    text: {
        content: null, // string
        start: 0,
        duration: 0,
        animated: true,
        visible: true, // yes/no
        text_box_image: "", // path
        font: "", //string
        font_colour: "", // hex
        font_size: 0, // int,
        type_sound: {
            src: "",
            volume: 0
        }
    }
}

const mediaScene = {
    id: 0,
    type: "media",
    media: {
        type: "",
        src: "",
        volume: 0
    }
}

const gameScene = {
    id: 0,
    type: "game",
    game: {} // object
}

const game = {
    background,
    bgm: {
        src: "",
        volume: 0
    },
    sprites: [],
    buttons: [
        {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            texture: "",
            text: {
                content: "",
                font: "",
                colour: "",
                font_size: ""
            },
            callback: () => {}
        }
    ],
    keybinds: {}
}

const Character = {
    name: null, // string
    image: null, // string
    start: 0,
    duration: 0,
    width: null, // int
    height: null, //height
    x: null, // int
    y: null, // int
    animations: []
}