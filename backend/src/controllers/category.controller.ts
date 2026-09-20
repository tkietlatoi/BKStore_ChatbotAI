import { Request, Response } from 'express';
import * as categoryService from '../services/category.service';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi lấy danh sách danh mục',
    });
  }
};

export const getCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string;
    const category = await categoryService.getCategoryBySlug(slug);

    if (!category) {
      res.status(404).json({
        success: false,
        error: `Không tìm thấy danh mục "${slug}"`,
      });
      return;
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi lấy thông tin danh mục',
    });
  }
};
