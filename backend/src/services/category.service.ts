import { pool, checkDbConnection } from '../config/db';
import { categories as fallbackCategories } from '../db/seedData';

export const getAllCategories = async () => {
  const isDbConnected = await checkDbConnection();
  if (!isDbConnected) {
    return fallbackCategories.map((c) => ({
      ...c,
      productCount: 5,
    }));
  }

  const query = `
    SELECT 
      c.id, c.name, c.slug, c.description, c.created_at,
      COUNT(p.id)::int as product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at ASC
  `;
  const res = await pool.query(query);
  return res.rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    productCount: r.product_count,
  }));
};

export const getCategoryBySlug = async (slug: string) => {
  const isDbConnected = await checkDbConnection();
  if (!isDbConnected) {
    const cat = fallbackCategories.find((c) => c.slug === slug);
    return cat || null;
  }

  const query = `
    SELECT id, name, slug, description, created_at
    FROM categories
    WHERE slug = $1
  `;
  const res = await pool.query(query, [slug]);
  return res.rows[0] || null;
};
