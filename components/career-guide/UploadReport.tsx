import { analysePdfDocument } from "@/app/actions/actions";
import React, { useState } from "react";
import LoadingIndicator from "../ui/loadingIndicator";
import { useDispatch } from "react-redux";
import { addAccademicRecord } from "@/lib/store/slices/academicSlice";
import { findValueByKey, testData } from "@/lib/utils";
import { AlertCircle, RefreshCw, Upload, FileText, CheckCircle } from "lucide-react";

/**
 * Convert a File object to a Base64 string
 * @param file - The File object (from input or drag/drop)
 * @returns Promise<string> - Base64 encoded string
 */
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result as string;
            resolve(result);
        };

        reader.onerror = (error) => reject(error);

        reader.readAsDataURL(file);
    });
}

export const UploadReport: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [documentData, setDocumentData] = useState<any>();
    const dispatch = useDispatch();

    const handleFileUpload = async (e: any) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate file type
        if (selectedFile.type !== "application/pdf") {
            setError("Please upload a PDF file. Other file types are not supported.");
            return;
        }

        // Validate file size (10MB limit)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError("File is too large. Please upload a PDF smaller than 10MB.");
            return;
        }

        setFile(selectedFile);
        setError(null);
        setIsLoading(true);

        try {
            const encoded = await fileToBase64(selectedFile);
            const data = await analysePdfDocument(encoded);

            if (!data) {
                throw new Error("No data returned from document analysis.");
            }

            const parsed = JSON.parse(data);

            if (!parsed || !parsed.modules || parsed.modules.length === 0) {
                throw new Error(
                    "We could not extract any subjects from your document. Please ensure you uploaded a valid academic report."
                );
            }

            setDocumentData(parsed);
            dispatch(addAccademicRecord(parsed));
        } catch (err: unknown) {
            console.error("Upload error:", err);
            if (err instanceof SyntaxError) {
                setError(
                    "We could not read your document. The file may be corrupted or in an unsupported format. Please try a different file."
                );
            } else if (err instanceof Error) {
                if (err.message.includes("Gemini API")) {
                    setError(
                        "The AI service is temporarily unavailable. Please wait a moment and try again."
                    );
                } else {
                    setError(err.message);
                }
            } else {
                setError(
                    "Something went wrong while processing your document. Please try again."
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetry = () => {
        setFile(null);
        setError(null);
        setDocumentData(null);
        // Trigger file input click
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
            input.value = "";
            input.click();
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="w-full max-w-md mx-auto">
                <div className="bg-card rounded-xl p-8 card-shadow border border-border">
                    <div className="flex flex-col items-center text-center">
                        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <FileText className="h-7 w-7 text-primary animate-pulse" />
                        </div>
                        <h4 className="font-semibold mb-1">Analyzing your document...</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            Our AI is extracting your academic results. This may take a few seconds.
                        </p>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-primary rounded-full animate-[loading_2s_ease-in-out_infinite]" style={{
                                width: "70%",
                                animation: "loading 2s ease-in-out infinite"
                            }} />
                        </div>
                        {file && (
                            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                                <Upload className="h-3 w-3" />
                                {file.name}
                            </p>
                        )}
                    </div>
                </div>
                <style jsx>{`
                    @keyframes loading {
                        0% { transform: translateX(-100%); }
                        50% { transform: translateX(40%); }
                        100% { transform: translateX(-100%); }
                    }
                `}</style>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="w-full max-w-md mx-auto">
                <div className="bg-card rounded-xl p-8 card-shadow border border-red-200 dark:border-red-900/30">
                    <div className="flex flex-col items-center text-center">
                        <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                            <AlertCircle className="h-7 w-7 text-red-500" />
                        </div>
                        <h4 className="font-semibold mb-1">Upload Failed</h4>
                        <p className="text-sm text-muted-foreground mb-5 max-w-xs">{error}</p>
                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </button>
                        {file && (
                            <p className="text-xs text-muted-foreground mt-3">
                                File: {file.name}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Default upload state
    return (
        <div
            className="file_upload p-5 relative border-4 border-dotted border-gray-300 rounded-lg"
            style={{ width: "450px" }}
        >
            <svg
                className="text-primary w-24 mx-auto mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
            </svg>
            <div className="input_field flex flex-col w-max mx-auto text-center">
                <label>
                    <input
                        className="text-sm cursor-pointer w-36 hidden"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                    />
                    <div className="text bg-primary text-white border border-gray-300 rounded font-semibold cursor-pointer p-1 px-3 hover:bg-gray-500 dark:text-gray-900">
                        Select
                    </div>
                </label>

                <div className="title text-primary uppercase">or drop files here</div>
            </div>
            {file && (
                <p className="mt-2 text-sm text-black dark:text-white">
                    Selected: {file.name}
                </p>
            )}
        </div>
    );
};
