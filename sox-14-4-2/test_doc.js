const exists = require('fs').existsSync
for(let i=1; i<=31; i++){
const file = `./input/sample-${i}.wav`
if(!exists(file)){
    console.error(`Missing file: ${file}`)
    process.exit(1)
}
}
console.log("We are ready to go!")