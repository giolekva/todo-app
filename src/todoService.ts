import { v4 as uuidv4 } from 'uuid';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from './types';

class TodoService {
  private todos: Todo[] = [];

  getAllTodos(): Todo[] {
    return this.todos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getTodoById(id: string): Todo | undefined {
    return this.todos.find(todo => todo.id === id);
  }

  createTodo(request: CreateTodoRequest): Todo {
    const now = new Date();
    const todo: Todo = {
      id: uuidv4(),
      title: request.title,
      description: request.description,
      completed: false,
      createdAt: now,
      updatedAt: now
    };
    
    this.todos.push(todo);
    return todo;
  }

  updateTodo(id: string, request: UpdateTodoRequest): Todo | null {
    const todo = this.getTodoById(id);
    if (!todo) {
      return null;
    }

    if (request.title !== undefined) {
      todo.title = request.title;
    }
    if (request.description !== undefined) {
      todo.description = request.description;
    }
    if (request.completed !== undefined) {
      todo.completed = request.completed;
    }
    
    todo.updatedAt = new Date();
    return todo;
  }

  deleteTodo(id: string): boolean {
    const index = this.todos.findIndex(todo => todo.id === id);
    if (index === -1) {
      return false;
    }
    
    this.todos.splice(index, 1);
    return true;
  }

  getCompletedTodos(): Todo[] {
    return this.todos.filter(todo => todo.completed);
  }

  getPendingTodos(): Todo[] {
    return this.todos.filter(todo => !todo.completed);
  }
}

export default new TodoService();
