import React, { useState } from 'react';
import useTodoContext from '@/context/TodoContext/useTodoContext';
import TodoItem from '@/components/TodoItem/TodoItem';

export default function TodoList() {
  // 获取任务列表数据和添加任务方法
  const { todos, addTodo } = useTodoContext();
  // 管理新任务输入框的值
  const [newTodoText, setNewTodoText] = useState('');

  // 处理添加新任务
  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      addTodo(newTodoText);
      setNewTodoText(''); // 清空输入框
    }
  };

  // console.log(todos);
  
  return (
    <div className="todo-list-container">
      <h2 className="todo-list-title">任务列表</h2>
      
      <form onSubmit={handleAddTodo} className="add-todo-form">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="输入新任务..."
          className="add-todo-input"
          autoFocus
        />
        <button type="submit" className="add-todo-button">
          添加
        </button>
      </form>
      
      <div className="todo-list">
        {todos.length === 0 ? (
          <p className="empty-todos">暂无任务，点击上方按钮添加新任务</p>
        ) : (
          todos.map((todo, index) => (
            <TodoItem key={todo.id} todo={todo} index={index} />
          ))
        )}
      </div>
    </div>
  );
}