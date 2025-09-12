
const exec = require('child_process').execSync
const move = require('fs').renameSync
const repeat = parseInt(process.argv[2]) || 100
const crypto = require('crypto')
const reader = require('fs').readFileSync
const hash_file = (loop) => {
const contents = reader(loop)
const hash = crypto.createHash('md5').update(contents).digest('hex')
return `${hash}.wav`
}
for(let i=1; i <= repeat; i++){

    console.log(`Generating ${i} of ${repeat}`)
    exec("node ./mixer.js")
    // Pay attention to the new feature here:
    const file_name = hash_file('./output/mix.wav')
    move(`./output/mix.wav`, `./genoutput/${file_name}`) 

}
