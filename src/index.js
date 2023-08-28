import express from "express";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcrypt";

const app = express();

app.use(express.json());

const port = 7878;

const users = [];
const errands = [];

// ----------------------------- USERS --------------------------------

// Cadastrar usuário:

app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    const checkRegisteredEmail = users.find(user => user.email === email);

    if (checkRegisteredEmail) {
        return res.status(400).json({
            message: "Email de usuário já cadastrado."
        });
    };

    const hashedPassword = await bcrypt.hash(password, 8);

    const newUser = {
        id: uuidv4(),
        name,
        email,
        password: hashedPassword
    };

    users.push(newUser);

    res.status(201).json({
        message: "Usuário cadastrado com sucesso!",
        user: newUser
    });

});

// Listar usuários cadastrados:

app.get("/users", (req, res) => {
    if (users.length === 0) {
        return res.status(404).json({
            message: "Não foi localizado nenhum usuário cadastrado"
        });
    };

    res.status(200).json(users);
});

// Realizar login:

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    if (!email) {
        return res.status(404).json({
            message: "Necessário informar um email. O campo não deve estar vazio."
        });
    };
    
    if (!password) {
        return res.status(404).json({
            message: "Necessário informar sua senha."
        });
    };
    
    const findUser = users.find(user => user.email === email);
    
    if (!findUser) {
        return res.status(404).json({
            message: "Usuário não localizado"
        });
    };

    const passwordCompare = await bcrypt.compare(password, findUser.password);

    if (!passwordCompare) {
        return res.status(400).json({
            message: "Senha inválida."
        });
    };

    res.status(200).json({
        message: `Logado com sucesso. Bem vindo ${findUser.name}`,
        ID: findUser.id
    });

});

// Deletar usuário:

app.delete("/deleteUser/:userId", (req, res) => {
    const { userId } = req.params;

    const findUser = users.findIndex(user => user.id === userId);

    if (findUser === -1) {
        return res.status(404).json({
            message: "O id do usuário não foi localizado"
        });
    };

    const deleteUser = users.splice(findUser, 1);

    res.status(200).json({
        message: "Usuário excluido com sucesso."
    });
});

// ----------------------------- ERRANDS ---------------------------

// Criar recados:

app.post("/errands", (req, res) => {
    const { title, description, userId } = req.body;

    const findUser = users.find(user => user.id === userId);

    if (!findUser) {
        res.status(404).json({
            message: "Usuário não localizado."
        });
    };

    if (!title) {
        return res.status(404).json({
            message: "O título do recado deve ser informado."
        });
    };

    const newErrand = {
        id: uuidv4(),
        title,
        description,
        userId
    };

    errands.push(newErrand);

    res.status(201).json({
        message: "Recado criado com sucesso.",
        newErrand
    });

});

// Listar recados:

app.get("/list/:userId", (req, res) => {
    const { userId } = req.params;

    const findUser = users.find(user => user.id === userId);

    if (!findUser) {
        res.status(404).json({
            message: "Usuário não localizado."
        });
    };

    const userErrands = errands.filter(errand => errand.userId === userId);

    res.status(200).json(userErrands);
});

// Atualizar recados:

app.put("/update/:errandId", (req, res) => {
    const { errandId } = req.params;
    const { title, description } = req.body;

    const findErrand = errands.findIndex(errand => errand.id === errandId);

    if (findErrand === -1) {
        return res.status(404).json({
            message: "Id de recado informado não foi localizado."
        });
    };

    errands[findErrand].title = title;
    errands[findErrand].description = description;

    if (!title) {
        return res.status(404).json({
            message: "O campo título deve estar preenchido."
        });
    };

    res.status(200).json({
        message: "Recado atualizado com sucesso."
    });
});

// Deletar recado:

app.delete("/delete/:errandId", (req, res) => {
    const { errandId } = req.params;

    const findErrand = errands.findIndex(errand => errand.id === errandId);

    if (findErrand === -1) {
        return res.status(404).json({
            message: "Id de recado informado não foi localizado."
        });
    };

    const deleteErrands = errands.splice(findErrand, 1);

    res.status(200).json({
        message: "Recado excluído com sucesso."
    });
});

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));