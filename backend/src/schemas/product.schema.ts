import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự'),
  slug: z.string().optional(),
  categorySlug: z.string().min(1, 'Danh mục không được để trống'),
  brand: z.string().min(1, 'Thương hiệu không được để trống'),
  price: z.number().positive('Giá bán phải lớn hơn 0'),
  originalPrice: z.number().positive('Giá gốc phải lớn hơn 0').optional(),
  stockQuantity: z.number().int().nonnegative('Số lượng tồn kho không được âm').default(10),
  thumbnail: z.string().min(1, 'Ảnh sản phẩm không được để trống'),
  images: z.array(z.string()).optional().default([]),
  specs: z.record(z.string(), z.any()).optional().default({}),
  description: z.string().min(5, 'Mô tả chi tiết tối thiểu 5 ký tự'),
  warrantyMonths: z.number().int().nonnegative('Thời gian bảo hành không được âm').default(12),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
