require('dotenv').config()
const mongoose = require('mongoose')

const args = process.argv
let pass = ''
console.log("args", args)
console.log("env", process.env)
console.log('uri', process.env.MONGOURI)

if (!process.env.MONGOURI && args.length < 3) {
    console.log('no password')
    process.exit(1)
    return
}
else if (!process.env.MONGOURI) {
    pass = args[2]
}

const url = process.env.MONGOURI || `mongodb+srv://demo1-user:${pass}@cluster0.nmxeydj.mongodb.net/demo1?retryWrites=true&w=majority`

mongoose.connect(url)

const schema = new mongoose.Schema({
    name: String, number: String
})

const model = mongoose.model('Person', schema)

if (args.length === 3) {
    model.find({})
        .then(result => {
            console.log('Phonebook:')
            result.forEach(p => console.log(`${p.name} ${p.number}`))
            mongoose.connection.close()
        })
}
else if (args.length === 5) {
    const person = new model({
        name: args[3], number: args[4]
    })
    person.save()
        .then(result => {
            console.log(`Added ${result.name} with number ${result.number} to phonebook`)
            mongoose.connection.close()
        })
}
else {
    console.log('not enough arguments')
    mongoose.connection.close()
    process.exit(1)
}
