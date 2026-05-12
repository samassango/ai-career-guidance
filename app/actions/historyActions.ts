'use server';

import { createClient } from "@/lib/supabase/server";

export interface SaveRecommendationHistoryParams {
  academicResults: any[];
  skills: string[];
  interests: string[];
  personalityTraits: string[];
  aiResponse: any;
  overallConfidence: number;
}

export async function saveRecommendationHistory(params: SaveRecommendationHistoryParams) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "Not authenticated" };
  }

  const userId = (authData.claims as any).sub;

  const { data, error } = await supabase
    .from("recommendation_history")
    .insert({
      user_id: userId,
      academic_results: params.academicResults,
      skills: params.skills,
      interests: params.interests,
      personality_traits: params.personalityTraits,
      ai_response: params.aiResponse,
      overall_confidence: params.overallConfidence,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving recommendation history:", error);
    return { error: error.message };
  }

  return { data };
}

export async function getRecommendationHistory() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "Not authenticated", data: [] };
  }

  const userId = (authData.claims as any).sub;

  const { data, error } = await supabase
    .from("recommendation_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching recommendation history:", error);
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}

export async function deleteRecommendationHistory(historyId: string) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "Not authenticated" };
  }

  const userId = (authData.claims as any).sub;

  const { error } = await supabase
    .from("recommendation_history")
    .delete()
    .eq("user_id", userId)
    .eq("id", historyId);

  if (error) {
    console.error("Error deleting recommendation history:", error);
    return { error: error.message };
  }

  return { success: true };
}

export interface SaveFeedbackParams {
  historyId: string;
  careerName: string;
  rating: 'helpful' | 'not_helpful';
  comment?: string;
}

export async function saveRecommendationFeedback(params: SaveFeedbackParams) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "Not authenticated" };
  }

  const userId = (authData.claims as any).sub;

  // Check if feedback already exists for this career in this history entry
  const { data: existing } = await supabase
    .from("recommendation_feedback")
    .select("id")
    .eq("history_id", params.historyId)
    .eq("career_name", params.careerName)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    // Update existing feedback
    const { data, error } = await supabase
      .from("recommendation_feedback")
      .update({
        rating: params.rating,
        comment: params.comment || null,
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating feedback:", error);
      return { error: error.message };
    }
    return { data };
  }

  // Insert new feedback
  const { data, error } = await supabase
    .from("recommendation_feedback")
    .insert({
      history_id: params.historyId,
      user_id: userId,
      career_name: params.careerName,
      rating: params.rating,
      comment: params.comment || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving feedback:", error);
    return { error: error.message };
  }

  return { data };
}

export async function getRecommendationFeedback(historyId: string) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "Not authenticated", data: [] };
  }

  const { data, error } = await supabase
    .from("recommendation_feedback")
    .select("*")
    .eq("history_id", historyId);

  if (error) {
    console.error("Error fetching feedback:", error);
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}
