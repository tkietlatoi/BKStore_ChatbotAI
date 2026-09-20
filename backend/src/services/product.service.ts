import { pool, checkDbConnection } from '../config/db';
import { products as fallbackProducts, branches as fallbackBranches } from '../db/seedData';

export interface ProductFilterOptions {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
}

export const getProducts = async (options: ProductFilterOptions) => {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Math.min(50, Number(options.limit) || 12));
  const offset = (page - 1) * limit;

  const isDbConnected = await checkDbConnection();
  if (!isDbConnected) {
    // In-memory fallback
    let filtered = [...fallbackProducts];

    if (options.category) {
      filtered = filtered.filter((p) => p.categorySlug.toLowerCase() === options.category?.toLowerCase());
    }
    if (options.brand) {
      filtered = filtered.filter((p) => p.brand.toLowerCase() === options.brand?.toLowerCase());
    }
    if (options.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= (options.minPrice || 0));
    }
    if (options.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= (options.maxPrice || Infinity));
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          JSON.stringify(p.specs).toLowerCase().includes(q)
      );
    }

    // Sorting
    if (options.sort === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (options.sort === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      products: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // PostgreSQL Query
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIdx = 1;

  if (options.category) {
    conditions.push(`c.slug = $${paramIdx++}`);
    params.push(options.category);
  }

  if (options.brand) {
    conditions.push(`LOWER(p.brand) = LOWER($${paramIdx++})`);
    params.push(options.brand);
  }

  if (options.minPrice !== undefined) {
    conditions.push(`p.price >= $${paramIdx++}`);
    params.push(options.minPrice);
  }

  if (options.maxPrice !== undefined) {
    conditions.push(`p.price <= $${paramIdx++}`);
    params.push(options.maxPrice);
  }

  if (options.search) {
    conditions.push(`(p.name ILIKE $${paramIdx} OR p.description ILIKE $${paramIdx} OR p.specs::text ILIKE $${paramIdx})`);
    params.push(`%${options.search}%`);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderBy = 'ORDER BY p.created_at DESC';
  if (options.sort === 'price_asc') {
    orderBy = 'ORDER BY p.price ASC';
  } else if (options.sort === 'price_desc') {
    orderBy = 'ORDER BY p.price DESC';
  }

  // Count total
  const countQuery = `
    SELECT COUNT(p.id)::int as total
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
  `;
  const countRes = await pool.query(countQuery, params);
  const total = countRes.rows[0].total;

  // Query products
  const dataQuery = `
    SELECT 
      p.id, p.name, p.slug, p.brand, p.price, p.original_price,
      p.stock_quantity, p.thumbnail, p.images, p.specs, p.description,
      p.warranty_months, p.created_at,
      c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
    ${orderBy}
    LIMIT $${paramIdx++} OFFSET $${paramIdx++}
  `;
  params.push(limit, offset);

  const dataRes = await pool.query(dataQuery, params);

  return {
    products: dataRes.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProductBySlug = async (slug: string) => {
  const isDbConnected = await checkDbConnection();
  if (!isDbConnected) {
    const prod = fallbackProducts.find((p) => p.slug === slug);
    if (!prod) return null;

    // Attach mock branch inventories
    const inventories = fallbackBranches.map((b, idx) => ({
      branchId: b.id,
      branchName: b.name,
      city: b.city,
      address: b.address,
      quantity: ((idx + 2) * 3) % 10 + 2,
    }));

    return {
      ...prod,
      inventories,
    };
  }

  const query = `
    SELECT 
      p.id, p.name, p.slug, p.brand, p.price, p.original_price,
      p.stock_quantity, p.thumbnail, p.images, p.specs, p.description,
      p.warranty_months, p.created_at,
      c.name as category_name, c.slug as category_slug,
      COALESCE(
        json_agg(
          json_build_object(
            'branchId', b.id,
            'branchName', b.name,
            'city', b.city,
            'address', b.address,
            'quantity', inv.quantity
          )
        ) FILTER (WHERE b.id IS NOT NULL), '[]'::json
      ) as inventories
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN inventories inv ON inv.product_id = p.id
    LEFT JOIN branches b ON inv.branch_id = b.id
    WHERE p.slug = $1
    GROUP BY p.id, c.name, c.slug
  `;

  const res = await pool.query(query, [slug]);
  return res.rows[0] || null;
};
