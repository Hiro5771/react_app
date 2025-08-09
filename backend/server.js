// Simple TODO API server using Express and SQLite

import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

let db;

// Initialize SQLite database and table
(async () => {
  db = await open({
    filename: './todos.db',
    driver: sqlite3.Database
  });

  await db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0
    )
  `);
})();

// Get all todos
app.get('/todos', async (req, res) => {
  const todos = await db.all('SELECT * FROM todos');
  res.json(todos);
});

// Add a new todo
app.post('/todos', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });
  const result = await db.run('INSERT INTO todos (text, completed) VALUES (?, ?)', [text, 0]);
  const todo = await db.get('SELECT * FROM todos WHERE id = ?', [result.lastID]);
  res.status(201).json(todo);
});

// Update a todo
app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;
  await db.run('UPDATE todos SET text = ?, completed = ? WHERE id = ?', [text, completed ? 1 : 0, id]);
  const todo = await db.get('SELECT * FROM todos WHERE id = ?', [id]);
  res.json(todo);
});

// Delete a todo
app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  await db.run('DELETE FROM todos WHERE id = ?', [id]);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`TODO API server running on port ${PORT}`);
});
