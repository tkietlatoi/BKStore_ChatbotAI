import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Helper to determine the products upload directory
async function getUploadDir(): Promise<string> {
  const cwd = process.cwd();
  const candidate1 = path.join(cwd, 'public', 'products');
  const candidate2 = path.join(cwd, 'frontend', 'public', 'products');

  try {
    await fs.access(candidate1);
    return candidate1;
  } catch {
    try {
      await fs.access(candidate2);
      return candidate2;
    } catch {
      // Create candidate1 by default
      await fs.mkdir(candidate1, { recursive: true });
      return candidate1;
    }
  }
}

// Allowed image extensions
const ALLOWED_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.avif']);

// GET: Lấy danh sách các ảnh hiện có trong folder public/products
export async function GET() {
  try {
    const uploadDir = await getUploadDir();
    const entries = await fs.readdir(uploadDir, { withFileTypes: true });

    const imageFiles = entries
      .filter((ent) => {
        if (!ent.isFile()) return false;
        const ext = path.extname(ent.name).toLowerCase();
        return ALLOWED_EXTS.has(ext);
      })
      .map((ent) => ({
        name: ent.name,
        url: `/products/${ent.name}`,
      }));

    return NextResponse.json({
      success: true,
      data: imageFiles,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi đọc thư mục ảnh';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST: Tải ảnh mới lên thư mục public/products
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy file ảnh được gửi lên' },
        { status: 400 }
      );
    }

    // Check extension
    const originalName = file.name || 'uploaded_image.png';
    const ext = path.extname(originalName).toLowerCase();

    if (!ALLOWED_EXTS.has(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: `Định dạng '${ext}' không được hỗ trợ. Vui lòng chọn ảnh (.jpg, .jpeg, .png, .webp, .svg, .gif)`,
        },
        { status: 400 }
      );
    }

    // Limit size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Kích thước file vượt quá giới hạn cho phép (10MB)' },
        { status: 400 }
      );
    }

    // Sanitize filename
    const baseName = path.basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 50);

    const timestamp = Date.now();
    const filename = `${baseName}_${timestamp}${ext}`;

    const uploadDir = await getUploadDir();
    const filePath = path.join(uploadDir, filename);

    // Write file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/products/${filename}`;

    return NextResponse.json({
      success: true,
      data: {
        filename,
        url: publicUrl,
        size: file.size,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi khi lưu file ảnh';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
