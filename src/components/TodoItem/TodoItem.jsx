import React, { useRef } from 'react';
import useTodoContext from '@/context/TodoContext/useTodoContext';

import { useDrag, useDrop } from 'react-dnd';
import ItemTypes from '@/dnd/types';

export default function TodoItem({ todo, index }) {
  const { todos, deleteTodo, toggleComplete, reorderTodos, editTodo } = useTodoContext();
  const divRef = useRef(null);
  // 确保todo存在
  if (!todo) {
    return null;
  }

  // 拖拽功能实现
  const [{ isDragging }, dragSourceRef, dragPreviewRef] = useDrag(
    {
      // 拖拽类型，用于和目标源的accept属性匹配
      type: ItemTypes.TODO_ITEM,
      // 拖拽时传递的数据，包含当前拖拽项的id和索引
      item: { id: todo.id, index },
      end: (item, monitor) => {

      },
      canDrag: (monitor) => {
        return true;
      },
      // 自定义判断当前项是否正在被拖拽的逻辑
      // 当拖拽数据存在且id与当前项匹配时，视为正在拖拽
      isDragging: (monitor) => {
        return monitor.getItem() !== null && monitor.getItem().id === todo.id;
      },
      // 收集拖拽状态的回调，返回需要的状态数据
      collect: (monitor, props) => {
        return {
          // 获取当前是否处于拖拽状态（如果不设置isDragging配置，会使用默认实现）
          // isDragging 如果没有设置 则会调用默认的实现
          isDragging: monitor.isDragging(),
        }
      }

    }
    // 依赖数组：当todos发生变化时，重新创建拖拽源配置
    , [todos])

  const [{ isOver, canDrop }, dropTargetRef] = useDrop(
    {
      // 接受的拖拽类型，与拖拽源的type匹配
      accept: ItemTypes.TODO_ITEM,
      // 放置目标自身的数据（此处为空对象，可根据需要添加）
      item: {},
      drop: (item, monitor) => {

      },
      hover: (item, monitor) => {
        // item 是拖拽源  todo 是接受拖拽
        // console.log(item, todo);

        if (item.id === todo.id) return;

        // 直接使用索引会导致拖拽混乱
        // 在拖拽过程中列表顺序发生变化（比如多次快速拖拽）， item.index 仍然会保持 初始拖拽时的旧索引 ，而不是当前列表中的实际索引。
        // console.log(item.index, index);
        // reorderTodos(item.index, index);

        // 通过 todos.findIndex 的方式获取index更可靠
        // console.log(item.id, todo.id);
        const sourceIndex = todos.findIndex(oneTodo => oneTodo.id === item.id);
        const destinationIndex = todos.findIndex(oneTodo => oneTodo.id === todo.id);
        // console.log(sourceIndex, destinationIndex);
        reorderTodos(sourceIndex, destinationIndex);

      },
      // 收集放置状态的回调，返回需要的状态数据
      collect: (monitor, props) => {
        return {
          // 当前是否有拖拽项悬停在上方
          isOver: monitor.isOver(),
          // 当前目标是否可以接受拖拽项
          canDrop: monitor.canDrop
        }
      },
    }
    // 依赖数组：当todos发生变化时，重新创建放置目标配置
    , [todos])

  // 注意 Drag 和 Drop 必须添加todos依赖 如果不添加 容易拖拽状态不同步 等问题  显示混乱
  dropTargetRef(dragSourceRef(divRef))

  return (
    // 拖拽时  会添加 isDragging 类名  会使当前组件 透明度 降低
    <div className={`todo-item${isDragging ? ' isDragging' : ''}`} ref={divRef}>
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