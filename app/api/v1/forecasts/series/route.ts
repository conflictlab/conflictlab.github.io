import { NextResponse } from 'next/server'
import { getEntitySeries } from '@/lib/forecasts'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const entity = searchParams.get('entity')
  if (!entity) {
    return NextResponse.json({ error: 'Missing required query param: entity' }, { status: 400 })
  }
  const series = getEntitySeries(entity)
  return NextResponse.json({ entity, series })
}

