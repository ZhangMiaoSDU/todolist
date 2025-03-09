import React from 'react';
import { useState, useEffect } from 'react';

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
  date: string;
  time?: string;
}

interface AIAssistantProps {
  todos: TodoItem[];
  selectedDate: Date;
}

export default function AIAssistant({ todos, selectedDate }: AIAssistantProps) {
  const [dailyReminder, setDailyReminder] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const generateAIResponse = async (prompt: string) => {
    try {
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SILICONFLOW_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-7B-Instruct",
          messages: [
            {
              role: "system",
              content: "你是一个简洁的任务助手，回复要求：1. 字数限制100字以内；2. 语气友好积极；3. 重点突出；4. 建议具体可行。"
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI响应生成失败:', error);
      return null;
    }
  };

  // 生成每日提醒和建议
  useEffect(() => {
    const generateDailyReminder = async () => {
      setIsLoading(true);
      const today = selectedDate.toISOString().split('T')[0];
      const todayTodos = todos.filter(todo => todo.date === today);
      
      if (todayTodos.length === 0) {
        setDailyReminder('今天暂时没有待办事项。享受轻松的一天吧！');
        setIsLoading(false);
        return;
      }

      const pendingTodos = todayTodos.filter(todo => !todo.completed);
      const completedTodos = todayTodos.filter(todo => todo.completed);

      const todosList = pendingTodos.map(todo => 
        `${todo.text}${todo.time ? ` (${todo.time})` : ''}`
      ).join('、');

      const prompt = `请根据以下信息生成简短建议：
      待完成：${pendingTodos.length}个
      已完成：${completedTodos.length}个
      待办：${todosList}
      
      请简短回复：
      1. 完成情况点评（20字内）
      2. 待办建议（50字内）
      3. 鼓励（20字内）`;

      const aiResponse = await generateAIResponse(prompt);
      if (aiResponse) {
        setDailyReminder(aiResponse);
      } else {
        // 降级到基础提醒
        let reminder = `今天共有 ${todayTodos.length} 个任务，`;
        reminder += `已完成 ${completedTodos.length} 个，`;
        reminder += `还有 ${pendingTodos.length} 个待完成。\n\n`;
        if (pendingTodos.length > 0) {
          reminder += '建议优先处理：' + todosList;
        }
        setDailyReminder(reminder);
      }
      setIsLoading(false);
    };

    generateDailyReminder();
  }, [todos, selectedDate]);

  // 生成每日/每周总结
  useEffect(() => {
    const generateWeeklySummary = async () => {
      setIsLoading(true);
      const last7Days = new Date(selectedDate);
      last7Days.setDate(last7Days.getDate() - 7);
      
      const recentTodos = todos.filter(todo => {
        const todoDate = new Date(todo.date);
        return todoDate >= last7Days && todoDate <= selectedDate;
      });

      const completedTodos = recentTodos.filter(todo => todo.completed);
      const completionRate = recentTodos.length > 0 
        ? Math.round((completedTodos.length / recentTodos.length) * 100) 
        : 0;

      const prompt = `请根据以下数据生成简短周总结：
      总任务：${recentTodos.length}个
      已完成：${completedTodos.length}个
      完成率：${completionRate}%
      
      请简短回复：
      1. 本周表现点评（40字内）
      2. 改进建议（40字内）`;

      const aiResponse = await generateAIResponse(prompt);
      if (aiResponse) {
        setSummary(aiResponse);
      } else {
        // 降级到基础总结
        let summaryText = `📊 过去7天完成率${completionRate}%\n`;
        if (completionRate >= 80) {
          summaryText += '🌟 太棒了！保持这个势头继续前进吧！';
        } else if (completionRate >= 50) {
          summaryText += '💪 完成率还不错，继续加油！';
        } else {
          summaryText += '🎯 让我们一起努力，提高任务完成率吧！';
        }
        setSummary(summaryText);
      }
      setIsLoading(false);
    };

    generateWeeklySummary();
  }, [todos, selectedDate]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          🤖 AI助手提醒
          {isLoading && (
            <span className="ml-2 inline-block animate-spin">⌛</span>
          )}
        </h2>
        <div className="whitespace-pre-line text-gray-600">
          {dailyReminder || '正在生成分析...'}
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          📈 任务总结
          {isLoading && (
            <span className="ml-2 inline-block animate-spin">⌛</span>
          )}
        </h2>
        <div className="whitespace-pre-line text-gray-600">
          {summary || '正在生成总结...'}
        </div>
      </div>
    </div>
  );
} 