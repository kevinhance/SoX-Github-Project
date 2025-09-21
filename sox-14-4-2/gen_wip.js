
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
    // see if arg[2] is an integer or a filename
    let arg2 = parseInt(process.argv[2]) // TODO lmaooo it parsed "75c1.wav" as arg[2] being an integer argument LMAOOOOO need to alter parseInt??
    if(isNaN(arg2)){
        //if this is true, we are looking at no repeat # input
        console.log("SET LOOPS")
        if(arg_len == 3){
            node_cmd = "node ./mixer_set.js " + process.argv[2]
        } else if(arg_len == 4){
            node_cmd = "node ./mixer_set.js " + process.argv[2] + " " + process.argv[3]
        } else if (arg_len > 4){
            // just do normal random loops, leace node_cmd unchanged
        }
    } else {
        //if we enter this else, arg2 now holds an int parsed from arg[2], which is the # of times to repeat
        repeat = arg2
        node_cmd = "node ./mixer_set.js"
        if(arg_len == 4){
            node_cmd = "node ./mixer_set.js " + process.argv[3]
        } else if(arg_len == 5){
            node_cmd = "node ./mixer_set.js " + process.argv[3] + " " + process.argv[4]
        } else if (arg_len > 5){
            // just do normal random loops, leave node_cmd unchanged
        }
    }
    
    /*
    if(arg_len == 3){

        //see if first input is integer or not
    }
    console.log("SET LOOPS")
    if(arg_len == 4){
        node_cmd = "node ./mixer_set.js " + process.argv[3]
    } else if(arg_len == 5){
        node_cmd = "node ./mixer_set.js " + process.argv[3] + " " + process.argv[4]
    } else if (arg_len > 5){
        // just do normal random loops, leace node_cmd unchanged
    }
        */
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
