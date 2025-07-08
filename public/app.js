// Todo App Frontend - SPA with Ajax
class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.editingTodoId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTodos();
    }

    bindEvents() {
        // Form submission
        document.getElementById('todo-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Edit form submission
        document.getElementById('edit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateTodo();
        });

        // Modal close on outside click
        document.getElementById('edit-modal').addEventListener('click', (e) => {
            if (e.target.id === 'edit-modal') {
                this.closeEditModal();
            }
        });
    }

    async apiRequest(url, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(url, options);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Request failed');
            }

            return result.data;
        } catch (error) {
            console.error('API Error:', error);
            this.showError(error.message);
            throw error;
        }
    }

    async loadTodos() {
        try {
            this.showLoading(true);
            this.hideError();
            this.todos = await this.apiRequest('/api/todos');
            this.renderTodos();
            this.updateStats();
        } catch (error) {
            console.error('Failed to load todos:', error);
        } finally {
            this.showLoading(false);
        }
    }

    async addTodo() {
        const title = document.getElementById('todo-title').value.trim();
        const description = document.getElementById('todo-description').value.trim();

        if (!title || !description) {
            this.showError('Please fill in both title and description');
            return;
        }

        try {
            const newTodo = await this.apiRequest('/api/todos', 'POST', {
                title,
                description
            });

            this.todos.unshift(newTodo);
            this.renderTodos();
            this.updateStats();
            this.clearForm();
            this.showSuccess('Todo added successfully!');
        } catch (error) {
            console.error('Failed to add todo:', error);
        }
    }

    async deleteTodo(id) {
        if (!confirm('Are you sure you want to delete this todo?')) {
            return;
        }

        try {
            await this.apiRequest(`/api/todos/${id}`, 'DELETE');
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.renderTodos();
            this.updateStats();
            this.showSuccess('Todo deleted successfully!');
        } catch (error) {
            console.error('Failed to delete todo:', error);
        }
    }

    async toggleComplete(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        try {
            const updatedTodo = await this.apiRequest(`/api/todos/${id}`, 'PUT', {
                completed: !todo.completed
            });

            const index = this.todos.findIndex(t => t.id === id);
            this.todos[index] = updatedTodo;
            this.renderTodos();
            this.updateStats();
        } catch (error) {
            console.error('Failed to toggle todo:', error);
        }
    }

    openEditModal(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        this.editingTodoId = id;
        document.getElementById('edit-title').value = todo.title;
        document.getElementById('edit-description').value = todo.description;
        document.getElementById('edit-completed').checked = todo.completed;
        document.getElementById('edit-modal').style.display = 'block';
    }

    closeEditModal() {
        document.getElementById('edit-modal').style.display = 'none';
        this.editingTodoId = null;
    }

    async updateTodo() {
        if (!this.editingTodoId) return;

        const title = document.getElementById('edit-title').value.trim();
        const description = document.getElementById('edit-description').value.trim();
        const completed = document.getElementById('edit-completed').checked;

        if (!title || !description) {
            this.showError('Please fill in both title and description');
            return;
        }

        try {
            const updatedTodo = await this.apiRequest(`/api/todos/${this.editingTodoId}`, 'PUT', {
                title,
                description,
                completed
            });

            const index = this.todos.findIndex(t => t.id === this.editingTodoId);
            this.todos[index] = updatedTodo;
            this.renderTodos();
            this.updateStats();
            this.closeEditModal();
            this.showSuccess('Todo updated successfully!');
        } catch (error) {
            console.error('Failed to update todo:', error);
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderTodos();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            case 'pending':
                return this.todos.filter(todo => !todo.completed);
            default:
                return this.todos;
        }
    }

    renderTodos() {
        const filteredTodos = this.getFilteredTodos();
        const container = document.getElementById('todos-list');
        
        if (filteredTodos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No todos found</h3>
                    <p>Add a new todo to get started!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredTodos.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : ''}">
                <div class="todo-header">
                    <div class="todo-title">${this.escapeHtml(todo.title)}</div>
                    <div class="todo-status">
                        <span class="status-badge ${todo.completed ? 'completed' : 'pending'}">
                            ${todo.completed ? 'Completed' : 'Pending'}
                        </span>
                    </div>
                </div>
                <div class="todo-description">${this.escapeHtml(todo.description)}</div>
                <div class="todo-actions">
                    <button class="btn btn-${todo.completed ? 'secondary' : 'success'}" 
                            onclick="app.toggleComplete('${todo.id}')">
                        ${todo.completed ? 'Mark Pending' : 'Mark Complete'}
                    </button>
                    <button class="btn btn-secondary" onclick="app.openEditModal('${todo.id}')">
                        Edit
                    </button>
                    <button class="btn btn-danger" onclick="app.deleteTodo('${todo.id}')">
                        Delete
                    </button>
                </div>
                <div class="todo-dates">
                    <span>Created: ${this.formatDate(todo.createdAt)}</span>
                    <span>Updated: ${this.formatDate(todo.updatedAt)}</span>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;

        document.getElementById('total-count').textContent = total;
        document.getElementById('completed-count').textContent = completed;
        document.getElementById('pending-count').textContent = pending;
    }

    clearForm() {
        document.getElementById('todo-title').value = '';
        document.getElementById('todo-description').value = '';
    }

    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
    }

    showError(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    hideError() {
        document.getElementById('error').style.display = 'none';
    }

    showSuccess(message) {
        // Create temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success';
        successDiv.textContent = message;
        
        const container = document.querySelector('.container');
        container.insertBefore(successDiv, container.firstChild);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for onclick handlers
function closeEditModal() {
    app.closeEditModal();
}

// Initialize the app
const app = new TodoApp();
