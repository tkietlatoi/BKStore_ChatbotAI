import { Request, Response } from 'express';
import * as reviewService from '../services/review.service';

export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const review = await reviewService.createReview(req.body);
    res.status(201).json({
      success: true,
      message: 'Đánh giá sản phẩm thành công! Cảm ơn quý khách đã mua sắm tại BK-Store.',
      data: review,
    });
  } catch (error: any) {
    const statusCode = error.status || 400;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Lỗi khi gửi đánh giá sản phẩm',
    });
  }
};

export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string;
    const result = await reviewService.getReviewsByProduct(slug);
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi khi lấy danh sách đánh giá',
    });
  }
};

export const getOrderReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderCode = req.params.orderCode as string;
    const phone = req.query.phone as string;

    if (!phone || !phone.trim()) {
      res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp số điện thoại đặt hàng để xác thực bảo mật.',
      });
      return;
    }

    const reviews = await reviewService.getReviewsByOrder(orderCode, phone.trim());
    res.json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    const statusCode = error.status || 400;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Lỗi khi lấy đánh giá đơn hàng',
    });
  }
};
