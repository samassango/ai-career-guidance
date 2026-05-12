"use client";

import { useState } from "react";
import { Button } from "@/components/app-components/ui/button";
import { Heart } from "lucide-react";
import { saveCareer, unsaveCareer } from "@/app/actions/savedCareerActions";

interface SaveCareerButtonProps {
  careerName: string;
  pathway?: string;
  salaryRange?: string;
  demand?: string;
  educationPaths?: string;
  reason?: string;
  confidenceScore?: number;
  initialSaved?: boolean;
}

const SaveCareerButton = ({
  careerName,
  pathway,
  salaryRange,
  demand,
  educationPaths,
  reason,
  confidenceScore,
  initialSaved = false,
}: SaveCareerButtonProps) => {
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);

  const handleToggle = async () => {
    setSaving(true);

    if (saved) {
      const result = await unsaveCareer(careerName);
      if (!result.error) {
        setSaved(false);
      }
    } else {
      const result = await saveCareer({
        careerName,
        pathway,
        salaryRange,
        demand,
        educationPaths,
        reason,
        confidenceScore,
      });
      if (!result.error) {
        setSaved(true);
      }
    }

    setSaving(false);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={saving}
      className={`gap-1.5 text-xs transition-all ${
        saved
          ? "text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
          : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
      }`}
    >
      <Heart
        className={`h-4 w-4 transition-all ${saved ? "fill-rose-500" : ""}`}
      />
      {saving ? "Saving..." : saved ? "Saved" : "Save Career"}
    </Button>
  );
};

export default SaveCareerButton;
