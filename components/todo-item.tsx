"use client";

import { Todo } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Crown, Minimize2, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type TodoItemProps = {
  todo: Todo;
  onToggle: (id: string) => void;
  onToggleSubtask: (todoId: string, subtaskId: string) => void;
  onDelete: (id: string) => void;
  onSplit: (id: string, currentText: string) => void;
};

export const TodoItem = ({ 
  todo, 
  onToggle, 
  onDelete, 
  onSplit,
  onToggleSubtask 
}: TodoItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasSubtasks = todo.subtasks && todo.subtasks.length > 0;

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md border",
        todo.completed && "opacity-60"
      )}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={() => onToggle(todo.id)}
            className="mt-1 size-6 sm:size-7 shrink-0"
            aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-1 sm:mb-2">
              <Crown className="size-4 sm:size-5 text-primary shrink-0 mt-0.5" />
              <p
                className={cn(
                  "text-sm sm:text-base font-medium leading-relaxed wrap-break-word flex-1",
                  todo.completed && "line-through text-muted-foreground"
                )}
              >
                {todo.dramaticText}
              </p>
            </div>
            <p className="text-xs text-muted-foreground ml-0 sm:ml-6 italic wrap-break-word mb-2 sm:mb-3">
              &ldquo;{todo.originalText}&rdquo;
            </p>

            {hasSubtasks && (
              <div className="ml-0 sm:ml-6 mb-2 sm:mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-7 sm:h-8 text-xs sm:text-sm p-1 sm:p-2 -ml-1 sm:-ml-2"
                  aria-label={isExpanded ? "Collapse subtasks" : "Expand subtasks"}
                >
                  {isExpanded ? (
                    <ChevronDown className="size-3 sm:size-4 mr-1" />
                  ) : (
                    <ChevronRight className="size-3 sm:size-4 mr-1" />
                  )}
                  <span className="text-xs sm:text-sm">
                    {todo.subtasks!.filter((st) => st.completed).length} / {todo.subtasks!.length} subtasks
                  </span>
                </Button>

                {isExpanded && (
                  <div className="mt-2 space-y-2 pl-4 sm:pl-6 border-l-2 border-muted">
                    {todo.subtasks!.map((subtask) => (
                      <div
                        key={subtask.id}
                        className="flex items-center gap-2 sm:gap-3 group"
                      >
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={() => onToggleSubtask(todo.id, subtask.id)}
                          className="size-5 sm:size-6 shrink-0"
                          aria-label={subtask.completed ? "Mark subtask as incomplete" : "Mark subtask as complete"}
                        />
                        <p
                          className={cn(
                            "text-xs sm:text-sm wrap-break-word flex-1",
                            subtask.completed && "line-through text-muted-foreground"
                          )}
                        >
                          {subtask.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-2 sm:mt-3">
              <Button
                variant="link"
                size="sm"
                onClick={() => onSplit(todo.id, todo.dramaticText)}
                disabled={hasSubtasks}
                className="h-8 sm:h-9 text-xs sm:text-sm underline"
                aria-label="Split into smaller tasks"
              >
                <Minimize2 className="size-3 sm:size-4 mr-1.5" />
                Make it Smaller
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(todo.id)}
            aria-label="Delete todo"
            className="shrink-0 size-9 sm:size-10"
          >
            <Trash2 className="size-4 sm:size-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
