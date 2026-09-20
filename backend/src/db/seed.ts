import { pool } from '../config/db';
import { categories, branches, products, sampleOrders, sampleKnowledgePolicies } from './seedData';

export const seedDatabase = async () => {
  console.log('🌱 Starting Database Seeding...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Seed Categories
    console.log('📦 Seeding Categories...');
    for (const cat of categories) {
      await client.query(
        `INSERT INTO categories (id, name, slug, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE 
         SET name = EXCLUDED.name, description = EXCLUDED.description`,
        [cat.id, cat.name, cat.slug, cat.description]
      );
    }
    console.log(`✅ Seeded ${categories.length} categories.`);

    // 2. Seed Branches
    console.log('🏢 Seeding Branches...');
    for (const branch of branches) {
      await client.query(
        `INSERT INTO branches (id, name, city, address, phone)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE 
         SET name = EXCLUDED.name, city = EXCLUDED.city, address = EXCLUDED.address, phone = EXCLUDED.phone`,
        [branch.id, branch.name, branch.city, branch.address, branch.phone]
      );
    }
    console.log(`✅ Seeded ${branches.length} branches.`);

    // 3. Seed Products
    console.log('💻 Seeding Products...');
    // Query category id map
    const catRes = await client.query('SELECT id, slug FROM categories');
    const catMap = new Map<string, string>();
    catRes.rows.forEach((r) => catMap.set(r.slug, r.id));

    for (const prod of products) {
      const catId = catMap.get(prod.categorySlug);
      await client.query(
        `INSERT INTO products (
          id, category_id, name, slug, brand, price, original_price,
          stock_quantity, thumbnail, images, specs, description, warranty_months
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (slug) DO UPDATE 
        SET 
          name = EXCLUDED.name,
          brand = EXCLUDED.brand,
          price = EXCLUDED.price,
          original_price = EXCLUDED.original_price,
          thumbnail = EXCLUDED.thumbnail,
          images = EXCLUDED.images,
          specs = EXCLUDED.specs,
          description = EXCLUDED.description,
          warranty_months = EXCLUDED.warranty_months`,
        [
          prod.id,
          catId,
          prod.name,
          prod.slug,
          prod.brand,
          prod.price,
          prod.originalPrice,
          0, // Stock will be updated from inventories
          prod.thumbnail,
          JSON.stringify(prod.images),
          JSON.stringify(prod.specs),
          prod.description,
          prod.warrantyMonths,
        ]
      );
    }
    console.log(`✅ Seeded ${products.length} products.`);

    // 4. Seed Inventories (Distribute stock across branches)
    console.log('📊 Seeding Inventories across branches...');
    let totalInventoryRecords = 0;
    for (let i = 0; i < products.length; i++) {
      const prod = products[i];
      let totalStockForProd = 0;

      for (let j = 0; j < branches.length; j++) {
        const branch = branches[j];
        // Generate realistic stock: between 3 and 12 units per branch
        const quantity = ((i * 3 + j * 7) % 10) + 3;
        totalStockForProd += quantity;

        await client.query(
          `INSERT INTO inventories (product_id, branch_id, quantity)
           VALUES ($1, $2, $3)
           ON CONFLICT (product_id, branch_id) DO UPDATE
           SET quantity = EXCLUDED.quantity`,
          [prod.id, branch.id, quantity]
        );
        totalInventoryRecords++;
      }

      // Update total stock on product
      await client.query(
        'UPDATE products SET stock_quantity = $1 WHERE id = $2',
        [totalStockForProd, prod.id]
      );
    }
    console.log(`✅ Seeded ${totalInventoryRecords} inventory allocations.`);

    // 5. Seed Sample Orders
    console.log('🛒 Seeding Sample Orders & Tracking...');
    for (const order of sampleOrders) {
      const orderRes = await client.query(
        `INSERT INTO orders (
          order_code, customer_name, phone, address, note,
          total_amount, payment_method, status, tracking_info
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (order_code) DO UPDATE
        SET 
          customer_name = EXCLUDED.customer_name,
          phone = EXCLUDED.phone,
          address = EXCLUDED.address,
          status = EXCLUDED.status,
          tracking_info = EXCLUDED.tracking_info
        RETURNING id`,
        [
          order.orderCode,
          order.customerName,
          order.phone,
          order.address,
          order.note,
          order.totalAmount,
          order.paymentMethod,
          order.status,
          order.trackingInfo,
        ]
      );

      const orderId = orderRes.rows[0].id;

      // Delete old order items if updating
      await client.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);

      for (const item of order.items) {
        const pRes = await client.query(
          'SELECT id, name FROM products WHERE slug = $1',
          [item.productSlug]
        );
        if (pRes.rows.length > 0) {
          const product = pRes.rows[0];
          await client.query(
            `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
             VALUES ($1, $2, $3, $4, $5)`,
            [orderId, product.id, product.name, item.quantity, item.unitPrice]
          );
        }
      }
    }
    console.log(`✅ Seeded ${sampleOrders.length} sample orders with order items.`);

    // 6. Seed Sample Knowledge Policies
    console.log('📚 Seeding Knowledge Policies...');
    for (const policy of sampleKnowledgePolicies) {
      const docRes = await client.query(
        `INSERT INTO knowledge_documents (title, category, source_file)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [policy.title, policy.category, `${policy.category}.md`]
      );

      const docId = docRes.rows[0].id;

      await client.query(
        `INSERT INTO knowledge_chunks (document_id, chunk_index, content, metadata)
         VALUES ($1, $2, $3, $4)`,
        [
          docId,
          0,
          policy.content,
          JSON.stringify({ title: policy.title, category: policy.category }),
        ]
      );
    }
    console.log(`✅ Seeded ${sampleKnowledgePolicies.length} knowledge policies.`);

    await client.query('COMMIT');
    console.log('🎉 Database Seeding completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Auto-run if executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✨ Seed script finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('💥 Fatal error during seeding:', err);
      process.exit(1);
    });
}
