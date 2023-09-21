import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const cors = require('cors');

app.use(cors())

const app = express();
const porta = 3333;

const users = [];
const tasks = [];

app.use(express.json());

app.post("/createUser", async (request, response) => {
    const { name, email, pass } = request.body;

    const emailExistente = users.find(user => user.email === email);

    if (emailExistente) {
        return response.status(400).json({
            message: 'Email já existe no cadastro'
        });
    }

    const passEncripted = await bcrypt.hash(pass, 9);

    const newUser = {
        id: uuidv4(),
        name,
        email,
        pass: passEncripted
    };

    users.push(newUser);
    response.status(201).json({
        message: 'Usuário cadastrado',
        newUser
    });
});

app.post("/loginUser", async (request, response) => {
    const { email, pass } = request.body;

    const user = users.find(user => user.email === email);

    if (!user) {
        return response.status(404).json({
            message: 'Usuário não localizado'
        });
    }

    const passIdent = await bcrypt.compare(pass, user.pass);

    if (!passIdent) {
        return response.status(400).json({
            message: 'Informações não são válidas'
        });
    }

    response.status(200).json({
        message: 'Usuário logado',
        id: user.id
    });
});

app.get("/listUsers", (request, response) => {
    response.status(200).json(users);
});

app.post("/createTask", (request, response) => {
    const { title, description, userId } = request.body;
    const user = users.find(user => user.id === userId);

    if (!user) {
        return response.status(404).json({
            message: 'Usuário não cadastrado'
        });
    }

    const newTask = {
        id: uuidv4(),
        title,
        description,
        userId
    };
    tasks.push(newTask);

    response.status(201).json({
        message: 'Tarefa cadastrada',
        task: newTask
    });
});

app.get("/listTasks/:userId/:page", (request, response) => {
    const { userId, page } = request.params;
    const pageNumber = parseInt(page) || 1;
    const pageSize = 4;

    const user = users.find(user => user.id === userId);

    if (!user) {
        return response.status(404).json({
            message: "Usuário não encontrado"
        });
    }

    const userTasks = tasks.filter(task => task.userId === userId);

    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedTasks = userTasks.slice(startIndex, endIndex);

    if (paginatedTasks.length === 0) {
        return response.status(404).json({
            message: "Nenhuma tarefa localizada para esta página"
        });
    }

    response.status(200).json({
        message: "Tarefas encontradas",
        currentPage: pageNumber,
        totalPages: Math.ceil(userTasks.length / pageSize),
        tasks: paginatedTasks
    });
});

app.put("/updateTask/:id", (request, response) => {
    const { id } = request.params;
    const { title, description } = request.body;
    const task = tasks.find(task => task.id === id);

    if (!task) {
        response.status(404).json({
            message: "Tarefa não localizada"
        });
    }

    task.title = title || task.title;
    task.description = description || task.description;

    response.status(200).json({
        message: "Tarefa atualizada",
        updatedTask: task
    });
});

app.delete("/deleteTask/:id", (request, response) => {
    const { id } = request.params;
    const deletedIndex = tasks.findIndex(task => task.id === id);

    if (deletedIndex === -1) {
        return response.status(404).json({
            message: "ID não encontrado"
        });
    }

    tasks.splice(deletedIndex, 1);

    response.status(200).json({
        message: "Tarefa deletada",
        deletedId: id
    });
});

app.listen(porta, () => {
    console.log(`Servidor iniciado na porta ${porta}`);
});
