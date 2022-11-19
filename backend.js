//console.log ("Hello, Node")
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = express()

app.use(express.json())
app.use(cors())

const Filme = mongoose.model("Filme", mongoose.Schema({
    titulo: {
        type: String
    },
    sinopse: {
        type: String
    }
}))

const usuarioSchema = mongoose.Schema({
    login: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})
usuarioSchema.plugin(uniqueValidator)
const Usuario = mongoose.model("Usuario", usuarioSchema)

async function conectarAoMongoDB() {
    await mongoose.connect(
        `mongodb+srv://new_user_aula:9090@cluster0.rhbjnsa.mongodb.net/?retryWrites=true&w=majority`
    )
}

//escutar uma requisição get na URL http://localhost:3000/oi
app.get('/oi', (req, res) => {
    res.send('oi')
})

//endpoint para obter a lista de filmes
app.get('/filmes', async (req, res) => {
    const filmes = await Filme.find()
    res.json(filmes)
})

app.post('/filmes', async (req, res) => {
    //capturar os dados da requisição so usuario
    const titulo = req.body.titulo
    const sinopse = req.body.sinopse
    // monnta um objeto agrupando os dados. Ele representa um novo filme a seguir,
    // construímos um objeto Filme a partir do modelo do mongoose
    const filme = new Filme({titulo: titulo, sinopse: sinopse})
    //save salva o novo filme na base gerenciada pelo MongoDB
    await filme.save()
    const filmes = await Filme.find()
    // monta um objeto com informações capturadas filmes.push(filme) responde ao
    // cliente com a lista nova
    res.json(filmes)
})

app.post('/signup', async (req, res) => {
        try {
            const login = req.body.login
            const password = req.body.password

            const criptografada = await bcrypt.hash(password, 15)
            const usuario = new Usuario({login: login, password: criptografada})
            const respMongo = await usuario.save()
            console.log(respMongo)
            res.status(201).end()
        } catch (error) {
            console.log(error)
            res.status(409).end()
        }
    })
    app.post('/login', async(req, res) => {
        const login = req.body.login
        const password = req.body.password
        const usuario = await Usuario.findOne({login: login})
        if (!usuario){
            return res.status(401).json({mensagem: "usuario não encontrado"})
        }
        const senhaValida = await bcrypt.compare(password, usuario.password)
        if (!senhaValida) {
            return res.status(403).json({mensagem: "senha inválida"})
        }
        const token = jwt.sign(
            {login: login},
            'chave_secreta',
            {expiresIn: '1h'}  
        )
        res.status(200).json({token: token})
    })
    app.listen(3000, () => {
        try {
            conectarAoMongoDB()
            console.log("up & running")
        } catch (e) {
            console.log('Erro', e)
        }
    })