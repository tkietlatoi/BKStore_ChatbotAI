import { Request, Response } from 'express';
import * as inventoryService from '../services/inventory.service';

export const getInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { branchId, search, status, category } = req.query;

    const data = await inventoryService.getInventoryOverview({
      branchId: branchId as string | undefined,
      search: search as string | undefined,
      status: status as any,
      category: category as string | undefined,
    });

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi khi tải thông tin tồn kho',
    });
  }
};

export const updateInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, branchId, quantity } = req.body;

    if (!productId || !branchId || quantity === undefined) {
      res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp đầy đủ: productId, branchId, quantity',
      });
      return;
    }

    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty < 0) {
      res.status(400).json({
        success: false,
        error: 'Số lượng tồn kho phải là số nguyên không âm.',
      });
      return;
    }

    const result = await inventoryService.updateProductBranchStock(productId, branchId, numQty);

    res.json({
      success: true,
      message: 'Cập nhật số lượng tồn kho thành công.',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Lỗi khi cập nhật tồn kho',
    });
  }
};

export const transferStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, fromBranchId, toBranchId, quantity, note } = req.body;

    if (!productId || !fromBranchId || !toBranchId || !quantity) {
      res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp đầy đủ: productId, fromBranchId, toBranchId, quantity',
      });
      return;
    }

    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      res.status(400).json({
        success: false,
        error: 'Số lượng chuyển kho phải lớn hơn 0.',
      });
      return;
    }

    if (fromBranchId === toBranchId) {
      res.status(400).json({
        success: false,
        error: 'Kho xuất và kho nhận không được trùng nhau.',
      });
      return;
    }

    const result = await inventoryService.transferStock(
      productId,
      fromBranchId,
      toBranchId,
      numQty,
      note
    );

    res.json({
      success: true,
      message: `Chuyển kho thành công: đã điều chuyển ${numQty} thiết bị.`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Lỗi điều chuyển kho',
    });
  }
};
