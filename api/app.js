const express =require('express');
const app=express();

// routes handlers

//list routes

//get all lists
app.get('/lists',(req,res)=>{
    res.send('//get all lists')
})

//creat a list
app.post('/lists',(req,res)=>{
    //create new list, return new list doc(includes the ID)
})

//update a specific (by ID)list
app.patch('/lists/:id',(req,res)=>{
    res.send('hello there..')
})

//delete a list
app.delete('/lists/:id',(req,res)=>{
    res.send('hello there..')
})



app.listen(3000,()=>{
    console.log('server is on port 3000');
})
