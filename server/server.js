const PORT = process.env.PORT || 8000;
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const app = express();
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
    console.log('in homepage')
}); 

//get todos
app.get('/todos/:userEmail', async (req, res) => {
    
    const { userEmail } = req.params
    console.log(userEmail)
    try {
      const todos =  await pool.query('SELECT * FROM todos WHERE user_email = $1',[userEmail]);
      res.json(todos.rows);
    }
    catch(error) {
        console.error(error);
    }
})

//create a todo
app.post('/todos', async (req,res) => {

    const { user_email, title, progress, date } = req.body;
    console.log(user_email, title, progress, date);
    const id = uuidv4();
    try{
        const newTodo = await pool.query('INSERT INTO todos (id, user_email, title, progress, date) VALUES($1, $2, $3, $4, $5) ',
            [id, user_email, title, progress, date]
        )
        res.json(newTodo);
    }
    catch(error){
        console.error(error)
    }
})

//update a todo
app.put('/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { title, progress, date } = req.body;
    try{
        const updateTodo = await pool.query('UPDATE todos SET title = $1, progress = $2, date = $3 WHERE id = $4',
            [title, progress, date, id]
        )
        res.json(updateTodo);
    }
    catch(error){
        console.error(error)
    }
})

//delete a todo
app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;
    try{
        const deleteTodo = await pool.query('DELETE FROM todos WHERE id = $1',
            [id]
        )
        res.json(deleteTodo);
    }
    catch(error){
        console.error(error)
    }
}) 

//sign up 
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    try{
        const newUser = await pool.query('INSERT INTO users (email, hashed_password) VALUES($1, $2) ',
            [email, hashedPassword]
        )
        const token = jwt.sign({ email}, 'secret', {expiresIn: '1hr'})    

        res.json({email, token})
    }
    catch(error){
        console.error(error)
    }
});

//login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try{
        const user = await pool.query('SELECT * FROM users WHERE email = $1',
            [email]
        )
        if(user.rows.length === 0){
            res.status(401).json({detail: 'User not found'})
        }
        else{
            const hashedPassword = user.rows[0].hashed_password;
            if(bcrypt.compareSync(password, hashedPassword)){
                const token = jwt.sign({ email}, 'secret', {expiresIn: '1hr'})    
                res.json({email, token})
            }
            else{
                res.status(401).json({detail: 'Incorrect password'})
            }
        }
    }
    catch(error){
        console.error(error)
    }
});


app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    });