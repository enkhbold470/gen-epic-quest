"use client";

import { useState, useEffect } from "react";
import { Todo } from "@/lib/types";
import { TodoItem } from "./todo-item";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { transformTodoWithAI, splitTaskIntoSubtasks } from "@/app/actions/todo-actions";
import { Loader2, Sparkles, Plus } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "useless-todos";

export const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTransforming, setIsTransforming] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTodos(
          parsed.map((todo: Omit<Todo, "createdAt"> & { createdAt: string }) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
          }))
        );
      } catch (error) {
        console.error("Failed to load todos:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const handleAddTodo = async () => {
    const trimmedText = inputValue.trim();
    
    if (!trimmedText) {
      toast.error("Please enter a todo item");
      return;
    }

    if (isTransforming) return;

    setIsTransforming(true);
    setInputValue("");

    try {
      const result = await transformTodoWithAI({ text: trimmedText });

      if (!result.success || !result.data) {
        toast.error(result.error || "Failed to transform todo");
        return;
      }

      const newTodo: Todo = {
        id: crypto.randomUUID(),
        originalText: trimmedText,
        dramaticText: result.data,
        completed: false,
        createdAt: new Date(),
      };

      setTodos((prev) => [newTodo, ...prev]);
      toast.success("Epic quest added!");
    } catch (error) {
      console.error("Error adding todo:", error);
      toast.error("Failed to add todo. Please try again.");
    } finally {
      setIsTransforming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddTodo();
    }
  };

  const handleToggle = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id !== id) return todo;

        const newCompleted = !todo.completed;

        // If completing parent, complete all subtasks
        // If uncompleting parent, leave subtasks as is
        const updatedSubtasks = todo.subtasks
          ? todo.subtasks.map((subtask) => ({
              ...subtask,
              completed: newCompleted ? true : subtask.completed,
            }))
          : undefined;

        return {
          ...todo,
          completed: newCompleted,
          subtasks: updatedSubtasks,
        };
      })
    );
  };

  const handleDelete = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    toast.success("Quest removed!");
  };

  const handleSplit = async (id: string, currentText: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo || todo.subtasks) {
      return; // Already has subtasks
    }

    setIsTransforming(true);

    try {
      const result = await splitTaskIntoSubtasks({ text: currentText });

      if (!result.success || !result.data || result.data.length === 0) {
        toast.error(result.error || "Failed to split task into subtasks");
        return;
      }

      const subtasks = result.data.map((text) => ({
        id: crypto.randomUUID(),
        text: text.trim(),
        completed: false,
      }));

      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id
            ? {
                ...todo,
                subtasks,
              }
            : todo
        )
      );

      toast.success(`Task split into ${subtasks.length} subtasks!`);
    } catch (error) {
      console.error("Error splitting task:", error);
      toast.error("Failed to split task. Please try again.");
    } finally {
      setIsTransforming(false);
    }
  };

  const handleToggleSubtask = (todoId: string, subtaskId: string) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id !== todoId || !todo.subtasks) return todo;

        const updatedSubtasks = todo.subtasks.map((subtask) =>
          subtask.id === subtaskId
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        );

        // Auto-complete parent if all subtasks are done
        // Auto-uncomplete parent if any subtask is uncompleted
        const allCompleted = updatedSubtasks.every((st) => st.completed);

        return {
          ...todo,
          subtasks: updatedSubtasks,
          completed: allCompleted,
        };
      })
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-0">
      <Card className="border-2">

        <CardContent className="space-y-3 sm:space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter a mundane task... (e.g., 'Buy groceries')"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTransforming}
              className="flex-1"
              aria-label="Todo input"
            />
            <Button
              onClick={handleAddTodo}
              disabled={isTransforming || !inputValue.trim()}
              size="icon"
              className="shrink-0 size-9 sm:size-10"
              aria-label="Add todo"
            >
              {isTransforming ? (
                <Loader2 className="size-4 sm:size-5 animate-spin" />
              ) : (
                <Plus className="size-4 sm:size-5" />
              )}
            </Button>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Enter a task and transform it!
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2 sm:space-y-3">
        {todos.length === 0 ? (
          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <Sparkles className="size-10 sm:size-12 text-muted-foreground mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-sm sm:text-base text-muted-foreground">
                No epic quests yet. Type your first task above!
              </p>
            </CardContent>
          </Card>
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onSplit={handleSplit}
              onToggleSubtask={handleToggleSubtask}
            />
          ))
        )}
      </div>

      {todos.length > 0 && (
        <div className="text-center text-xs sm:text-sm text-muted-foreground pb-2">
          {todos.filter((t) => !t.completed).length} quest{todos.filter((t) => !t.completed).length !== 1 ? "s" : ""} remaining
        </div>
      )}
    </div>
  );
};
