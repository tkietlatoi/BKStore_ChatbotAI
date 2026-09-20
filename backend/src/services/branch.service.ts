import { pool, checkDbConnection } from '../config/db';
import { branches as fallbackBranches } from '../db/seedData';

export const getAllBranches = async () => {
  const isDbConnected = await checkDbConnection();
  if (!isDbConnected) {
    return fallbackBranches;
  }

  const query = `
    SELECT id, name, city, address, phone, created_at
    FROM branches
    ORDER BY city ASC
  `;
  const res = await pool.query(query);
  return res.rows;
};
