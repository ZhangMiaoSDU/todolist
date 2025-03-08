'use client';

import { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import Todo from './components/Todo';
import AIAssistant from './components/AIAssistant';

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
  date: string;
  time?: string; // HH:mm 格式
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 初始化数据
  useEffect(() => {
    const saved = localStorage.getItem('todos');
    if (saved) {
      setTodos(JSON.parse(saved));
    }
    setSelectedDate(new Date());
    setIsLoaded(true);
  }, []);

  // 保存到本地存储
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

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

  if (!isLoaded || !selectedDate) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">
            我的待办清单
          </h1>
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin text-2xl">⌛</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">
          我的待办清单
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-[450px_1fr] gap-6 items-start">
          <div className="space-y-6">
            <AIAssistant
              todos={todos}
              selectedDate={selectedDate}
            />
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
