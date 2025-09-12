const readdir = require('fs').readdirSync
const path = require('path')
const files = readdir("./input").filter(f => f.match(".wav"))
const select = () => {
    const file = files[Math.round(Math.random() * (files.length-1))]
    return path.join("./input", file)
}
let loop1 = select()
let loop2 = select()
while(loop1 === loop2){
    loop2 = select()
}
const len = require('./sox').len
const len1 = len(loop1)
const len2 = len(loop2)
const ratio = len2 / len1
const sox = require('./sox').run
sox(`${loop2} ./output/mix.wav speed ${ratio}`)
loop2 = './output/mix.wav'

const avg_len = (len1 + len2) / 2
const avg_ratio = len1 / avg_len
const next_file = () => {
    next_file.seq++
    return `tmp${next_file.seq}.wav`
}
next_file.seq = 0
const extract_segment = (loop, desired_segments, total_segments) => {
    const new_loop = next_file()
    const segment_len = len(loop) / total_segments
    const new_loop_len = segment_len * desired_segments
    console.log(`extracting ${desired_segments} segments from ${loop}`)
    sox(`${loop} ${new_loop} trim 0 ${new_loop_len}`)
    return new_loop
}

loop1 = extract_segment(loop1, 1, 4)
loop2 = extract_segment(loop2, 1, 4)

const flip = (force=null) => {
    if(force === true || force === false){
        return force
    }
    return Math.round(Math.random()) ? true : false
}

// sometimes reverse loop1:
if(flip()){
    const tmp = next_file()
    sox(`${loop1} ${tmp} reverse`)
    loop1 = tmp
}
// sometimes reverse loop2:
if(flip()){
    const tmp = next_file()
    sox(`${loop2} ${tmp} reverse`)
    loop2 = tmp
}

const maybe_add_fx = (loop, fx) => {
    // not this time?
    if(!flip()){
        // just return original loop
        return loop
    }
    // let's do it then
    const tmp = next_file()
    console.log(`applying ${fx} to ${loop}`)
    sox(`${loop} ${tmp} ${fx}`)
    // return modified loop
    return tmp
}

const fx_list = ['reverse','reverb','flanger','oops','reverse','reverb','flanger','oops','overdrive gain -15','lowpass 4000','pitch -10','pitch 10','tremolo 4','highpass 2700','highpass 4500','highpass 9000']
for(const fx of fx_list){
    loop1 = maybe_add_fx(loop1, fx)
    loop2 = maybe_add_fx(loop2, fx)
}

const fill_by_repeating = (loop, orig_len) => {
    const new_loop = next_file()
    const times = Math.round((orig_len / len(loop)) - 1)
    console.log(`filling ${loop} by repeating x${times}`)
    sox(`${loop} ${new_loop} repeat ${times}`)
    return new_loop
}

const fill_by_resizing = (loop, orig_len) => {
    const new_loop = next_file()
    const ratio = len(loop) / orig_len
    console.log(`filling ${loop} by resizing`)
    sox(`${loop} ${new_loop} speed ${ratio}`)
    return new_loop
}

const maybe_fragment = (loop) => {
    if(!flip()){
        return loop
    }
    const orig_len = len(loop)
    const segments = flip() ? 1 : 2
    const segment = extract_segment(loop, segments, 4)
    const filler = flip() ? fill_by_repeating : fill_by_resizing
    return filler(segment, orig_len)
}
loop1 = maybe_fragment(loop1)
loop2 = maybe_fragment(loop2)
console.log(len(loop1))
console.log(len(loop2))

if(flip()){
    // loops have changed a lot so let's get the new length
    const new_len = len(loop1)
    let tmp = next_file()
    // apply fade IN to loop1
    sox(`${loop1} ${tmp} fade ${new_len/2} ${new_len} 0`)
    loop1 = tmp
    // apply fade OUT to loop2
    tmp = next_file()
    sox(`${loop2} ${tmp} fade 0 ${new_len} ${new_len/2}`)
    loop2 = tmp
}
// 
sox(`--combine mix-power ${loop1} ${loop2} mix.wav gain 8 repeat 3`)


    
    