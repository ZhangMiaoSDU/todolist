'use client';

import { useState } from 'react';
import AddTodoModal from './AddTodoModal';

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
  date: string;
  time?: string;
}

interface CalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
  todos: TodoItem[];
  onAddTodo: (text: string, date: Date, time?: string) => void;
}

export default function Calendar({ onDateSelect, selectedDate, todos, onAddTodo }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAddDate, setSelectedAddDate] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentMonth);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const getTodosForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return todos
      .filter(todo => todo.date === dateStr)
      .sort((a, b) => {
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      });
  };

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
    setSelectedAddDate(date);
    setShowAddModal(true);
  };

  const handleAddTodo = (text: string, time?: string) => {
    if (selectedAddDate) {
      onAddTodo(text, selectedAddDate, time);
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

    // 渲染星期标题
    weekDays.forEach(day => {
      days.push(
        <div key={`header-${day}`} className="text-center font-medium py-3 text-gray-600">
          {day}
        </div>
      );
    });

    // 填充月初空白天数
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // 渲染日期
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const todosForDate = getTodosForDate(date);
      const isSelected = isSelectedDate(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div key={day} className="min-h-[120px] relative">
          <div
            onClick={() => handleDateClick(date)}
            className={`p-3 h-full cursor-pointer rounded-xl transition-all duration-200
              ${isSelected ? 'bg-blue-500 text-white shadow-lg scale-[0.98]' : 'hover:bg-blue-50'}
              ${isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
          >
            <div className={`text-center mb-2 ${isSelected ? 'font-bold' : ''} 
              ${isToday && !isSelected ? 'text-blue-500 font-bold' : ''}`}>
              {day}
            </div>
            <div className="text-xs space-y-1.5">
              {todosForDate.slice(0, 3).map(todo => (
                <div
                  key={todo.id}
                  className={`truncate px-2 py-1 rounded-md ${
                    isSelected
                      ? todo.completed
                        ? 'bg-white/20 line-through'
                        : 'bg-white/30'
                      : todo.completed
                      ? 'bg-gray-100 line-through text-gray-400'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                  title={`${todo.text}${todo.time ? ` (${todo.time})` : ''}`}
                >
                  {todo.time && (
                    <span className="inline-block mr-1 opacity-75">{todo.time}</span>
                  )}
                  {todo.text}
                </div>
              ))}
              {todosForDate.length > 3 && (
                <div className={`text-center text-xs ${
                  isSelected ? 'text-white/80' : 'text-gray-500'
                }`}>
                  还有 {todosForDate.length - 3} 项
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors w-10 h-10 flex items-center justify-center"
          >
            ←
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors w-10 h-10 flex items-center justify-center"
          >
            →
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {renderCalendarDays()}
        </div>
        <div className="mt-6 text-sm text-gray-500 text-center">
          点击日期可添加待办事项
        </div>
      </div>

      {selectedAddDate && (
        <AddTodoModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddTodo}
          date={selectedAddDate}
        />
      )}
    </>
  );
} 