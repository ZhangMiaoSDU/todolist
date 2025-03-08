'use client';

import { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import Todo from './components/Todo';

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
  date: string;
  time?: string; // HH:mm 格式
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('todos');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // 保存到本地存储
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text: string, date: Date, time?: string) => {
    setTodos([
      ...todos,
      {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        date: date.toISOString().split('T')[0],
        time,
      },
    ]);
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const updateTodo = (id: number, text: string, time?: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, text: text.trim(), time } : todo
      )
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">
          我的待办清单
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-[450px_1fr] gap-6 items-start">
          <div className="md:min-h-[calc(100vh-12rem)]">
            <Todo
              todos={todos}
              selectedDate={selectedDate}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onUpdate={updateTodo}
              onAdd={addTodo}
            />
          </div>
          <div className="md:sticky md:top-8">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              todos={todos}
              onAddTodo={addTodo}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
