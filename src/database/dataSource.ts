import { DataSource } from 'typeorm';
import { Todo } from '../entities/Todo';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DODO_POSTGRESQL_DB_URL || process.env.DATABASE_URL || 'postgresql://localhost:5432/todoapp',
  synchronize: true, // Auto-create schema in development
  logging: process.env.NODE_ENV !== 'production',
  entities: [Todo],
  migrations: [],
  subscribers: [],
});

export default AppDataSource;
