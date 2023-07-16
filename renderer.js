const PIXI = require("pixijs")
import { unpack_animations, merge_animations, unpack_angular_animation, unpack_linear_animation, unpack_gravity_animation, unpack_spring_animation } from "./util/animations.js"
import { TEXT_SPEED, LEFT_TEXT_MARGIN, TOP_TEXT_MARGIN } from "./util/util.js"
const electron = require("electron")

const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight
})

const mainContainer = new PIXI.Container()

app.stage.addChild(mainContainer)

const Sequence = {
    scenes: [], // list of scenes
    bgm: {} // bgm src, volume
}

const staticScene = {
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
        text_box_colour: "", // hex
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
    type: "media",
    media: {
        type: "",
        src: "",
        volume: 0
    }
}

const gameScene = {
    type: "game",
    game: {} // Game class probably
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


function render_static_scene(scene, frame) {
    const background = new PIXI.Sprite(PIXI.Texture.from(scene.background))
    background.width = app.renderer.width
    background.height = app.renderer.height
    background.x = 0
    background.y = 0
    background.interactive = false
    mainContainer.addChild(background)

    const textBoxContainer = new PIXI.Container()
    textBoxContainer.x = 0
    textBoxContainer.y = app.renderer.height * 0.8
    textBoxContainer.width = app.renderer.width
    textBoxContainer.height = app.renderer.height / 5
    
    if (scene.text.visible) {
        const textBox = new PIXI.Sprite(scene.text.text_box_colour)
        textBox.x = 0
        textBox.y = 0
        textBox.width = app.renderer.width
        textBox.height = app.renderer.height / 5
        textBox.interactive = true

        let end = false
        if (scene.text.start <= frame && (frame <= (scene.text.start + scene.text.duration) || scene.text.duration === undefined)) {
            let content
            if (!scene.text.animated) {
                content = scene.text.content
                end = true
            } else {
                const index = Math.min(Math.floor((frame - scene.text.start) / TEXT_SPEED) + 1, scene.text.content.length)
                content = scene.text.content.slice(0, index)
                if (index - 1 === (frame - scene.text.start) / TEXT_SPEED) {
                    let sound = new Audio(scene.text.type_sound.src)
                    sound.volume = scene.text.type_sound.volume
                    sound.play()
                }
                if (index === scene.text.content.length) end = true
            }
            const text = new PIXI.Text(content, {
                fontFamiy: scene.text.font,
                fontSize: scene.text.font_size,
                fill: scene.text.font_colour,
                align: "left"
            })
            text.x = LEFT_TEXT_MARGIN
            text.y = TOP_TEXT_MARGIN
            textBoxContainer.addChild(text)
        }
        textBox.on("pointerup", () => {
            if (!end && scene.text.start <= frame) {
                scene.text.animated = false
            } else {
                return true
            }
        })
        textBoxContainer.addChildAt(textBox, 0)
        mainContainer.addChild(textBoxContainer)
    }

    if (!scene.sounds.empty) {
        for (const s of scene.sounds) {
            if (s.start === frame) {
                let sound = new Audio(s.src)
                sound.volume = s.volume
                sound.play()
            }
        }
    }

    for (const c of scene.characters) {
        if (frame >= c.start && (frame <= (c.start + c.duration) || c.duration === undefined)) {
            const character = new PIXI.Sprite(PIXI.Texture.from(c.image))
            character.width = c.width
            character.height = c.height
            character.x = c.x
            character.y = c.y
            character.angle = c.angle
            character.anchor.set(0.5)
            if (!c.animations.empty) {
                const transformations = unpack_animations(c.animations)
                try {character.x += transformations[frame].dx} catch {}
                try {character.y += transformations[frame].dy} catch {}
                try {character.width += transformations[frame].dw} catch {}
                try {character.height += transformations[frame].dh} catch {}
                try {character.angle += transformations[frame].dr} catch {}
                c.x = character.x
                c.y = character.y
                c.width = character.width
                c.height = character.height
                c.angle = character.angle
            } else {
                character.x = c.x
                character.y = c.y
                character.width = c.width
                character.height = c.height
                character.angle = c.angle
            }
            mainContainer.addChild(character)
        }
    }
    document.body.appendChild(app.view)
}

function render_media_scene(media) {
    switch (media.type) {
        case "video":
            const video = document.createElement("video")
            video.src = media.src
            video.width = app.renderer.width
            video.height = app.renderer.height
            video.volume = media.volume
            document.body.appendChild(video)
            video.play()
            break
        case "gif":
            break
        case "image":
            break
    }
    
}

function render_game_scene(scene) {

}

function render_sequence(sequence) {
    let sound = new Audio(sequence.bgm.src)
    sound.volume = sequence.bgm.volume
    sound.play()
    for (const s of sequence.scenes) {
        if (s.type === "static") {
            try {
                let start, previous
                function step(timeStamp) {
                    if (start === undefined) start = timeStamp
            
                    const elapsed = timeStamp - start
                    if (previous !== timeStamp) {
                        const frame = Math.round(elapsed / 16.66666666666667)
                        const stop = render_static_scene(s, frame)
                        if (stop) {
                            throw new Error
                        }
                    }
                    previous = timeStamp
                    window.requestAnimationFrame(step)
                }
                window.requestAnimationFrame(step)
            } catch {
                continue
            }
        } else if (s.type === "media") {
            render_media_scene(s.media)
        } else if (s.type === "game") {
            render_game_scene(s.game)
        }
    }
}

function render(scene) {
    
}


// testing

// const s = {
//     type: "static", // enum(static, dynamic)

//     background: "./assets/images/bg.jpg",  // image src
//     characters: [], // Array<Character>
//     animations: [], // Array<Animation>
//     sounds: [
//         {
//             src: "./assets/sounds/sus.mp3",
//             start: 60,
//             volume: 1
//         }
//     ], // {src, start, volume}

//     text: {
//         content: "fuck me in the ass", // string
//         start: 60,
//         duration: undefined,
//         animated: true,
//         visible: true, // yes/no
//         text_box_colour: PIXI.Texture.WHITE, // hex
//         font: "Times New Roman", //string
//         font_colour: "000000", // hex
//         font_size: 15, // int,
//         type_sound: {
//             src: "./assets/sounds/press.wav",
//             volume: 0.5
//         }
//     }
// }

// render_sequence(
//     {
//         bgm: {src: "./assets/sounds/sus.mp3",
//         start: 0,
//         volume: 1},
//         scenes: [s]
//     }
// )