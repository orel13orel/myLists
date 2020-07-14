const express =require('express');
const app=express();

const {mongoose}=require('./db/mongoose');

const bodyParser=require('body-parser');

//load models
const { List, Task} = require('./db/models');
// const {List}= require('./db/models/list.model');
// const {Task}= require('./db/models/task.model');

//load middleware
app.use(bodyParser.json());

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

//delete a list
app.delete('/lists/:id',(req,res)=>{
    res.send('hello there..')
})

app.listen(3000,()=>{
    console.log('server is on port 3000');
})
