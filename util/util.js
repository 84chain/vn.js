// true constants - unchangeable by settings
export const LEFT_TEXT_MARGIN = 10
export const TOP_TEXT_MARGIN = 10

export function inBounds(x, y, bounds) {
    if (Math.abs(bounds.x2 - x) > Math.abs(bounds.x2 - bounds.x1)) return false
    if (Math.abs(bounds.y2 - y) > Math.abs(bounds.y2 - bounds.y1)) return false
    return true
}

export function inBoundsCenter(x, y, px, py, width, height) {
    if (Math.abs(x - px) > width / 2) return false
    if (Math.abs(y - py) > height / 2) return false
    return true
}