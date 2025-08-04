import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { X, Sparkles, HelpCircle, MessageSquare } from 'lucide-react';

function AILoader() {
    return (
        <div className="text-center p-8">
            <Sparkles className="w-12 h-12 text-purple-500 mx-auto animate-pulse" />
            <p className="mt-4 font-semibold text-slate-600">Your AI co-pilot is preparing your interview questions...</p>
            <p className="text-sm text-slate-500">This may take a moment.</p>
        </div>
    );
}

export default function AIInterviewPrepModal({ isOpen, onClose, job, profile }) {
    const [isLoading, setIsLoading] = useState(false);
    const [prepData, setPrepData] = useState([]);
    const [error, setError] = useState(null);

    const handleGeneratePrep = async () => {
        if (!job || !profile) {
            setError("A job and a profile must be selected.");
            return;
        }
        setIsLoading(true);
        setPrepData([]);
        setError(null);

        try {
            const { data, error: functionError } = await supabase.functions.invoke('generate-interview-prep', {
                body: {
                    resumeContext: profile.resume_context,
                    jobDescription: job.description,
                },
            });

            if (functionError) throw functionError;
            if (data.error) throw new Error(data.error);

            setPrepData(data.interviewPrep || []);

        } catch (err) {
            console.error("Error generating interview prep:", err);
            setError("Sorry, the AI assistant could not generate prep materials at this time.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setPrepData([]);
        setError(null);
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-purple-500" />
                        <h2 className="text-xl font-bold text-slate-800">AI Interview Prep</h2>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100"><X className="w-5 h-5 text-slate-600" /></button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                        <p><span className="font-semibold">Prepping for:</span> {job?.title || 'N/A'}</p>
                        <p><span className="font-semibold">Using Profile:</span> {profile?.profile_name || 'N/A'}</p>
                    </div>

                    {isLoading ? (
                        <AILoader />
                    ) : error ? (
                        <p className="text-center text-red-500 p-8">{error}</p>
                    ) : prepData.length > 0 ? (
                        <div className="space-y-6">
                            {prepData.map((item, index) => (
                                <div key={index}>
                                    <div className="flex items-start gap-3">
                                        <HelpCircle className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                                        <h4 className="font-bold text-slate-800">{item.question}</h4>
                                    </div>
                                    <div className="mt-2 pl-8 border-l-2 border-slate-200 ml-2.5">
                                        <h5 className="font-semibold text-sm text-slate-600 mb-2">Key Talking Points:</h5>
                                        <ul className="space-y-2 list-disc pl-5">
                                            {item.talkingPoints.map((point, pIndex) => (
                                                <li key={pIndex} className="text-sm text-slate-700">{point}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8">
                            <p className="text-slate-600">Click the button below to generate tailored interview questions and talking points for this role.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-end">
                    <button
                        onClick={handleGeneratePrep}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-all disabled:bg-purple-400 disabled:cursor-not-allowed"
                    >
                        <Sparkles className="w-5 h-5" />
                        {isLoading ? 'Generating...' : (prepData.length > 0 ? 'Regenerate' : 'Generate Prep Plan')}
                    </button>
                </div>
            </div>
        </div>
    );
}
