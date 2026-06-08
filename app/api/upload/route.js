import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdminAuthenticated } from '../../lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request) {
  try {
    // 1. Verify admin session
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Verify Supabase configuration
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are not configured.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Parse form data
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // 4. Convert file to binary buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 5. Generate a unique, sanitized file name
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${sanitizedName}`;

    // 6. Upload file buffer to Supabase Storage bucket
    const { error } = await supabase.storage
      .from('agrow-uploads')
      .upload(filename, buffer, {
        contentType: file.type,
        duplex: 'half'
      });

    if (error) {
      throw error;
    }

    // 7. Get public URL of the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('agrow-uploads')
      .getPublicUrl(filename);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
