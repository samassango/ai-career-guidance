"use client"

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { useState } from "react";
import AssessmentFlow, { AssessmentData } from "@/components/app-components/AssessmentFlow";
import ResultsDashboard from "@/components/app-components/ResultsDashboard";
import { persistor, store } from "@/lib/store/store";
import LoadingIndicator from "@/components/ui/loadingIndicator";

const AssessmentPage = () => {
  const [view, setView] = useState<"assessment" | "results">("assessment");
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);

  const handleAssessmentComplete = (data: AssessmentData) => {
    setAssessmentData(data);
    setView("results");
  };

  if (view === "results" && assessmentData) {
    return (
      <Provider store={store}>
        <PersistGate loading={<LoadingIndicator message="Loading state..." />} persistor={persistor}>
          <ResultsDashboard
            assessmentData={assessmentData}
            onBack={() => setView("assessment")}
            onRetake={() => setView("assessment")}
          />
        </PersistGate>
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingIndicator message="Loading state..." />} persistor={persistor}>
        <AssessmentFlow
          onComplete={handleAssessmentComplete}
          onBack={() => window.history.back()}
        />
      </PersistGate>
    </Provider>
  );
};

export default AssessmentPage;
