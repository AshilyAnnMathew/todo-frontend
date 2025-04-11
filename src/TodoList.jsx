import React, { useState, useEffect } from 'react';
import './TodoList.css';

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const API_BASE = 'https://todo-backend-6pfq.onrender.com/api/tasks';

  // Fetch tasks from backend on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Wake up Render server
        await fetch('https://todo-backend-6pfq.onrender.com');
        const response = await fetch(API_BASE);
        const tasks = await response.json();
        setTodos(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  // Add new task
  const handleAddTodo = async () => {
    if (inputValue.trim() !== '') {
      try {
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: inputValue }),
        });
        const newTodo = await res.json();
        setTodos([...todos, newTodo]);
        setInputValue('');
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

  // Handle input keypress
  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleAddTodo();
    }
  };

  // Toggle complete
  const handleToggleComplete = async (id, completed) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });
      const updatedTask = await res.json();
      setTodos(todos.map(todo => (todo._id === id ? updatedTask : todo)));
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  // Delete task
  const handleDeleteTodo = async (id) => {
    try {
      await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Start editing
  const handleEditStart = (id, currentText) => {
    setEditingId(id);
    setEditText(currentText);
  };

  // Save edited task
  const handleEditSave = async (id) => {
    if (editText.trim() !== '') {
      try {
        const res = await fetch(`${API_BASE}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: editText }),
        });
        const updatedTask = await res.json();
        setTodos(todos.map(todo => (todo._id === id ? updatedTask : todo)));
        setEditingId(null);
        setEditText('');
      } catch (error) {
        console.error('Error saving task:', error);
      }
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleEditKeyDown = (event, id) => {
    if (event.key === 'Enter') {
      handleEditSave(id);
    } else if (event.key === 'Escape') {
      handleEditCancel();
    }
  };

  return (
    <div className="todo-list-container">
      <h1>My To-Do List</h1>

      <div className="todo-input-container">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Enter a task"
        />
        <button onClick={handleAddTodo}>Add</button>
      </div>

      <ul className="todo-list">
        {todos.length === 0 ? (
          <p className="empty-list-message">Your todo list is empty!</p>
        ) : (
          todos.map(todo => (
            <li key={todo._id} className={`todo-item ${todo.completed ? 'completed-item' : ''}`}>
              {editingId === todo._id ? (
                <div className="todo-item-edit">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, todo._id)}
                    autoFocus
                  />
                  <button onClick={() => handleEditSave(todo._id)} className="save-button">Save</button>
                  <button onClick={handleEditCancel} className="cancel-button">Cancel</button>
                </div>
              ) : (
                <div className="todo-item-view">
                  <span
                    onClick={() => handleToggleComplete(todo._id, todo.completed)}
                    className={`todo-text ${todo.completed ? 'completed' : ''}`}
                  >
                    {todo.text}
                  </span>
                  <div className="todo-item-buttons">
                    <button onClick={() => handleEditStart(todo._id, todo.text)} className="edit-button">Edit</button>
                    <button onClick={() => handleDeleteTodo(todo._id)} className="delete-button">Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
