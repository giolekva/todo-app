import { Repository } from 'typeorm';
import { Todo } from './entities/Todo';
import { CreateTodoRequest, UpdateTodoRequest } from './types';
import AppDataSource from './database/dataSource';

class TodoService {
  private todoRepository: Repository<Todo>;

  constructor() {
    this.todoRepository = AppDataSource.getRepository(Todo);
  }

  async getAllTodos(): Promise<Todo[]> {
    return await this.todoRepository.find({
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async getTodoById(id: string): Promise<Todo | null> {
    return await this.todoRepository.findOne({
      where: { id }
    });
  }

  async createTodo(request: CreateTodoRequest): Promise<Todo> {
    const todo = this.todoRepository.create({
      title: request.title,
      description: request.description,
      completed: false
    });
    
    return await this.todoRepository.save(todo);
  }

  async updateTodo(id: string, request: UpdateTodoRequest): Promise<Todo | null> {
    const todo = await this.getTodoById(id);
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
    
    return await this.todoRepository.save(todo);
  }

  async deleteTodo(id: string): Promise<boolean> {
    const result = await this.todoRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async getCompletedTodos(): Promise<Todo[]> {
    return await this.todoRepository.find({
      where: { completed: true },
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async getPendingTodos(): Promise<Todo[]> {
    return await this.todoRepository.find({
      where: { completed: false },
      order: {
        createdAt: 'DESC'
      }
    });
  }
}

export default new TodoService();
