"use client";

import { useState } from "react";
import { Button } from "@/components/app-components/ui/button";
import { ThumbsUp, ThumbsDown, Send, Check, MessageSquare } from "lucide-react";
import { saveRecommendationFeedback } from "@/app/actions/historyActions";

interface FeedbackCardProps {
  historyId: string | null;
  careerName: string;
}

const FeedbackCard = ({ historyId, careerName }: FeedbackCardProps) => {
  const [rating, setRating] = useState<"helpful" | "not_helpful" | null>(null);
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleRating = async (value: "helpful" | "not_helpful") => {
    setRating(value);
    if (!showComment) {
      // Auto-submit if no comment box is open
      await submitFeedback(value, "");
    }
  };

  const submitFeedback = async (
    ratingValue: "helpful" | "not_helpful",
    commentValue: string
  ) => {
    if (!historyId) {
      console.warn("No history ID available for feedback");
      return;
    }

    setSaving(true);
    const result = await saveRecommendationFeedback({
      historyId,
      careerName,
      rating: ratingValue,
      comment: commentValue || undefined,
    });

    setSaving(false);

    if (result.error) {
      console.error("Failed to save feedback:", result.error);
    } else {
      setSubmitted(true);
    }
  };

  const handleSubmitWithComment = async () => {
    if (!rating) return;
    await submitFeedback(rating, comment);
  };

  if (submitted) {
    return (
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 text-sm text-emerald-500">
          <Check className="h-4 w-4" />
          <span className="font-medium">Thank you for your feedback!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-border/50">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-muted-foreground font-medium">
          Was this recommendation helpful?
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant={rating === "helpful" ? "default" : "outline"}
            size="sm"
            onClick={() => handleRating("helpful")}
            disabled={saving}
            className={`text-xs gap-1.5 transition-all ${
              rating === "helpful"
                ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500"
                : "hover:border-emerald-500/50 hover:text-emerald-500"
            }`}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            Helpful
          </Button>
          <Button
            variant={rating === "not_helpful" ? "default" : "outline"}
            size="sm"
            onClick={() => handleRating("not_helpful")}
            disabled={saving}
            className={`text-xs gap-1.5 transition-all ${
              rating === "not_helpful"
                ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
                : "hover:border-red-400/50 hover:text-red-400"
            }`}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            Not Helpful
          </Button>
          {!showComment && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComment(true)}
              className="text-xs gap-1.5 text-muted-foreground"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Add Comment
            </Button>
          )}
        </div>
      </div>

      {/* Optional Comment */}
      {showComment && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us more about this recommendation..."
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-border bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
          />
          <Button
            size="sm"
            onClick={handleSubmitWithComment}
            disabled={!rating || saving}
            className="gap-1.5 text-xs"
          >
            <Send className="h-3.5 w-3.5" />
            {saving ? "Sending..." : "Send"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FeedbackCard;
