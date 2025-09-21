
const exec = require('child_process').execSync
const move = require('fs').renameSync
let repeat = 100
const crypto = require('crypto')
const reader = require('fs').readFileSync
const hash_file = (loop) => {
const contents = reader(loop)
const hash = crypto.createHash('md5').update(contents).digest('hex')
let node_cmd = "node ./mixer_set.js"
return `${hash}.wav`
}
arg_len = process.argv.length // TODO somethhing goin on when 1st filename arg is in quotes cause of spaces
if (arg_len > 2){
    //if this is true, we are looking at no repeat # input
    
    if(arg_len == 3){
        let file1 = "\"" + process.argv[2] + "\""
        console.log("SET 1 of 2 Loops, filename: " + file1)
        node_cmd = "node ./mixer_set.js " + file1
    } else if(arg_len == 4){
        let file1 = "\"" + process.argv[2] + "\""
        let file2 = "\"" + process.argv[3] + "\""
        console.log("SET 2 of 2 Loops, filenames: " + file1 + " and " + file2)
        node_cmd = "node ./mixer_set.js " + file1 + " " + file2
    } else if (arg_len > 4){
         console.log("Too many arguments--  not sure what you want me to do, boss.")
         console.log("Doing it normal-style (both random loops)")
        // just do normal random loops, leace node_cmd unchanged
    }

} else {
    node_cmd = "node ./mixer_set.js"
}

console.log("NODE CMD: " + node_cmd) // TODO okay so it all seems to go thru but in mixer
for (let i=1; i <= repeat; i++){
    console.log(`Generating ${i} of ${repeat}`)
    exec(node_cmd)
    // Pay attention to the new feature here:
    const file_name = hash_file('./output/mix.wav')
    move(`./output/mix.wav`, `./genoutput/lmnoutput_${file_name}`) 

}
