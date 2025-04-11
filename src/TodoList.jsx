import React, { useState, useEffect } from 'react';
import './TodoList.css';

export default function TodoList() {
  // --- State for todos, input value, and editing status ---
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  // --- Fetch tasks from backend on component mount ---
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('https://todo-backend-6pfq.onrender.com/tasks');
        const tasks = await response.json();
        setTodos(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  // --- Handlers for input change, adding, keypress ---
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

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

  const handleInputKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddTodo();
    }
  };

  // --- Handlers for toggling completion and deleting ---
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

  // --- Handlers for starting, changing, saving, and cancelling edits ---
  const handleEditStart = (id, currentText) => {
    setEditingId(id);
    setEditText(currentText);
  };

  const handleEditChange = (event) => {
    setEditText(event.target.value);
  };

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

  const handleEditKeyPress = (event, id) => {
    if (event.key === 'Enter') {
      handleEditSave(id);
    } else if (event.key === 'Escape') {
      handleEditCancel();
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  // --- JSX structure ---
  return (
    <div className="todo-list-container">
      <h1>My To-Do List</h1>

      {/* Section for Adding New Tasks */}
      <div className="todo-input-container">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleInputKeyPress}
          placeholder="Enter a task"
        />
        <button onClick={handleAddTodo}>Add</button> {/* Add Button */}
      </div>

      {/* Section for Displaying Tasks */}
      <ul className="todo-list">
        {todos.length === 0 ? (
          <p className="empty-list-message">Your todo list is empty!</p>
        ) : (
          // Mapping over todos to display each one
          todos.map(todo => (
            <li key={todo._id} className={`todo-item ${todo.completed ? 'completed-item' : ''}`}>
              {editingId === todo._id ? (
                // --- Edit Mode Display ---
                <div className="todo-item-edit">
                  <input
                    type="text"
                    value={editText}
                    onChange={handleEditChange}
                    onKeyDown={(e) => handleEditKeyPress(e, todo._id)}
                    autoFocus
                  />
                  <button onClick={() => handleEditSave(todo._id)} className="save-button">
                    Save
                  </button>
                  <button onClick={handleEditCancel} className="cancel-button">
                    Cancel
                  </button>
                </div>
              ) : (
                // --- View Mode Display (Default) ---
                <div className="todo-item-view">
                  <span
                    onClick={() => handleToggleComplete(todo._id, todo.completed)} // Toggle completion on click
                    className={`todo-text ${todo.completed ? 'completed' : ''}`}
                  >
                    {todo.text}
                  </span>
                  <div className="todo-item-buttons">
                    {/* Edit Button */}
                    <button onClick={() => handleEditStart(todo._id, todo.text)} className="edit-button">
                      Edit
                    </button>
                    {/* Delete Button */}
                    <button onClick={() => handleDeleteTodo(todo._id)} className="delete-button">
                      Delete
                    </button>
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
