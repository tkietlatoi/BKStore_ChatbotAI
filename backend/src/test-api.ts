import { app } from './app';
import { Server } from 'http';

const TEST_PORT = 5099;
const BASE_URL = `http://localhost:${TEST_PORT}`;

interface TestCase {
  name: string;
  run: () => Promise<void>;
}

const tests: TestCase[] = [
  {
    name: '1. Health Check Endpoint (/api/health)',
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
      const data = await res.json();
      if (data.status !== 'ok') throw new Error(`Expected status 'ok', got ${data.status}`);
    },
  },
  {
    name: '2. Get All Categories (/api/categories)',
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/categories`);
      if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
      const body = await res.json();
      if (!body.success || !Array.isArray(body.data) || body.data.length !== 3) {
        throw new Error(`Expected 3 categories, got ${body.data?.length}`);
      }
    },
  },
  {
    name: '3. Get All Branches (/api/branches)',
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/branches`);
      if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
      const body = await res.json();
      if (!body.success || !Array.isArray(body.data) || body.data.length !== 3) {
        throw new Error(`Expected 3 branches, got ${body.data?.length}`);
      }
    },
  },
  {
    name: '4. Filter Products by Category & Brand (/api/products?category=laptop&brand=Apple)',
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/products?category=laptop&brand=Apple`);
      if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
      const body = await res.json();
      if (!body.success || body.data.length !== 2) {
        throw new Error(`Expected 2 Apple laptops, got ${body.data?.length}`);
      }
      const names = body.data.map((p: any) => p.name);
      if (!names.some((n: string) => n.includes('MacBook Air'))) {
        throw new Error('MacBook Air M3 not found in results');
      }
    },
  },
  {
    name: '5. Product Detail with Branch Inventories (/api/products/:slug)',
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/products/macbook-air-m3-13-16gb-512gb`);
      if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
      const body = await res.json();
      if (!body.success || !body.data.inventories || body.data.inventories.length === 0) {
        throw new Error('Product inventories not returned');
      }
      if (!body.data.specs || !body.data.specs.cpu) {
        throw new Error('Product specs missing CPU info');
      }
    },
  },
  {
    name: '6. Secure Order Lookup (Match Code + Phone: #BK-1024)',
    run: async () => {
      const encodedCode = encodeURIComponent('#BK-1024');
      const res = await fetch(`${BASE_URL}/api/orders/${encodedCode}?phone=0912345678`);
      if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
      const body = await res.json();
      if (!body.success || body.data.customerName !== 'Nguyễn Văn An') {
        throw new Error(`Customer name mismatch, got ${body.data?.customerName}`);
      }
      if (body.data.status !== 'delivered') {
        throw new Error(`Order status mismatch, got ${body.data?.status}`);
      }
    },
  },
  {
    name: '7. Secure Order Lookup Rejection (Wrong Phone Number: 0999999999)',
    run: async () => {
      const encodedCode = encodeURIComponent('#BK-1024');
      const res = await fetch(`${BASE_URL}/api/orders/${encodedCode}?phone=0999999999`);
      if (res.status !== 404) {
        throw new Error(`Security failed: expected 404 for wrong phone, got ${res.status}`);
      }
    },
  },
  {
    name: '8. Create New Order (/api/orders)',
    run: async () => {
      const payload = {
        customerName: 'Hoàng Tuấn Kiệt',
        phone: '0988776655',
        address: 'Đại học Bách Khoa Hà Nội, Số 1 Đại Cồ Việt',
        paymentMethod: 'COD',
        items: [
          {
            productId: 'sony-wh-1000xm5-black',
            quantity: 1,
          },
        ],
      };

      const res = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status !== 201) throw new Error(`Expected status 201, got ${res.status}`);
      const body = await res.json();
      if (!body.success || !body.data.orderCode.startsWith('#BK-')) {
        throw new Error(`Invalid order code returned: ${body.data?.orderCode}`);
      }
      if (body.data.totalAmount !== 6790000) {
        throw new Error(`Total amount mismatch: expected 6790000, got ${body.data?.totalAmount}`);
      }

      // Verify newly created order can be retrieved immediately
      const encodedNewCode = encodeURIComponent(body.data.orderCode);
      const verifyRes = await fetch(`${BASE_URL}/api/orders/${encodedNewCode}?phone=0988776655`);
      if (verifyRes.status !== 200) {
        throw new Error('Failed to retrieve newly created order by code + phone');
      }
    },
  },
  {
    name: '9. Input Validation Rejection (Invalid Phone & Empty Items)',
    run: async () => {
      const invalidPayload = {
        customerName: 'A', // too short (< 2)
        phone: '12345',     // invalid phone format
        address: 'HN',      // too short (< 5)
        paymentMethod: 'INVALID_METHOD',
        items: [],          // empty items
      };

      const res = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPayload),
      });

      if (res.status !== 400) {
        throw new Error(`Validation failed: expected 400 for invalid data, got ${res.status}`);
      }
      const body = await res.json();
      if (body.success !== false || !Array.isArray(body.details)) {
        throw new Error('Expected validation error details array');
      }
    },
  },
];

const runAllTests = async () => {
  console.log('====================================================');
  console.log('🧪 BK-STORE API INTEGRATION TEST SUITE');
  console.log('====================================================\n');

  let server: Server;

  await new Promise<void>((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`📡 Test server listening on ${BASE_URL}\n`);
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      await t.run();
      console.log(`✅ [PASS] ${t.name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [FAIL] ${t.name}`);
      console.error(`   Error: ${err.message}`);
      failed++;
    }
  }

  console.log('\n====================================================');
  console.log(`📊 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');

  await new Promise<void>((resolve) => {
    server.close(() => {
      console.log('🔒 Test server stopped.');
      resolve();
    });
  });

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
