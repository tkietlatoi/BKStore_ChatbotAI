import { Request, Response } from 'express';
import * as orderService from '../services/order.service';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await orderService.createOrder(req.body);
    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công!',
      data: order,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Lỗi khi tạo đơn hàng',
    });
  }
};

export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderCode = req.params.orderCode as string;
    const { phone } = req.query;

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp số điện thoại đã dùng đặt hàng để xác thực bảo mật.',
      });
      return;
    }

    const order = await orderService.getOrderByCodeAndPhone(orderCode, phone.trim());

    if (!order) {
      res.status(404).json({
        success: false,
        error: `Không tìm thấy đơn hàng "${orderCode}" khớp với số điện thoại đã nhập.`,
      });
      return;
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi khi tra cứu đơn hàng',
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderCode = req.params.orderCode as string;
    const { status, trackingInfo } = req.body;

    const updated = await orderService.updateOrderStatus(orderCode, status, trackingInfo);

    if (!updated) {
      res.status(404).json({
        success: false,
        error: `Không tìm thấy đơn hàng "${orderCode}" để cập nhật.`,
      });
      return;
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công!',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi khi cập nhật trạng thái đơn hàng',
    });
  }
};
