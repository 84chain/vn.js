export function unpack_animations(animations) {
    let animation_data = []
    let override = {}
    for (const animation of animations) {
        switch (animation.type) {
            case "linear":
                animation_data.push(unpack_linear_animation(animation))
                break
            case "gravity":
                animation_data.push(unpack_gravity_animation(animation))
                break
            case "angular":
                animation_data.push(unpack_angular_animation(animation))
                break
            case "spring":
                animation_data.push(unpack_spring_animation(animation))
                break
            case "data":
                animation_data.push(animation.data)
                break
            case "override":
                override = animation.override
        }
    }
    return merge_animations(animation_data, override)
}

export function unpack_linear_animation(animation) {
    let transformations = {}
    let dx = (animation.end_position.x - animation.start_position.x) / animation.duration
    let dy = (animation.end_position.y - animation.start_position.y) / animation.duration
    let dw = (animation.end_position.width - animation.start_position.width) / animation.duration
    let dh = (animation.end_position.height - animation.start_position.height) / animation.duration
    let dr = (animation.end_position.angle - animation.start_position.angle) / animation.duration
    for (let i = animation.start; i <= (animation.start + animation.duration); i++) {
        transformations[i] = {
            dx: dx,
            dy: dy,
            dw: dw,
            dh: dh,
            dr: dr
        }
    }
    return transformations
}

export function unpack_gravity_animation(animation) {
    // width/height/angle/skew held constant, object accelerates with a given initial velocity and momentum in a gravitational field
    // remember top left is 0, 0
    const a = animation.acceleration
    const gravity = animation.gravity
    const net_a = {
        x: a.x + gravity.x,
        y: a.y + gravity.y,
        width: a.width + gravity.width,
        height: a.height + gravity.height,
        angle: a.angle + gravity.angle
    }
    let transformations = {}
    for (let i = 0; i <= animation.duration; i++) {
        const dx = animation.dx + net_a.x * i
        const dy = animation.dy + net_a.y * i
        const dw = animation.dw + net_a.width * i
        const dh = animation.dh + net_a.height * i
        const dr = animation.dr + net_a.height * i
        transformations[i + animation.start] = {
            dx: dx,
            dy: dy,
            dw: dw,
            dh: dh,
            dr: dr
        }
    }
    return transformations
}

export function unpack_angular_animation(animation) {
    // x/y/width/height/skew held constant, object accelerates angularly around the anchor
    let transformations = {}
    for (let i = 0; i <= animation.duration; i++) {
        const w = animation.velocity + transformations.acceleration * i
        transformations[i + animation.start] = {
            dx: animation.dx,
            dy: animation.dy,
            dw: animation.dw,
            dh: animation.dh,
            dr: w
        }
    }
    return transformations
}

export function unpack_spring_animation(animation) {
    // width/height/angle/skew held constant, object behaves like a spring - initial velocity 0
    let transformations = {}
    for (let i = 0; i <= animation.duration; i++) {
        const fx = Math.max(0, (1 - animation.friction.x)) ** i
        const fy = Math.max(0, (1 - animation.friction.y)) ** i
        const dx = -(animation.amplitude.x * animation.w.x * Math.sin(animation.w.x * i + animation.phase.x)) * fx
        const dy = -(animation.amplitude.y * animation.w.y * Math.sin(animation.w.y * i + animation.phase.y)) * fy
        transformations[i + animation.start] = {
            dx: dx,
            dy: dy,
            dw: animation.dw,
            dh: animation.dh,
            dr: animation.dr
        }
    }
    return transformations
}

export function merge_animations(animation_data, override) {
    // merge animations, with overrides on each element to follow a specific animation
    // defaults to 1st existing entry if are any, otherwise set to 0
    // override is {dx: index, dy: index, dw: index, dh: index, dr: index}
    let frames = []
    for (const a of animation_data) {
        frames.push(Object.keys(a))
    }

    frames = [...new Set(frames)]
    let transformations = {}
    for (const frame of frames) {
        let dx = 0, dy = 0, dw = 0, dh = 0, dr = 0
        for (const a of animation_data) {
            if (a[frame].dx !== undefined) {
                dx += a[frame].dx
            }
            if (a[frame].dx !== undefined) {
                dy += a[frame].dy
            }
            if (a[frame].dw !== undefined) {
                dw += a[frame].dw
            }
            if (a[frame].dh !== undefined) {
                dh += a[frame].dh
            }
            if (a[frame].dr !== undefined) {
                dr += a[frame].dr
            }
        }
        if (animation_data[override.dx][frame].dx !== undefined) dx = animation_data[override.dx][frame].dx
        if (animation_data[override.dy][frame].dy !== undefined) dy = animation_data[override.dy][frame].dy
        if (animation_data[override.dw][frame].dw !== undefined) dw = animation_data[override.dw][frame].dw
        if (animation_data[override.dh][frame].dh !== undefined) dh = animation_data[override.dh][frame].dh
        if (animation_data[override.dr][frame].dr !== undefined) dr = animation_data[override.dr][frame].dr

        transformations[frame] = {
                dx: dx,
                dy: dy,
                dw: dw,
                dh: dh,
                dr: dr
            }
    }
    return transformations
}