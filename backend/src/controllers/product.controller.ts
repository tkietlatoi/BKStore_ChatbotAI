import { Request, Response } from 'express';
import * as productService from '../services/product.service';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, brand, minPrice, maxPrice, search, sort, page, limit } = req.query;

    const result = await productService.getProducts({
      category: category as string,
      brand: brand as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      search: search as string,
      sort: sort as any,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    res.json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi lấy danh sách sản phẩm',
    });
  }
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string;
    const product = await productService.getProductBySlug(slug);

    if (!product) {
      res.status(404).json({
        success: false,
        error: `Không tìm thấy sản phẩm "${slug}"`,
      });
      return;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi lấy thông tin chi tiết sản phẩm',
    });
  }
};
