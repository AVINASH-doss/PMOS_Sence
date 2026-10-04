// ============================================================
// PMOS Sense — Database Service
// CRUD operations for assessments and cycle entries
// ============================================================

import { supabase } from '../lib/supabase';
import type { AssessmentInsert, AssessmentRow, CycleEntryInsert, CycleEntryRow, CycleEntryUpdate } from '../types/database';

// ---- Assessments ----

export async function saveAssessment(data: AssessmentInsert): Promise<{ data: AssessmentRow | null; error: string | null }> {
  try {
    const { data: row, error } = await supabase
      .from('assessments')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Save assessment error:', error);
      return { data: null, error: 'Unable to save your assessment. Please try again.' };
    }
    return { data: row, error: null };
  } catch (err) {
    console.error('Save assessment exception:', err);
    return { data: null, error: 'Unable to save your assessment. Please try again.' };
  }
}

export async function getUserAssessments(userId: string): Promise<{ data: AssessmentRow[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch assessments error:', error);
      return { data: [], error: 'Unable to load your assessments.' };
    }
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Fetch assessments exception:', err);
    return { data: [], error: 'Unable to load your assessments.' };
  }
}

export async function getLatestAssessment(userId: string): Promise<{ data: AssessmentRow | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Fetch latest assessment error:', error);
      return { data: null, error: 'Unable to load your latest assessment.' };
    }
    return { data: data || null, error: null };
  } catch (err) {
    console.error('Fetch latest assessment exception:', err);
    return { data: null, error: 'Unable to load your latest assessment.' };
  }
}

export async function updateAssessmentAIAnalysis(
  assessmentId: string,
  aiAnalysis: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('assessments')
      .update({ ai_analysis: aiAnalysis })
      .eq('id', assessmentId);

    if (error) {
      console.error('Update AI analysis error:', error);
      return { error: 'Unable to save AI analysis.' };
    }
    return { error: null };
  } catch (err) {
    console.error('Update AI analysis exception:', err);
    return { error: 'Unable to save AI analysis.' };
  }
}

// ---- Cycle Entries ----

export async function saveCycleEntry(data: CycleEntryInsert): Promise<{ data: CycleEntryRow | null; error: string | null }> {
  try {
    const { data: row, error } = await supabase
      .from('cycle_entries')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Save cycle entry error:', error);
      return { data: null, error: 'Unable to save cycle data. Please try again.' };
    }
    return { data: row, error: null };
  } catch (err) {
    console.error('Save cycle entry exception:', err);
    return { data: null, error: 'Unable to save cycle data. Please try again.' };
  }
}

export async function getUserCycleEntries(userId: string): Promise<{ data: CycleEntryRow[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('cycle_entries')
      .select('*')
      .eq('user_id', userId)
      .order('period_start_date', { ascending: true });

    if (error) {
      console.error('Fetch cycle entries error:', error);
      return { data: [], error: 'Unable to load cycle data.' };
    }
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Fetch cycle entries exception:', err);
    return { data: [], error: 'Unable to load cycle data.' };
  }
}

export async function updateCycleEntry(
  id: string,
  data: CycleEntryUpdate
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('cycle_entries')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Update cycle entry error:', error);
      return { error: 'Unable to update cycle data. Please try again.' };
    }
    return { error: null };
  } catch (err) {
    console.error('Update cycle entry exception:', err);
    return { error: 'Unable to update cycle data. Please try again.' };
  }
}

export async function deleteCycleEntry(id: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('cycle_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete cycle entry error:', error);
      return { error: 'Unable to delete cycle data. Please try again.' };
    }
    return { error: null };
  } catch (err) {
    console.error('Delete cycle entry exception:', err);
    return { error: 'Unable to delete cycle data. Please try again.' };
  }
}
