import { useContext } from 'react';
import TodoContext from './TodoContext';

export default function useTodoContext() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodoContext必须在TodoProvider中使用');
  }
  return context;
};