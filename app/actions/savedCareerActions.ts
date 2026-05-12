'use server';

import { createClient } from "@/lib/supabase/server";

export interface SaveCareerParams {
  careerName: string;
  pathway?: string;
  salaryRange?: string;
  demand?: string;
  educationPaths?: string;
  reason?: string;
  confidenceScore?: number;
}

export async function saveCareer(params: SaveCareerParams) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "Not authenticated" };
  }

  const userId = (authData.claims as any).sub;

  const { data, error } = await supabase
    .from("saved_careers")
    .upsert(
      {
        user_id: userId,
        career_name: params.careerName,
        pathway: params.pathway || null,
        salary_range: params.salaryRange || null,
        demand: params.demand || null,
        education_paths: params.educationPaths || null,
        reason: params.reason || null,
        confidence_score: params.confidenceScore || null,
      },
      { onConflict: "user_id,career_name" }
    )
    .select()
    .single();

  if (error) {
    console.error("Error saving career:", error);
    return { error: error.message };
  }

  return { data };
}

export async function unsaveCareer(careerName: string) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "Not authenticated" };
  }

  const userId = (authData.claims as any).sub;

  const { error } = await supabase
    .from("saved_careers")
    .delete()
    .eq("user_id", userId)
    .eq("career_name", careerName);

  if (error) {
    console.error("Error removing saved career:", error);
    return { error: error.message };
  }

  return { success: true };
}

export async function getSavedCareers() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "Not authenticated", data: [] };
  }

  const userId = (authData.claims as any).sub;

  const { data, error } = await supabase
    .from("saved_careers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching saved careers:", error);
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}

export async function getSavedCareerNames() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return { error: "Not authenticated", data: [] };
  }

  const userId = (authData.claims as any).sub;

  const { data, error } = await supabase
    .from("saved_careers")
    .select("career_name")
    .eq("user_id", userId);

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: (data || []).map((d: any) => d.career_name) };
}
