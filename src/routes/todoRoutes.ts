import { Router, Request, Response } from 'express';
import todoService from '../todoService';
import { CreateTodoRequest, UpdateTodoRequest, ApiResponse } from '../types';

const router = Router();

// GET /api/todos - Get all todos
router.get('/', (req: Request, res: Response) => {
  try {
    const todos = todoService.getAllTodos();
    const response: ApiResponse<typeof todos> = {
      success: true,
      data: todos
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch todos'
    };
    res.status(500).json(response);
  }
});

// GET /api/todos/:id - Get todo by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const todo = todoService.getTodoById(req.params.id);
    if (!todo) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Todo not found'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<typeof todo> = {
      success: true,
      data: todo
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch todo'
    };
    res.status(500).json(response);
  }
});

// POST /api/todos - Create new todo
router.post('/', (req: Request, res: Response) => {
  try {
    const createRequest: CreateTodoRequest = req.body;
    
    if (!createRequest.title || !createRequest.description) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Title and description are required'
      };
      return res.status(400).json(response);
    }
    
    const todo = todoService.createTodo(createRequest);
    const response: ApiResponse<typeof todo> = {
      success: true,
      data: todo
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to create todo'
    };
    res.status(500).json(response);
  }
});

// PUT /api/todos/:id - Update todo
router.put('/:id', (req: Request, res: Response) => {
  try {
    const updateRequest: UpdateTodoRequest = req.body;
    const todo = todoService.updateTodo(req.params.id, updateRequest);
    
    if (!todo) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Todo not found'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<typeof todo> = {
      success: true,
      data: todo
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to update todo'
    };
    res.status(500).json(response);
  }
});

// DELETE /api/todos/:id - Delete todo
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const success = todoService.deleteTodo(req.params.id);
    
    if (!success) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Todo not found'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<null> = {
      success: true
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to delete todo'
    };
    res.status(500).json(response);
  }
});

export default router;
