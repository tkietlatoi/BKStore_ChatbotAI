import { Request, Response } from 'express';
import * as branchService from '../services/branch.service';

export const getBranches = async (_req: Request, res: Response): Promise<void> => {
  try {
    const branches = await branchService.getAllBranches();
    res.json({
      success: true,
      data: branches,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi lấy danh sách chi nhánh',
    });
  }
};
