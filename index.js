const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(cors())

app.use(express.static('dist'))

app.use(express.json())

morgan.token('post-response', function (req, res) { 
    return req.method === 'POST' 
        ? JSON.stringify(req.body) 
        : null 
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-response'))

let list = [
    {
      "name": "Arto Hellas",
      "number": "040-123457",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 3
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": 4
    },
    {
      "name": "Joppe",
      "number": "90000765",
      "id": 6
    },
    {
      "name": "Nöppis",
      "number": "0506059",
      "id": 7
    }
]

app.get('/info', (req, resp) => {
    const date = new Date()
    resp.send(`<p>There are ${list.length} persons.</p><p>${date}</p>`)
})

app.get('/api/persons', (req, resp) => resp.json(list))

app.get('/api/persons/:id', (req, resp) => {
    const id = Number(req.params.id)
    const person = list.find(p => p.id === id)
    if (person) {
        return resp.json(person)
    }
    else {
        return resp.status(404).end()
    }
})

app.delete('/api/persons/:id', (req, resp) => {
    const id = Number(req.params.id)
    const person = list.find(p => p.id === id)
    if (person) {
        list = list.filter(p => p.id !== id)
        resp.status(204).end()
    }
    else {
        resp.status(404).end()
    }
})

const generateId = () => {
    const maxId = Math.max(...list.map(p => p.id))
    const maxValue = 99999999
    let newId = Math.floor(Math.random() * (maxValue - maxId) + maxId)
    while (list.find(p => p.id == newId) !== undefined) {
        newId = Math.floor(Math.random() * (maxValue - maxId) + maxId)
    }
    return newId
}

app.post('/api/persons', (req, resp) => {
    const id = generateId()
    if (!req.body) {
        resp.status(404).json({ 'error': 'Invalid body' })
        return;
    }
    if (!req.body.name) {
        resp.status(404).json({ 'error': 'Name missing' })
        return;
    }
    if (!req.body.number) {
        resp.status(404).json({ 'error': 'Number missing' })
        return;
    }
    if (list.find(p => p.name === req.body.name) !== undefined) {
        resp.status(404).json({ 'error': 'Name exists' })
        return;
    }

    const newPerson = {
        id: id,
        name: req.body.name,
        number: req.body.number
    } 

    list = list.concat(newPerson)

    resp.json(newPerson)
})

const PORT = 3001
app.listen(PORT, () => { console.log(`Server is running port ${PORT}`) })
