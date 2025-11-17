import React from 'react';
import useTodoContext from '@/context/TodoContext/useTodoContext';

export default function TodoItem({ todo, index }) {
  const { toggleComplete, deleteTodo } = useTodoContext();

  // 确保todo存在
  if (!todo) {
    return null;
  }

  return (
    <div className="todo-item">
      <div className="todo-item-content">
        <input
          type="checkbox"
          id={`todo-${todo.id}`}
          // checked={todo.completed}
          // onChange={() => toggleComplete(todo.id)}
          className="todo-checkbox"
        />
        <label
          htmlFor={`todo-${todo.id}`}
          className={`todo-text ${todo.completed ? 'completed' : ''}`}
        >
          {todo.text}
        </label>
      </div>
      <button
        onClick={() => toggleComplete(todo.id)}
        className={`todo-complete-btn ${todo.completed ? 'completed' : ''}`}
        aria-label={todo.completed ? "标记为未完成" : "标记为已完成"}
      >
        {todo.completed ? "已完成" : "未完成"}
      </button>
      <button
        onClick={() => deleteTodo(todo.id)}
        className="todo-delete-btn"
        aria-label="删除任务"
      >
        ×
      </button>
    </div>
  );
}