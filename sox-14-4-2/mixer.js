const readdir = require('fs').readdirSync
const sox = require('./sox').run
const path = require('path')
const files = readdir("./input").filter(f => f.match(".wav"))
const select = () => {
    const file = files[Math.round(Math.random() * (files.length-1))]
    return path.join("\"./input", file + "\"")
}
// select 2 loops from input files, 
let loop1 = select()
let loop2 = select()
// make sure theyre not the same file
while(loop1 === loop2){
    loop2 = select()
}

// get the lengths of the two loops, and the ratio of length 2 over length 1
const len = require('./sox').len
const len1 = len(loop1)
const len2 = len(loop2)
const ratio = len2 / len1
console.log(`len1 is ${len1}, len2 is ${len2}, ratio is ${ratio}.`)

//sox input.wav -r 8000 -c 1 output.wav

sox(`${loop2} ./output/temp2.wav speed ${ratio}`)// is this not just speeding the faster sample up more? idk
sox(`${loop1} ./output/temp1.wav speed 1`)
loop2 = './output/temp2.wav'
//maybe_add_fx(loop2)
// WHY IS LOOP1 AND LOOP2 DA SAME TODO
sox(`${loop1} -r 44100 -c 2 ./output/temp3.wav`)
sox(`${loop2} -r 44100 -c 2 ./output/temp4.wav`)
loop1 = './output/temp3.wav'
loop2 = './output/temp4.wav'


//sox(`-m ${loop1} ${loop2} ./output/mixog.wav`) 

const avg_len = (len1 + len2) / 2
const avg_ratio = len1 / avg_len
//console.log(`avg_length is ${avg_len}.`)
//sox(`-m ${loop1} ${loop2} ./output/mixed.wav speed ${avg_ratio}`)
// UP TILL NOW, I THINK EVERYTHING WORKS!! :)))

const next_file = () => {
    next_file.seq++
    console.log(`./output/tmp${next_file.seq}.wav`)
    return `./output/tmp${next_file.seq}.wav` // Needed to add ./output/ so it goes in the correct folder
}
next_file.seq = 0

const extract_segment = (loop, desired_segments, total_segments) => {
    const new_loop = next_file()
    const segment_len = len(loop) / total_segments
    const new_loop_len = segment_len * desired_segments
    console.log(`extracting ${desired_segments} segments from ${loop}. seg len: ${segment_len}, new loop len: ${new_loop_len}`)
    sox(`${loop} ${new_loop} trim 0 ${new_loop_len}`)
    return new_loop
}


//loop1 = extract_segment(loop1, 1, 4) // okay so this seems to work as expected
//loop2 = extract_segment(loop2, 1, 4)

const flip = (force=null) => {
    if(force === true || force === false){
        return force
    }
    return Math.round(Math.random()) ? true : false
    
}

// sometimes reverse loop1:
/*if(flip()){
    const tmp = next_file()
    sox(`${loop1} ${tmp} reverse`)
    loop1 = tmp
}
// sometimes reverse loop2:
if(flip()){
    const tmp = next_file()
    sox(`${loop2} ${tmp} reverse`)
    loop2 = tmp
}*/

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

// declarations
const fx_list = ['reverb','pitch 500','flanger 15 5 +12 80 4.4 triangle 45 quadratic','oops','highpass 2000','tremolo 15 0.5','overdrive 35 90 gain -15', `echo 1.0 1.0 ${avg_len} 0.4`]


// 'reverse','reverb','flanger','oops','reverse','reverb','flanger','oops','highpass 3000','highpass 7000','highpass 4000' //
 
const fill_by_repeating = (loop, orig_len) => { S
    const new_loop = next_file()
    const times = Math.round(((orig_len * 4) / len(loop)) - 1)
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
    const filler = fill_by_repeating //flip() ? fill_by_repeating : fill_by_resizing // <- this is cool template for a quick if stmt but i want to force repeating for now
    return filler(segment, orig_len)
}

const shuffle_array = (num_frags) => {
    let matches = []
    let avail_nums = []
    // fill avail_nums with its indicies
    for (i = 0; i < num_frags; i++){
        avail_nums[i] = i
    }
    //
    for (i = 0; i < num_frags; i++){
        // add a 2-element array to matches w (i, random number) and we wont have repeats of either component if it works
        random_index = Math.floor(Math.random() * avail_nums.length)
        matches[i] = avail_nums[random_index]
        /*match_i = matches[i]
        match_ic1 = match_i[1]
        if (match_ic1 == undefined){

        }*/
        // remove that element from avail_nums so we dont get it again
        avail_nums.splice(random_index, 1);
        
    }
    // TODO why are we getting undefined? probably cause we dont recheck if element is not there
    return matches
}

const shuffle_loop = (loop, num_frags) => {
    if (num_frags < 2){
        return
    }
    // first get loop length, and find length of frag
    const loop_len = len(loop)
    const frag_len = loop_len / num_frags
    // fill arr of frags divided based on length of frag
    let frag_arr = []
    for (i = 0; i < num_frags; i++){
        frags_left = (num_frags - i)
        // grab first fragment of remaining segment
        frag_arr[i] = extract_segment(loop, 1, frags_left)
        // set loop to now be what it was without the first frag (most recently added too arr)
        new_loop = next_file()
        rem_loop_len = frag_len * frags_left
        sox(`${loop} ${new_loop} trim ${frag_len} ${rem_loop_len}`)
        //extract_segment(loop, (num_frags - frags_left), frags_left)
        loop = new_loop
    }
    console.log('frag_arr: ')
    console.log(frag_arr)
    
    // concatenate them in the order dictated by the shuffle array
    const shuf_arr = shuffle_array(num_frags)
    console.log(shuf_arr)
    let tmp = next_file()
    sox(`${frag_arr[shuf_arr[0]]} ${frag_arr[shuf_arr[1]]} ${tmp}`)
    for (i = 2; i < num_frags; i++){
        let next_tmp = next_file()
        sox(`${tmp} ${frag_arr[shuf_arr[i]]} ${next_tmp}`)
        tmp = next_tmp
        // i think this should do it
        // "last 2 positions not reached" hmmmm
    }
    return tmp

    /*sox(`${frag_arr[0]} ${frag_arr[1]} ${tmp}`)
    for (i = 2; i < num_frags; i++){
        let next_tmp = next_file()
        sox(`${tmp} ${frag_arr[i]} ${next_tmp}`)
        tmp = next_tmp
        // i think this should do it
        // "last 2 positions not reached" hmmmm
    }
    return tmp*/

}

// end declarations

loop1 = shuffle_loop(loop1, 8)
loop2 = shuffle_loop(loop2, 4)

for(const fx of fx_list){
    loop1 = maybe_add_fx(loop1, fx)
    loop2 = maybe_add_fx(loop2, fx)
} //this works rn, commenting out for simplicity

loop1 = shuffle_loop(loop1, 4)
loop2 = shuffle_loop(loop2, 4)

//loop1 = maybe_fragment(loop1)
//loop2 = maybe_fragment(loop2)

//up till here, things are working. we are getting our 2 loops





//console.log(len(loop1))
//console.log(len(loop2))

/*if(flip()){
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
}*/

sox(`-m ${loop1} ${loop2} ./output/mix.wav repeat 3`)

/*if(flip()){
    sox(`-m ${loop1} ${loop2} ./output/mix.wav`) // removed  gain 8 repeat 3
} else {
    sox(`-m -v 1 ${loop1} -v 1 ${loop2} ./output/mix.wav`) // change the josh or stick to it, just testing shit (removed gain 8 repeat 3)
}
    // we mix the loops using the chosen mode, increase gain by 8 an
*/

/*
    what if I made a simple UI with Max? we do something where you can
    - select input, output, and genoutput paths (or just genoutput if u want preloaded sounds)
    - checkboxes for which effects u want
    - choose from different mix methods that I make
    - how many u want it to make? (max a tousand maybe, idk. definitely have a hard maximum and keep track of total file size as u go maybeeee?)
    - nice cool UI for it so they dont need to futz w the commandline
*/