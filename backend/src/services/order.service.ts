import { pool, checkDbConnection } from '../config/db';
import { sampleOrders as fallbackOrders, products as fallbackProducts } from '../db/seedData';
import { CreateOrderInput } from '../schemas/order.schema';

// In-memory store for newly created orders when running without DB
const inMemoryOrders: any[] = [...fallbackOrders];

const generateOrderCode = (): string => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `#BK-${randomNum}`;
};

export const createOrder = async (input: CreateOrderInput) => {
  const orderCode = generateOrderCode();
  const isDbConnected = await checkDbConnection();

  if (!isDbConnected) {
    // In-memory fallback
    let totalAmount = 0;
    const itemsWithDetails: any[] = [];

    for (const item of input.items) {
      const prod = fallbackProducts.find(
        (p) => p.id === item.productId || p.slug === item.productId
      );
      if (!prod) {
        throw new Error(`Sản phẩm với ID/Slug "${item.productId}" không tồn tại.`);
      }
      const itemTotal = prod.price * item.quantity;
      totalAmount += itemTotal;
      itemsWithDetails.push({
        productId: prod.id,
        productName: prod.name,
        quantity: item.quantity,
        unitPrice: prod.price,
      });
    }

    const newOrder = {
      id: `order-${Date.now()}`,
      orderCode,
      customerName: input.customerName,
      phone: input.phone,
      address: input.address,
      note: input.note || '',
      totalAmount,
      paymentMethod: input.paymentMethod,
      status: 'pending',
      trackingInfo: 'Đơn hàng mới tạo, đang chờ quản trị viên duyệt kho.',
      createdAt: new Date().toISOString(),
      items: itemsWithDetails,
    };

    inMemoryOrders.unshift(newOrder);
    return newOrder;
  }

  // Database transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let calculatedTotal = 0;
    const itemsToInsert: { productId: string; productName: string; quantity: number; unitPrice: number }[] = [];

    for (const item of input.items) {
      // Find product by id or slug
      const pRes = await client.query(
        'SELECT id, name, price, stock_quantity FROM products WHERE id::text = $1 OR slug = $1',
        [item.productId]
      );
      if (pRes.rows.length === 0) {
        throw new Error(`Sản phẩm với ID/Slug "${item.productId}" không tồn tại.`);
      }

      const product = pRes.rows[0];
      const unitPrice = parseFloat(product.price);
      calculatedTotal += unitPrice * item.quantity;

      itemsToInsert.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
      });
    }

    const orderRes = await client.query(
      `INSERT INTO orders (
        order_code, customer_name, phone, address, note,
        total_amount, payment_method, status, tracking_info
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', 'Đơn hàng mới tạo, đang chờ duyệt kho.')
      RETURNING *`,
      [
        orderCode,
        input.customerName,
        input.phone,
        input.address,
        input.note || null,
        calculatedTotal,
        input.paymentMethod,
      ]
    );

    const createdOrder = orderRes.rows[0];

    for (const item of itemsToInsert) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [createdOrder.id, item.productId, item.productName, item.quantity, item.unitPrice]
      );
    }

    await client.query('COMMIT');

    return {
      ...createdOrder,
      items: itemsToInsert,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getOrderByCodeAndPhone = async (orderCode: string, phone: string) => {
  // Normalize order code (ensure leading # if missing)
  const normalizedCode = orderCode.startsWith('#') ? orderCode : `#${orderCode}`;
  const isDbConnected = await checkDbConnection();

  if (!isDbConnected) {
    const order = inMemoryOrders.find(
      (o) =>
        o.orderCode.toLowerCase() === normalizedCode.toLowerCase() &&
        o.phone.trim() === phone.trim()
    );
    return order || null;
  }

  const query = `
    SELECT 
      o.id, o.order_code as "orderCode", o.customer_name as "customerName",
      o.phone, o.address, o.note, o.total_amount as "totalAmount",
      o.payment_method as "paymentMethod", o.status, o.tracking_info as "trackingInfo",
      o.created_at as "createdAt",
      COALESCE(
        json_agg(
          json_build_object(
            'productId', oi.product_id,
            'productName', oi.product_name,
            'quantity', oi.quantity,
            'unitPrice', oi.unit_price
          )
        ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json
      ) as items
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE LOWER(o.order_code) = LOWER($1) AND o.phone = $2
    GROUP BY o.id
  `;

  const res = await pool.query(query, [normalizedCode, phone.trim()]);
  return res.rows[0] || null;
};

export const updateOrderStatus = async (
  orderCode: string,
  status: string,
  trackingInfo?: string
) => {
  const normalizedCode = orderCode.startsWith('#') ? orderCode : `#${orderCode}`;
  const isDbConnected = await checkDbConnection();

  if (!isDbConnected) {
    const order = inMemoryOrders.find(
      (o) => o.orderCode.toLowerCase() === normalizedCode.toLowerCase()
    );
    if (!order) return null;
    order.status = status;
    if (trackingInfo) order.trackingInfo = trackingInfo;
    return order;
  }

  const query = `
    UPDATE orders
    SET 
      status = $1,
      tracking_info = COALESCE($2, tracking_info),
      updated_at = CURRENT_TIMESTAMP
    WHERE LOWER(order_code) = LOWER($3)
    RETURNING *
  `;

  const res = await pool.query(query, [status, trackingInfo || null, normalizedCode]);
  return res.rows[0] || null;
};
