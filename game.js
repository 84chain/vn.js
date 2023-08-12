class Game {
    constructor(app) {
        this.app = app
        this.buttons = []
        this.keybinds = {}
    }

    set add_button(button) {
        this.buttons.push(button)
    }

    set add_keybind(keybind) {
        this.keybinds.push(keybind)
    }
}