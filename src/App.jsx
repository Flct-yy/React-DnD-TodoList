import React from 'react'
import './App.css'

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend'
import TodoProvider from '@/context/TodoContext/TodoProvider'

import TodoList from '@/components/TodoList/TodoList'

function App() {

  return (
    <DndProvider backend={HTML5Backend}>
      <TodoProvider>
          <TodoList />
      </TodoProvider>
    </DndProvider>
  )
}

export default App
