import { TodoList } from "@/components/todo-list";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background py-4 sm:py-6 md:py-8 px-3 sm:px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 text-primary">
            Epic Quest Generator
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
            turn your mundane tasks into epic quests
          </p>
        </div>
        <TodoList />
      </div>
    </main>
  );
}
