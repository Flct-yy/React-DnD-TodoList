import React, { useEffect, useRef } from 'react';
import useTodoContext from '@/context/TodoContext/useTodoContext';

import { useDrag, useDrop } from 'react-dnd';
import ItemTypes from '@/dnd/types';

export default function TodoItem({ todo, index }) {
  const { todos, selectedTodos, deleteTodo, toggleComplete, toggleSelected, reorderTodos, addSelectTodos, removeSelectTodos, batchReorderTodos } = useTodoContext();
  const divRef = useRef(null);

  // 选中状态
  const checkboxRef = useRef(null);

  // 单选框状态变化处理函数
  const handleCheckboxChange = (e) => {
    toggleSelected(todo.id);
    if (e.target.checked) {
      // 选中：调用添加选中任务的action
      addSelectTodos(todo.id);
    } else {
      // 取消选中：调用移除选中任务的action
      removeSelectTodos(todo.id);
    }
  };

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
      item: () => {
        // 构建拖拽数据
        // 1. 基本信息：当前项的id、索引和选中状态
        // 2. 如果当前项被选中且存在选中列表，包含选中列表信息
        return {
          id: todo.id,
          index,
          selected: todo.selected,
          // 只有当当前项被选中且存在选中列表时，才包含selectedTodos
          selectedTodos: todo.selected && selectedTodos ? selectedTodos : undefined
        };
      },
      end: (item, monitor) => {

      },
      canDrag: (monitor) => {
        return true;
      },
      // 自定义判断当前项是否正在被拖拽的逻辑
      isDragging: (monitor) => {
        const item = monitor.getItem();
        // 安全检查：确保item存在
        if (!item) return false;

        // 单个拖动逻辑
        if (!item.selectedTodos || !item.selected) {
          // 当拖拽数据存在且id与当前项匹配时，视为正在拖拽
          return item.id === todo.id;
        }

        // 多选拖动逻辑：检查当前项是否在选中列表中
        // some 方法检查是否有选中项的id匹配当前项的id
        return item.selectedTodos.some(selectedTodo => selectedTodo && selectedTodo.id === todo.id);

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
    , [todos, selectedTodos])

  const [{ isOver, canDrop }, dropTargetRef] = useDrop(
    {
      // 接受的拖拽类型，与拖拽源的type匹配
      accept: ItemTypes.TODO_ITEM,
      // 放置目标自身的数据（此处为空对象，可根据需要添加）
      item: {},
      drop: (item, monitor) => {

      },
      hover: (item, monitor) => {
        if (item.selected) {
          // 多选拖拽逻辑
          // 确保不与自己交换
          if (item.selectedTodos.some(selectedTodo => selectedTodo.id === todo.id)) return;

          // 获取目标位置索引
          const destinationIndex = todos.findIndex(oneTodo => oneTodo.id === todo.id);
          console.log(destinationIndex);

          // 3. 调用批量重排序函数
          // batchReorderTodos内默认是 只有当鼠标在 destinationIndex 下面时 才会移动 destinationIndex 上去 我们设置成 50% 向下移动 超过 50% 就会向上移动
          // batchReorderTodos(destinationIndex);

          // hoverOffset 是 鼠标位置相对于当前TodoItem元素的垂直偏移量
          // monitor.getClientOffset().y 获取的是鼠标指针在浏览器视口中的Y坐标位置
          // divRef.current.getBoundingClientRect().top 获取的是当前TodoItem元素的顶部边缘在浏览器视口中的Y坐标位置
          const hoverOffset = monitor.getClientOffset().y - divRef.current.getBoundingClientRect().top;
          // halfHeight 是 50% 处
          const halfHeight = divRef.current.offsetHeight / 2;
          if (hoverOffset > halfHeight) {
            // 鼠标在目标项下方 50% 以内  则将 destinationIndex 上移
            batchReorderTodos(destinationIndex, 'UP');

          } else {
            // 鼠标在目标项上方 50% 以内  则将 destinationIndex 下移
            batchReorderTodos(destinationIndex, 'DOWN');

          }
        } else {
          // 当只有单个拖动时 执行这个

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
        }

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
    , [todos, selectedTodos])

  // 注意 Drag 和 Drop 必须添加todos依赖 如果不添加 容易拖拽状态不同步 等问题  显示混乱
  dropTargetRef(dragSourceRef(divRef))


  return (
    // 拖拽时  会添加 isDragging 类名  会使当前组件 透明度 降低
    <div className={`todo-item${isDragging ? ' isDragging' : ''}`} ref={divRef}>
      <div className="todo-item-content">
        <input
          type="checkbox"
          id={`todo-${todo.id}`}
          checked={todo.selected}
          onChange={handleCheckboxChange}
          className="todo-checkbox"
          ref={checkboxRef}
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