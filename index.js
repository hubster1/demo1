const express = require('express')
const morgan = require('morgan')
const Person = require('./models/Person')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

morgan.token('post-response', function (req) {
    return req.method === 'POST'
        ? JSON.stringify(req.body)
        : null
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-response'))

// let list = [
//     {
//       "name": "Arto Hellas",
//       "number": "040-123457",
//       "id": 1
//     },
//     {
//       "name": "Ada Lovelace",
//       "number": "39-44-5323523",
//       "id": 2
//     },
//     {
//       "name": "Dan Abramov",
//       "number": "12-43-234345",
//       "id": 3
//     },
//     {
//       "name": "Mary Poppendieck",
//       "number": "39-23-6423122",
//       "id": 4
//     },
//     {
//       "name": "Joppe",
//       "number": "90000765",
//       "id": 6
//     },
//     {
//       "name": "Nöppis",
//       "number": "0506059",
//       "id": 7
//     }
// ]

app.get('/info', (req, resp, next) => {
    const date = new Date()
    Person.estimatedDocumentCount({})
        .then(result => {
            resp.send(`<p>There are ${result} persons.</p><p>${date}</p>`)
        })
        .catch(err => {
            next(err)
            // console.log(err)
            // resp.status(500).json({ error: 'Get failed.' })
        })
})

app.get('/api/persons', (req, resp, next) => {
    Person.find({})
        .then(result => {
            resp.json(result)
        })
        .catch(err => {
            next(err)
            // console.log(err)
            // resp.status(500).json({ error: 'Get failed.' })
        })
    //resp.json(list)
})

app.get('/api/persons/:id', (req, resp, next) => {
    const id = req.params.id
    //const person = list.find(p => p.id === id)
    Person.findById(id)
        .then(result => {
            if (result) {
                return resp.json(result)
            }
            else {
                return resp.status(404).end()
            }
        })
        .catch(err => {
            next(err)
            // console.log(err)
            // resp.status(500).json({ error: 'Get single failed.' })
        })
})

app.delete('/api/persons/:id', (req, resp, next) => {
    const id = req.params.id
    //const person = list.find(p => p.id === id)
    Person.findByIdAndDelete(id)
        .then(result => {
            if (result) {
                resp.status(204).end()
            }
            else {
                resp.status(404).end()
            }
        })
        .catch(err => {
            next(err)
            // console.log(err)
            // resp.status(500).json({ error: 'Delete failed.' })
        })
})

// const generateId = () => {
//     const maxId = Math.max(...list.map(p => p.id))
//     const maxValue = 99999999
//     let newId = Math.floor(Math.random() * (maxValue - maxId) + maxId)
//     while (list.find(p => p.id == newId) !== undefined) {
//         newId = Math.floor(Math.random() * (maxValue - maxId) + maxId)
//     }
//     return newId
// }

app.put('/api/persons/:id', (req, resp, next) => {
    const id = req.params.id

    if (!req.body) {
        resp.status(400).json({ 'error': 'Invalid body' })
        return
    }
    if (!req.body.name) {
        resp.status(400).json({ 'error': 'Name missing' })
        return
    }
    if (!req.body.number) {
        resp.status(400).json({ 'error': 'Number missing' })
        return
    }
    const updated = {
        name: req.body.name,
        number: req.body.number
    }
    Person.findByIdAndUpdate(id, updated, { new: true, runValidators: true, context: 'query' })
        .then(result => {
            if (result) {
                resp.status(200).json(result)
            }
            else {
                resp.status(404).end()
            }
        })
        .catch(err => next(err))
})

app.post('/api/persons', (req, resp, next) => {
    //const id = generateId()
    if (!req.body) {
        resp.status(400).json({ 'error': 'Invalid body' })
        return
    }
    if (!req.body.name) {
        resp.status(400).json({ 'error': 'Name missing' })
        return
    }
    if (!req.body.number) {
        resp.status(400).json({ 'error': 'Number missing' })
        return
    }
    // Person.find({ name: req.body.name })
    // if (list.find(p => p.name === req.body.name) !== undefined) {
    //     resp.status(404).json({ 'error': 'Name exists' })
    //     return;
    // }

    const newPerson = {
        name: req.body.name,
        number: req.body.number
    }

    const model = new Person(newPerson)
    model.save()
        .then(result => {
            console.log('Saved', result)
            resp.status(201).json(result)
        })
        .catch(err => {
            next(err)
            // console.log(err)
            // resp.status(500).json({ error: 'Save failed.' })
        })

    //list = list.concat(newPerson)
})

app.use((err, req, resp) => {
    console.log(err)

    if (err.name === 'CastError') {
        resp.status(400).json({ error: 'Malformed parameter' })
    }
    else if (err.name === 'ValidationError') {
        resp.status(400).json({ error: err.message })
    }
    else {
        resp.status(500).end()
    }
    //next(err)
})

const PORT = process.env.PORT
app.listen(PORT, () => { console.log(`Server is running port ${PORT}`) })
