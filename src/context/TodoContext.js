import React, { createContext, useContext, useReducer } from "react";

const TodoContext = createContext();

const initialState = {
  todos: [
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build a Todo App', completed: false }
  ],
};

const ActionTypes = {
  // 添加任务
  ADD_TODO: 'ADD_TODO',
  // 删除任务
  DELETE_TODO: 'DELETE_TODO',
  // 切换完成状态
  TOGGLE_COMPLETE: 'TOGGLE_COMPLETE',
  // 拖拽排序
  REORDER_TODOS: 'REORDER_TODOS',
  // 编辑任务
  EDIT_TODO: 'EDIT_TODO',
};

// todoReducer 负责根据不同的 action 更新状态
function todoReducer(state, action) {
  switch (action.type) {
    case ActionTypes.ADD_TODO:
      return {
        ...state,
        todos: [...state.todos, {
          id: Date.now(),
          text: action.payload.text,
          completed: false,
        }],
      };
    case ActionTypes.DELETE_TODOL:
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload.id)
      }
    case ActionTypes.TOGGLE_COMPLETE:
      return {
        ...state,
        todos: state.todos.map((todo) => todo.id === action.payload.id ? { ...todo, completed: !todo.completed } : todo)
      }
    case ActionTypes.REORDER_TODOS:
      {
        // sourceIndex: 拖拽源位置索引 destinationIndex: 目标位置索引
        const { sourceIndex, destinationIndex } = action.payload;
        if (sourceIndex === destinationIndex) return state;
        let newTodos = [...state.todos];
        // 移动元素
        const [movedTodo] = newTodos.splice(sourceIndex, 1);
        newTodos.splice(destinationIndex, 0, movedTodo);

        return {
          ...state,
          todos: newTodos
        }
      }
    case ActionTypes.EDIT_TODO:
      return {
        ...state,
        todos: state.todos.map(todo => todo.id === action.payload.id ? { ...todo, text: action.payload.text } : todo)
      }
    default:
      return state;
  }
}

export const TodoProvider = ({ children }) => {
  // 使用 useReducer 管理 todo 状态
  const [state, dispatch] = useReducer(todoReducer, initialState);

  const actions = {
    addTodo: (text) => {
      if (text.trim()) {
        dispatch({
          type: ActionTypes.ADD_TODO,
          payload: { text },
        });
      }
    },

    deleteTodo: (id) => {
      dispatch({
        type: ActionTypes.DELETE_TODO,
        payload: { id },
      });
    },

    toggleComplete: (id) => {
      dispatch({
        type: ActionTypes.TOGGLE_COMPLETE,
        payload: { id },
      });
    },

    reorderTodos: (sourceIndex, destinationIndex) => {
      dispatch({
        type: ActionTypes.REORDER_TODOS,
        payload: { sourceIndex, destinationIndex },
      });
    },

    editTodo: (id, text) => {
      if (text.trim()) {
        dispatch({
          type: ActionTypes.EDIT_TODO,
          payload: { id, text },
        });
      }
    },
  };

  // 上下文值：包含状态和操作方法
  const contextValue = {
    todos: state.todos,
    ...actions,
  };

  return (
    <todoContext.Provider value={{ contextValue }}>
      {children}
    </todoContext.Provider>
  )
}

export const useTodoContext = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodoContext必须在TodoProvider中使用');
  }
  return context;
};

export default TodoContext;