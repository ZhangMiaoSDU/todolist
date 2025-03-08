'use client';

import { useState } from 'react';

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
  date: string;
  time?: string;
}

interface TodoProps {
  todos: TodoItem[];
  selectedDate: Date;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, text: string, time?: string) => void;
  onAdd: (text: string, date: Date, time?: string) => void;
}

export default function Todo({
  todos,
  selectedDate,
  onToggle,
  onDelete,
  onUpdate,
  onAdd,
}: TodoProps) {
  const [input, setInput] = useState('');
  const [time, setTime] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [editTime, setEditTime] = useState('');

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAdd(input, selectedDate, time || undefined);
      setInput('');
      setTime('');
    }
  };

  const startEditing = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditText(todo.text);
    setEditTime(todo.time || '');
  };

  const saveEdit = (id: number) => {
    if (editText.trim()) {
      onUpdate(id, editText, editTime || undefined);
    }
    setEditingId(null);
  };

  // 只过滤当天未完成的事项，并按时间排序
  const filteredTodos = todos
    .filter((todo) => {
      const dateMatches = todo.date === selectedDate.toISOString().split('T')[0];
      return dateMatches && !todo.completed;
    })
    .sort((a, b) => {
      if (!a.time && !b.time) return 0;
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">
        {selectedDate.toLocaleDateString('zh-CN', { 
          month: 'long', 
          day: 'numeric',
          weekday: 'long'
        })}
      </h1>
      
      <div className="flex items-center justify-between mb-6">
        <span className="text-lg font-medium text-gray-700">
          待完成事项 
          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-sm">
            {filteredTodos.length}
          </span>
        </span>
      </div>

      <form onSubmit={handleAddTodo} className="mb-6">
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="添加新的待办事项..."
              className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
          >
            添加
          </button>
        </div>
      </form>

      <ul className="space-y-3">
        {filteredTodos.map((todo) => (
          <li
            key={todo.id}
            className="group flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggle(todo.id)}
                className="w-5 h-5 text-blue-500 rounded-lg focus:ring-blue-500"
              />
              {editingId === todo.id ? (
                <div className="flex-1 flex gap-3">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => saveEdit(todo.id)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                    className="flex-1 p-2 border-2 rounded-lg focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="p-2 border-2 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              ) : (
                <div
                  className="flex-1 flex items-center gap-3"
                  onDoubleClick={() => startEditing(todo)}
                >
                  <span className="flex-1 text-gray-700">
                    {todo.text}
                  </span>
                  {todo.time && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                      {todo.time}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {editingId !== todo.id && (
                <button
                  onClick={() => startEditing(todo)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  编辑
                </button>
              )}
              <button
                onClick={() => onDelete(todo.id)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                删除
              </button>
            </div>
          </li>
        ))}
      </ul>
      
      {filteredTodos.length === 0 && (
        <div className="text-center text-gray-500 mt-8 py-8 bg-gray-50 rounded-xl">
          <p className="text-lg">当天暂无待办事项</p>
          <p className="text-sm mt-2">添加一些任务开始美好的一天吧！</p>
        </div>
      )}
      
      {filteredTodos.length > 0 && (
        <p className="text-sm text-gray-500 mt-6 text-center">
          提示：双击待办事项可以快速编辑
        </p>
      )}
    </div>
  );
} 