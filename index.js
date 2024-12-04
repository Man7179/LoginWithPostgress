const express = require("express")
const app = express();
const Joi = require("joi")


const bodyParser = require("body-parser")
const dotenv = require('dotenv')

// const conn=require("./db.js")
const { Client } = require("pg")

const conn = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "root",
    database: "LoginDB"

})

dotenv.config();

app.use(bodyParser.json())


app.get('/', (req, res) => {
    res.send("HELLO")
})

conn.connect().then((
    console.log("CONNECTED TO DB")
))




//APPLYING VALIDATION RULES

const UserSchema = Joi.object({
    name: Joi.string().min(3).max(25).required().messages(),
    email: Joi.string().email().required().messages(),
    password: Joi.string().min(6).max(45).required().messages()
})

const UserUpdateSchema = Joi.object({

    name: Joi.string().min(3).max(25).required().messages({}),
    password: Joi.string().min(6).max(45).required().messages() 

})


// Create new user
app.post("/register", (req, res) => {
    const { email, name, password } = req.body;

    const { error } = UserSchema.validate({ email, name, password });

    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        })
    }
    if (!email || !name || !password) {
        res.status(400).json({ error: "All Fields are Required" });
    }
    const insert_query = `INSERT INTO users(name,email,password) VALUES ($1,$2,$3)`;
    conn.query(insert_query, [name, email, password], (err, result) => {
        if (!err) {
            console.log(result);
            res.status(201).json({
                message: "User registered successfully"
            });
        } else {
            res.send(err)
        }
    });
});


//Get User by their Name
app.get('/user/:name', (req, res) => {
    const { name } = req.params;

    const getUser_query = `SELECT * FROM users WHERE name=$1`;

    conn.query(getUser_query, [name], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error retrieving user");
        }

        if (result.rows.length === 0) {
            return res.status(404).send("User not found");
        }

        res.status(200).json(result.rows[0]);
    })
})


// upadate user
app.put('/updateUser/:id', (req, res) => {
    const { id } = req.params;
    const { name, password } = req.body;

    const { error } = UserUpdateSchema.validate({ name, password });

    if (error) {
         
        return res.status(400).json({
            error: error.details[0].message,
        });
    }
    const updateUser_query = `UPDATE users SET name=$1,password=$2 WHERE id=$3`;
    conn.query(updateUser_query, [name, password, id], (err, result) => {
        if (err) {
            res.send(err)
        } else {
            console.log(result);
            // res.status(200).json(result.rows[0]);
            res.send("User Updated");
        }
    })
})




// Delete User
app.delete('/user/:id', (req, res) => {
    const { id } = req.params;

    const delete_query = `DELETE FROM users WHERE id=$1`;

    conn.query(delete_query, [id], (err, result) => {
        if (!err) {
            console.log(result);
            res.status(200).send("User deleted successfully");
        } else {
            console.error(err);
            res.status(500).send("Error deleting user");
        }
    });
});




app.listen(3000, () => {
    console.log("CONNECTED TO SERVER")
})