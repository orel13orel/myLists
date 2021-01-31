const express =require('express');
const app=express();

const {mongoose}=require('./db/mongoose');

const bodyParser=require('body-parser');

//load models
const { List, Task, User} = require('./db/models');
// const {List}= require('./db/models/list.model');
// const {Task}= require('./db/models/task.model');

//load middleware
app.use(bodyParser.json());

//CORS headers middleware
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");
    next();
});

// routes handlers

//list routes

//get all lists
app.get('/lists',(req,res)=>{
    List.find({}).then((lists)=>{
        res.send(lists);
    }).catch((e)=>{
        res.send(e);
    })

})

//creat a new list and return it back (including the id)
app.post('/lists',(req,res)=>{
    let title=req.body.title;

    let newList= new List({
        title
    });

    newList.save().then((listDoc)=>{
        res.send(listDoc);
    })
})

//update a specific (by ID)list
app.patch('/lists/:id',(req,res)=>{
    List.findOneAndUpdate({_id: req.params.id }, {
        $set: req.body
    }).then(()=>{
        res.sendStatus(200);
    });
})

//delete a specific list (by id)
app.delete('/lists/:id',(req,res)=>{
   List.findByIdAndRemove({_id: req.params.id}).then(
       (removedDoc)=>{res.send(removedDoc);}
   )
})

//get all tasks in a specific list (by list id)
app.get('/lists/:listId/tasks', (req, res)=>{
Task.find({_listId: req.params.listId}).then(
    (tasks)=>{res.send(tasks);
    })
});

// //get one task in a specific list (by list and task IDs)
// app.get('/lists/:listId/tasks/:taskId', (req,res)=>{
// Task.findOne({
//     _id: req.params.taskId,
//     _listId: req.params.listId
// }).then((task)=>{
//     res.send(task);
// })
// });

//create new task in a specific list (by list id)
app.post('/lists/:listId/tasks', (req, res)=>{
    let newTask = new Task({
        title: req.body.title,
        _listId: req.params.listId
    });

    newTask.save().then((newTaskDoc)=>{
        res.send(newTaskDoc);
    })    
    });

    //update an existing task (by task and list IDs)
    app.patch('/lists/:listId/tasks/:taskId', (req,res)=>{
        Task.findOneAndUpdate({
            _id: req.params.taskId,
            _listId: req.params.listId
        },{
            $set: req.body
        }).then(()=>{
            res.send({massage: 'updated successfully'});
        })
    });

    //delete an existing task (by task and list IDs)
    app.delete('/lists/:listId/tasks/:taskId', (req,res)=>{
        Task.findOneAndRemove({
            _id: req.params.taskId,
            _listId: req.params.listId
        }).then(
            (removedDoc)=>{res.send(removedDoc);
            })
        });


// user routes

// user sign up
app.post('/users',(req,res)=>{
    let body = rec.body;
    let newUser = new User(body);
    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        //session created sucssfully. generating an access auth token for the user:
        return newUser.generateAccessAuthToken().then((accessToken) => {
            return {accessToken, refreshToken};
        });
    }).then((authToken) => {
        res
            .header('x-refresh-token', authToken.refreshToken)
            .header('x-access-token', authToken.accessToken)
            .send(newUser);
    }).catch((e)=>{
        res.status(400).send(e);
    })
})

//user login
app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            //session created sucssfully. generating an access auth token for the user:
            return user.generateAccessAuthToken().then((accessToken) => {
                return { accessToken, refreshToken }
            });
        }).then((authTokens) => {
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
})

app.listen(3000,()=>{
    console.log('server is on port 3000');
})
