import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcrypt'

const app = express()
const porta = 3000

const users = []
const tasks = []

app.use(express.json())

app.post("/createUser", async (request, response) => {
    const { name, email, pass } = request.body

    const emailExistente = users.find(user => user.email === email)

    if (emailExistente) {
        return response.status(400).json({
            message: 'email ja existe no cadastro'
        })
    }
    const passEncripted = await bcrypt.hash(pass, 9)

    const newUser = {
        id: uuidv4(),
        name,
        email,
        pass: passEncripted
    }

    users.push(newUser)
    response.status(201).json({
        message: 'usuario cadastrado', newUser
    })
})

app.post("/loginUser", async (request, response) => {
    const { email, pass } = request.body

    const user = users.find(user => user.email === email)

    if (!user) {
        return response.status(404).json({
            message: 'usuario nao localizado'
        })
    }

    const passIdent = await bcrypt.compare(pass, user.pass)

    if (!passIdent) {
        return response.status(400).json({
            message: 'informacoes nao sao validas'
        })
    }

    response.status(200).json({
        message: 'usuario logado', id: user.id
    })
})

app.get("/listUsers", (request, response) => {
    response.status(200).json(users);
});

app.post("/createTask", (request, response) => {
    const { title, description, userId} = request.body
    const user = users.find(user => user.id === userId)

    if(!user){
        response.status(404).json({
            message: 'usuario nao cadastrado'
        })
    }

    const newTask = {
        id: uuidv4(),
        title, 
        description,
        userId
    }
    tasks.push(newTask)

    response.status(201).json({
        messsage: 'tarefa cadastrada', task: newTask
    })

})

app.get("/listTask/:userId", (request, response) => {

    const { userId } = request.params

    const user = users.find(user => user.id === userId)

    if(!user){
        response.status(404).json({
            message: "usuario nao encontrado"
        })
    }

    const filtred = tasks.filter(task => task.userId === userId)

    response.status(200).json({
     filtred
    })
});

app.put("/updateTask/:id", (request, response) => {
    const { id } = request.params
    const {title, description } = request.body
    const task = tasks.find(task => task.id === id)

    if(!task){
        response.status(404).json({
            message: "mensagem nao localizada"
        })
    }

    task.title = title || task.title;
    task.description = description || task.description;

    response.status(200).json({
        message: "tarefa atualizada ",
        updateTask: task
    })
    
})

app.delete("/deleteTask/:id", (request, response) => {
    const { id } = request.params
    const deleted = tasks.findIndex(task => tasks.id === id)

    if(!deleted === -1){
        return response.status(404).json({
            message:"id nao localizado"
        })
    }
    tasks.splice(deleted, 1)
    response.status(200).json({
        message: "tarefa deletada", deleted
    })
})



app.listen(porta, () => { console.log(`servidor iniciado na porta ${porta}`) })