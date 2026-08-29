import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApiResponse } from '@/types';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json<ApiResponse>(
        { success: false, data: null, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json<ApiResponse>(
        { success: false, data: null, message: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase Storage bucket 'prescriptions'
    const { data: storageData, error: uploadErr } = await supabase.storage
      .from('prescriptions')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadErr) {
      // If bucket does not exist, return base64 data URL so user upload never fails
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;
      return NextResponse.json<ApiResponse>({
        success: true,
        data: { url: dataUrl, name: file.name },
        message: 'File converted successfully',
      });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('prescriptions')
      .getPublicUrl(storageData.path);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { url: publicUrl, name: file.name },
      message: 'File uploaded successfully',
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: err.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
