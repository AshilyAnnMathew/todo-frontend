import React, { useState, useEffect } from 'react';
import './TodoList.css';

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  // Fetch tasks from backend on mount (with wake-up ping)
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Ping backend to wake up if asleep
        await fetch('https://todo-backend-6pfq.onrender.com');

        const response = await fetch('https://todo-backend-6pfq.onrender.com/tasks');
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
        const res = await fetch("https://todo-backend-6pfq.onrender.com/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

  // Handle input keypress (Enter to add)
  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleAddTodo();
    }
  };

  // Toggle task completion
  const handleToggleComplete = async (id, completed) => {
    try {
      const res = await fetch(`https://todo-backend-6pfq.onrender.com/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
      await fetch(`https://todo-backend-6pfq.onrender.com/tasks/${id}`, {
        method: "DELETE",
      });
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
        const res = await fetch(`https://todo-backend-6pfq.onrender.com/tasks/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
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

  // Cancel editing
  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  // Handle key press during editing
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

      {/* Add new task */}
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

      {/* Task list */}
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
