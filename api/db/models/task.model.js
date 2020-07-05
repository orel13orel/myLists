const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength:1,
        require: true
    },
    _listId: {
        type: mongoose.Types.ObjectId,
        required: true
    }
})

const Task =mongoose.Model('Task',TaskSchema);

module.exports= {Task}