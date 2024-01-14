require('dotenv').config()
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.DB_URL

mongoose.connect(url)
    .then(() => {
        console.log('Connected to mongo')
    })
    .catch(err => {
        console.log('error', err)
    })

const schema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 3 },
    number: {
        type: String, required: true, minlength: 8,
        validate: {
            validator: val => {
                return /^(\d{2}-\d{5,}|\d{3}-\d{4,})$/.test(val)
            },
            message: prop => `'${prop}' value is not valid Number.`
        }
    }
})

schema.set('toJSON', {
    transform: (doc, obj) => {
        obj.id = obj._id.toString()
        delete obj._id
        delete obj.__v
    }
})

module.exports = mongoose.model('Person', schema)
