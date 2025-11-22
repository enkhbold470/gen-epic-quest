export type Subtask = {
  id: string;
  text: string;
  completed: boolean;
};

export type Todo = {
  id: string;
  originalText: string;
  dramaticText: string;
  completed: boolean;
  createdAt: Date;
  subtasks?: Subtask[];
};

