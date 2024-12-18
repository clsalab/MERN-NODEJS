import Task from "../models/tasks.model.js";

export const getTasks = async (req, res) => {
    
    
    try {
        const tasks = await Task.find({
            user: req.user.id
        }).populate('user'); // Asegúrate de importar el modelo 'User' si usas populate
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving tasks", error: error.message });
    }
};

export const getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('user');
        if (!task) return res.status(404).json({ message: "Task not found" });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving the task", error: error.message });
    }
};

export const createTasks = async (req, res) => {
    try {
        const { title, description, date } = req.body;

        const newTask = new Task({
            title,
            description,
            date,
            user: req.user.id
        }).populate('user');;

        const savedTask = await newTask.save();
        res.json(savedTask);
    } catch (error) {
        res.status(500).json({ message: "Error creating the task", error: error.message });
    }
};

export const updateTasks = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user');;
        if (!task) return res.status(404).json({ message: "Task not found" });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "Error updating the task", error: error.message });
    }
};

export const deleteTasks = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });
        return res.sendStatus(204);  
    } catch (error) {
        res.status(500).json({ message: "Error deleting the task", error: error.message });
    }
};

