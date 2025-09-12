const sox = module.exports = {}
sox.exec_path = 'sox.exe'

const exec = require('child_process').execSync
sox.run = (cmds) => {
    exec(`${sox.exec_path} ${cmds}`)
}

sox.len = (input) => {
    const output = exec(`${sox.exec_path} --i -D ${input}`).toString().trim()
    return parseFloat(output)
}
    