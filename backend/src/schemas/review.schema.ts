import { z } from 'zod';

export const createReviewSchema = z.object({
  orderCode: z.string().min(1, 'Mã đơn hàng không được để trống'),
  phone: z.string().regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ (cần 10 số bắt đầu bằng 0)'),
  productId: z.string().min(1, 'Mã sản phẩm hoặc slug không được để trống'),
  rating: z
    .number({ invalid_type_error: 'Số sao đánh giá phải là số' })
    .int('Số sao đánh giá phải là số nguyên')
    .min(1, 'Đánh giá tối thiểu 1 sao')
    .max(5, 'Đánh giá tối đa 5 sao'),
  comment: z
    .string()
    .trim()
    .min(5, 'Nội dung đánh giá tối thiểu 5 ký tự')
    .max(1000, 'Nội dung đánh giá tối đa 1000 ký tự'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
