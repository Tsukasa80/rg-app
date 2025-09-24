import { NextResponse } from 'next/server';
import { createSupabaseServerActionClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createSupabaseServerActionClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [entries, selections, reflections] = await Promise.all([
    supabase.from('activity_entries').select('*').eq('user_id', user.id).order('occurred_at', { ascending: true }),
    supabase
      .from('weekly_selections')
      .select('*')
      .eq('user_id', user.id)
      .order('year', { ascending: true })
      .order('iso_week', { ascending: true }),
    supabase
      .from('weekly_reflections')
      .select('*')
      .eq('user_id', user.id)
      .order('year', { ascending: true })
      .order('iso_week', { ascending: true })
  ]);

  if (entries.error) {
    return NextResponse.json({ error: entries.error.message }, { status: 500 });
  }
  if (selections.error) {
    return NextResponse.json({ error: selections.error.message }, { status: 500 });
  }
  if (reflections.error) {
    return NextResponse.json({ error: reflections.error.message }, { status: 500 });
  }

  const payload = {
    version: '1.0',
    exported_at: new Date().toISOString(),
    user: { id: user.id, email: user.email },
    entries: entries.data,
    weekly_selections: selections.data,
    weekly_reflections: reflections.data
  };

  return NextResponse.json(payload, {
    headers: {
      'Content-Disposition': 'attachment; filename="rg-exercise-export.json"'
    }
  });
}

