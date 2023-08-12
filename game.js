export class Game {
    constructor() {
        this.buttons = []
        this.keybinds = {}
    }

    add_button(button) {
        this.buttons.push(button)
    }

    add_keybind(keybind) {
        this.keybinds[keybind.key] = keybind.callback
    }
}