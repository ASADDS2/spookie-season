import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { isCorrectAnswer } from './leaderboard-rules';

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

export const registerPlayer = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ nickname: z.string().trim().min(2).max(24) }))
  .handler(async ({ data }) => {
    const token = crypto.randomUUID() + crypto.randomUUID();
    const tokenHash = await hashToken(token);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: rows, error } = await supabaseAdmin.rpc('register_quiz_guest', { p_nickname: data.nickname, p_hash: tokenHash });
    const player = rows?.[0];
    if (error || !player) throw new Error('No se pudo guardar tu apodo. Intenta de nuevo.');
    return { token, player };
  });

export const creditAnswer = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: z.string().length(72), questionId: z.string().max(40), option: z.number().int().min(0).max(3) }))
  .handler(async ({ data }) => {
    const correct = isCorrectAnswer(data.questionId, data.option);
    const tokenHash = await hashToken(data.token);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: session, error: sessionError } = await supabaseAdmin.from('quiz_guest_sessions').select('player_id').eq('token_hash', tokenHash).maybeSingle();
    if (sessionError || !session) throw new Error('Tu sesión no es válida. Vuelve a entrar con un apodo.');
    const { data: rows, error } = await supabaseAdmin.rpc('credit_quiz_answer', { p_hash: tokenHash, p_question: data.questionId, p_correct: correct });
    const player = rows?.[0];
    if (error || !player) throw new Error('No se pudo guardar el acierto. Intenta de nuevo.');
    return player;
  });