import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { X, Sparkles, Lightbulb } from 'lucide-react';

// A loading spinner specific to this component
function AILoader() {
    return (
        <div className="text-center p-8">
            <Sparkles className="w-12 h-12 text-sky-500 mx-auto animate-pulse" />
            <p className="mt-4 font-semibold text-slate-600">Your AI Career Coach is analyzing the data...</p>
            <p className="text-sm text-slate-500">This may take a moment.</p>
        </div>
    );
}

export default function AITailoringModal({ isOpen, onClose, job, profile }) {
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [error, setError] = useState(null);

    const handleGetSuggestions = async () => {
        if (!job || !profile) {
            setError("A job and a profile must be selected.");
            return;
        }
        setIsLoading(true);
        setSuggestions([]);
        setError(null);

        try {
            const { data, error: functionError } = await supabase.functions.invoke('get-ai-suggestions', {
                body: {
                    resumeContext: profile.resume_context,
                    jobDescription: job.description,
                },
            });

            if (functionError) throw functionError;

            if (data.error) throw new Error(data.error);

            setSuggestions(data.suggestions || []);

        } catch (err) {
            console.error("Error getting AI suggestions:", err);
            setError("Sorry, the AI assistant could not generate suggestions at this time.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-sky-500" />
                        <h2 className="text-xl font-bold text-slate-800">AI Resume Tailoring</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                        <p><span className="font-semibold">Target Job:</span> {job?.title || 'N/A'}</p>
                        <p><span className="font-semibold">Using Profile:</span> {profile?.profile_name || 'N/A'}</p>
                    </div>

                    {isLoading ? (
                        <AILoader />
                    ) : error ? (
                        <p className="text-center text-red-500 p-8">{error}</p>
                    ) : suggestions.length > 0 ? (
                        <div className="space-y-4">
                             <h3 className="font-semibold text-slate-700">Here are your AI-powered suggestions:</h3>
                            {suggestions.map((suggestion, index) => (
                                <div key={index} className="flex items-start gap-3 bg-sky-50/50 p-3 rounded-md border border-sky-200">
                                    <Lightbulb className="w-5 h-5 text-sky-500 mt-1 flex-shrink-0" />
                                    <p className="text-slate-700">{suggestion}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8">
                            <p className="text-slate-600">Click the button below to get personalized suggestions on how to tailor your resume for this job.</p>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                    <button
                        onClick={handleGetSuggestions}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-all disabled:bg-sky-400 disabled:cursor-not-allowed"
                    >
                        <Sparkles className="w-5 h-5" />
                        {isLoading ? 'Generating...' : 'Get AI Suggestions'}
                    </button>
                </div>
            </div>
        </div>
    );
}
