const PIXI = require("pixijs")
const electron = require("electron")
import { unpack_animations, merge_animations, unpack_angular_animation, unpack_linear_animation, unpack_gravity_animation, unpack_spring_animation } from "./util/animations.js"
import { LEFT_TEXT_MARGIN, TOP_TEXT_MARGIN, inBoundsCenter } from "./util/util.js"


// preloading
const ipcRenderer = electron.ipcRenderer

const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight
})

const mainContainer = new PIXI.Container()

app.stage.addChild(mainContainer)

// settings-controlled constants
let TEXT_SPEED, FONT_SIZE, MUSIC_VOLUME, VOICE_VOLUME, SFX_VOLUME

loadSettings()


// helpers
function loadSettings() {
    fs.readFile("settings.txt", "utf8", (err, data) => {
        if (err) throw err
        const settings = JSON.parse(data)
        TEXT_SPEED = settings.TEXT_SPEED
        FONT_SIZE = settings.FONT_SIZE
        MUSIC_VOLUME = settings.MUSIC_VOLUME
        VOICE_VOLUME = settings.VOICE_VOLUME
        SFX_VOLUME = settings.SFX_VOLUME
    })
}

function loadFile() {
    
}

// rendering
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
        const textBox = new PIXI.Sprite(scene.text.text_box_image)
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
                ipcRenderer.send("next-scene", scene.id)
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
    if (scene.background === undefined || scene.bgm === undefined) {
        console.log("invalid Game")
        return
    }
    let bgm = new Audio(scene.bgm.src)
    bgm.volume = scene.bgm.volume
    bgm.play()
    
    function onKeyDown(key) {
        try {
            scene.keybinds[key.keyCode.toString()]()
        } catch (e) {
            console.log(e)
        }
    }

    document.addEventListener("keydown", onKeyDown)

    let start, previous
    function step(timeStamp) {
        if (start === undefined) start = timeStamp

        const elapsed = timeStamp - start
        if (previous !== timeStamp) {
            const frame = Math.round(elapsed / 16.66666666666667)

            // buttons
            let buttonContainer = new PIXI.Container()
            buttonContainer.x = 0
            buttonContainer.y = 0
            buttonContainer.width = app.renderer.width
            buttonContainer.height = app.renderer.height
            buttonContainer.interactive = false
            for (const btn of scene.buttons) {
                let button = new PIXI.Sprite(PIXI.Texture.from(btn.texture))
                button.anchor.set(0.5)
                button.x = btn.x
                button.y = btn.y
                button.width = btn.width
                button.height = btn.height
                button.interactive = true
                button.on("pointerup", (event) => {
                    if (inBoundsCenter(event.globalX, event.globalY, btn.x, btn.y, btn.width, btn.height)) {
                        btn["callback"]()
                    }
                })
    
                let buttonText = new PIXI.Text(btn.text.content, {
                    fontFamiy: btn.text.font,
                    fontSize: btn.text.font_size,
                    fill: btn.text.font_colour,
                    align: "left"
                })
                buttonText.x = btn.x
                buttonText.y = btn.y
    
                buttonText.interactive = false
                buttonContainer.addChild(button)
                buttonContainer.addChild(buttonText)
            }

            // background
            const background = new PIXI.Sprite(PIXI.Texture.from(scene.background))
            background.width = app.renderer.width
            background.height = app.renderer.height
            background.x = 0
            background.y = 0
            background.interactive = false

            // sprites
            let spriteContainer = new PIXI.Container()
            spriteContainer.x = 0
            spriteContainer.y = 0
            spriteContainer.width = app.renderer.width
            spriteContainer.height = app.renderer.height
            spriteContainer.interactive = false
            if (scene.sprites) {
                for (const s of scene.sprites) {
                    let sprite = new PIXI.Sprite(PIXI.Texture.from(s.texture))
                    sprite.x = s.x
                    sprite.y = s.y
                    sprite.width = s.width
                    sprite.height = s.height
                    sprite.anchor.set(0.5)
                    sprite.interactive = false
                    spriteContainer.addChild(sprite)
                }
            }

            // text
            let textContainer = new PIXI.Container()
            textContainer.x = 0
            textContainer.y = 0
            textContainer.width = app.renderer.width
            textContainer.height = app.renderer.height
            textContainer.interactive = false
            if (scene.text) {
                for (const t of scene.text) {
                    let text = new PIXI.Text(t.content, {
                        fontFamiy: t.font,
                        fontSize: t.font_size,
                        fill: t.font_colour,
                        align: "left"
                    })
                    text.x = t.x
                    text.y = t.y
                    text.width = t.width
                    text.height = t.height
                    text.anchor.set(0.5)
                    text.interactive = false
                    textContainer.addChild(text)
                }
            }

            mainContainer.addChild(background)
            mainContainer.addChild(spriteContainer)
            mainContainer.addChild(textContainer)
            mainContainer.addChild(buttonContainer)
        }
        previous = timeStamp
        window.requestAnimationFrame(step)
    }
    window.requestAnimationFrame(step)
    document.body.appendChild(app.view)
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


// ipc communication
ipcRenderer.on("ready", (event) => {
    // render
})

ipcRenderer.on("settings-saved", (event) => {
    // reload settings
    loadSettings()
})

ipcRenderer.on("next-scene", (event, scene_id) => {
    // get next scene from game files by id
    // render scene
})