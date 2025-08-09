import React, { useEffect, useState } from 'react';
import './App.css';

type Todo = {
  id: number;
  text: string;
  completed: number;
};

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');

  // Fetch todos from backend
  useEffect(() => {
    fetch('http://localhost:4000/todos')
      .then(res => res.json())
      .then(setTodos);
  }, []);

  // Add new todo
  const addTodo = async () => {
    if (!input.trim()) return;
    const res = await fetch('http://localhost:4000/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input })
    });
    const newTodo = await res.json();
    setTodos([...todos, newTodo]);
    setInput('');
  };

  // Toggle completed
  const toggleTodo = async (todo: Todo) => {
    const res = await fetch(`http://localhost:4000/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: todo.text, completed: todo.completed ? 0 : 1 })
    });
    const updated = await res.json();
    setTodos(todos.map(t => (t.id === updated.id ? updated : t)));
  };

  // Delete todo
  const deleteTodo = async (id: number) => {
    await fetch(`http://localhost:4000/todos/${id}`, { method: 'DELETE' });
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div className="App">
      <h1>TODO App</h1>
      <div>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="New TODO"
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <span
              style={{ textDecoration: todo.completed ? 'line-through' : 'none', cursor: 'pointer' }}
              onClick={() => toggleTodo(todo)}
            >
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)} style={{ marginLeft: 8 }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
