import React, { useReducer } from "react";
import TodoContext from './TodoContext';


const initialState = {
  todos: [
    { id: 1, text: 'Learn React', completed: false, selected: false },
    { id: 2, text: 'Build a Todo App', completed: false, selected: false },
    { id: 3, text: 'Build a Demo', completed: true, selected: false },
    { id: 4, text: 'Fix a Bug', completed: false, selected: true },

  ],
  // 当前选中的任务数组
  selectedTodos: [{ id: 4, text: 'Fix a Bug', completed: false, selected: true }],
};

const ActionTypes = {
  // 添加任务
  ADD_TODO: 'ADD_TODO',
  // 删除任务
  DELETE_TODO: 'DELETE_TODO',
  // 切换完成状态
  TOGGLE_COMPLETE: 'TOGGLE_COMPLETE',
  // 切换选中状态
  TOGGLE_SELECTED: 'TOGGLE_SELECTED',
  // 拖拽排序
  REORDER_TODOS: 'REORDER_TODOS',
  // 编辑任务
  EDIT_TODO: 'EDIT_TODO',
  // 批量选中任务
  ADD_SELECT_TODOS: 'BATCH_SELECT_TODOS',
  // 批量取消选中任务
  REMOVE_SELECT_TODOS: 'REMOVE_SELECT_TODOS',
  // 批量重新排序任务
  BATCH_REORDER_TODOS: 'BATCH_REORDER_TODOS',
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
          selected: false,
        }],
      };
    case ActionTypes.DELETE_TODO:
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload.id)
      }
    case ActionTypes.TOGGLE_COMPLETE:
      return {
        ...state,
        todos: state.todos.map((todo) => todo.id === action.payload.id ? { ...todo, completed: !todo.completed } : todo)
      }
    case ActionTypes.TOGGLE_SELECTED:
      return {
        ...state,
        todos: state.todos.map((todo) => todo.id === action.payload.id ? { ...todo, selected: !todo.selected } : todo)
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
    case ActionTypes.ADD_SELECT_TODOS:
      {
        // 找到要添加的todo对象
        const todoToAdd = state.todos.find(todo => todo.id === action.payload.id);
        // 确保todo存在且尚未被选中（避免重复添加）
        if (todoToAdd && !state.selectedTodos.some(todo => todo.id === todoToAdd.id)) {
          return {
            ...state,
            selectedTodos: [...state.selectedTodos, todoToAdd],
          };
        }
        return state;
      }
    case ActionTypes.REMOVE_SELECT_TODOS:
      return {
        ...state,
        selectedTodos: state.selectedTodos.filter(todo => todo.id !== action.payload.id),
      }
    case ActionTypes.BATCH_REORDER_TODOS:
      {
        // destinationIndex: 目标位置索引
        // direction：目标位置的移动方向
        const { destinationIndex, direction } = action.payload;

        // 边界条件检查
        if (!state.selectedTodos.length || destinationIndex < 0 || destinationIndex >= state.todos.length) {
          return state;
        }

        let newTodos = [...state.todos];

        // 按照selectedTodos在原始数组中的顺序重新排序
        // 使用id进行比较，确保排序准确
        let tempSelectedTodos = [...state.selectedTodos].sort((a, b) => {
          return newTodos.findIndex(todo => todo.id === a.id) - newTodos.findIndex(todo => todo.id === b.id);
        });


        // 创建选中任务的ID集合，用于快速查找
        const selectedTodoIds = new Set(tempSelectedTodos.map(todo => todo.id));

        // 不能直接使用 splice 方法，因为选中任务不一定是连续的
        // newTodos.splice(state.todos.indexOf(tempSelectedTodos[0]), tempSelectedTodos.length);

        // 从原始数组中移除所有选中的任务
        const nonSelectedTodos = newTodos.filter(todo => !selectedTodoIds.has(todo.id));

        // 计算在非选中数组中的实际目标位置
        let actualDestinationIndex = nonSelectedTodos.findIndex(todo => todo.id === state.todos[destinationIndex].id);


        // 确保目标位置不超出数组范围
        actualDestinationIndex = Math.min(actualDestinationIndex, nonSelectedTodos.length);

        if(direction === 'UP'){
          actualDestinationIndex++;
        }
        // 在目标位置正确插入选中的任务（使用扩展运算符避免数组嵌套）
        const resultTodos = [
          // slice 用于创建并返回数组的一个新的子数组，而不会修改原始数组 区间是[start, end)
          ...nonSelectedTodos.slice(0, actualDestinationIndex),
          ...tempSelectedTodos,
          ...nonSelectedTodos.slice(actualDestinationIndex)
        ];
        return {
          ...state,
          todos: resultTodos,
          // 保持选中状态，方便用户继续操作
          selectedTodos: [...state.selectedTodos],
        }
      }
    default:
      return state;
  }
}

export default function TodoProvider({ children }) {
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

    toggleSelected: (id) => {
      dispatch({
        type: ActionTypes.TOGGLE_SELECTED,
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

    // 添加选中任务
    addSelectTodos: (id) => {
      dispatch({
        type: ActionTypes.ADD_SELECT_TODOS,
        payload: { id },
      });
    },

    // 移除选中任务
    removeSelectTodos: (id) => {
      dispatch({
        type: ActionTypes.REMOVE_SELECT_TODOS,
        payload: { id },
      });
    },

    // 批量重新排序任务
    batchReorderTodos: (destinationIndex, direction) => {

      dispatch({
        type: ActionTypes.BATCH_REORDER_TODOS,
        payload: { destinationIndex, direction },
      });
    },
  };

  // 上下文值：包含状态和操作方法
  const contextValue = {
    todos: state.todos,
    selectedTodos: state.selectedTodos,
    ...actions,
  };

  return (
    <TodoContext.Provider value={contextValue}>
      {children}
    </TodoContext.Provider>
  )
}