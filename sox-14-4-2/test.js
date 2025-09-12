const sox = require('./sox').run
sox('./input/sample-15.wav ./output/test_sox.wav flanger reverse reverb')

const {len} = require('./sox')
console.log(len('./input/sample-19.wav'))
