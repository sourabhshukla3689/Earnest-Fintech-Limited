import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
const { Pool } = require('pg');  // Update this line

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Configure PostgreSQL connection details
const pool = new Pool({
  user: 'postgres', // Replace with your PostgreSQL username
  host: 'localhost', // Replace with your PostgreSQL host
  database: ' task_management_db', // Replace with your database name
  password: '1234', // Replace with your PostgreSQL password
  port: 5432, // Default PostgreSQL port
});

// Define the Task schema (using a plain JavaScript object for representation)
const taskSchema = {
  title: 'TEXT',
  description: 'TEXT',
  completed: 'BOOLEAN',
};

// Helper function to execute a PostgreSQL query
const executeQuery = async (query, values = []) => {
  try {
    const client = await pool.connect();
    const result = await client.query(query, values);
    await client.release();
    return result;
  } catch (error) {
    throw error;
  }
};

// RESTful API endpoints

// Get all tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await executeQuery('SELECT * FROM tasks');
    res.json(tasks.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a new task
app.post('/tasks', async (req, res) => {
  const { title, description } = req.body;

  try {
    const result = await executeQuery(
      'INSERT INTO tasks (title, description, completed) VALUES ($1, $2, $3) RETURNING id',
      [title, description, false]
    );
    const newTaskId = result.rows[0].id;
    res.json({ id: newTaskId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a task's completion status
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    await executeQuery('UPDATE tasks SET completed = $1 WHERE id = $2', [completed, id]);
    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a task
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await executeQuery('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
