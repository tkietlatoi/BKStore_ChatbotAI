import { Request, Response } from 'express';
import * as brandService from '../services/brand.service';

export const getBrands = async (_req: Request, res: Response): Promise<void> => {
  try {
    const brands = await brandService.getAllBrands();
    res.json({
      success: true,
      data: brands,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi lấy danh sách thương hiệu',
    });
  }
};

export const getBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string;
    const brand = await brandService.getBrandBySlug(slug);

    if (!brand) {
      res.status(404).json({
        success: false,
        error: `Không tìm thấy thương hiệu "${slug}"`,
      });
      return;
    }

    res.json({
      success: true,
      data: brand,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi lấy thông tin thương hiệu',
    });
  }
};
