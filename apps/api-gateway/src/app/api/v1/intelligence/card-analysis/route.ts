import { NextRequest, NextResponse } from 'next/server';
import {
  generateCardAnalysis,
  type CardAnalysisInput,
} from '@/lib/intelligence/generate-card-analysis';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CardAnalysisInput;
    if (!body?.cardType || !body?.countryName) {
      return NextResponse.json({ error: 'cardType and countryName required' }, { status: 400 });
    }
    const result = await generateCardAnalysis(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[card-analysis]', err);
    return NextResponse.json({ error: 'Analysis generation failed' }, { status: 500 });
  }
}
