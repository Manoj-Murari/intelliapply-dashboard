import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { X, Sparkles, Clipboard, Check } from 'lucide-react';

function AILoader() {
    return (
        <div className="text-center p-8">
            <Sparkles className="w-12 h-12 text-sky-500 mx-auto animate-pulse" />
            <p className="mt-4 font-semibold text-slate-600">Your AI co-pilot is writing the first draft...</p>
            <p className="text-sm text-slate-500">This may take a moment.</p>
        </div>
    );
}

export default function AICoverLetterModal({ isOpen, onClose, job, profile }) {
    const [isLoading, setIsLoading] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [error, setError] = useState(null);
    const [hasCopied, setHasCopied] = useState(false);

    const handleGenerateLetter = async () => {
        if (!job || !profile) {
            setError("A job and a profile must be selected.");
            return;
        }
        setIsLoading(true);
        setCoverLetter('');
        setError(null);

        try {
            const { data, error: functionError } = await supabase.functions.invoke('generate-cover-letter', {
                body: {
                    resumeContext: profile.resume_context,
                    jobDescription: job.description,
                    company: job.company,
                    title: job.title,
                },
            });

            if (functionError) throw functionError;
            if (data.error) throw new Error(data.error);

            setCoverLetter(data.coverLetter || '');

        } catch (err) {
            console.error("Error generating cover letter:", err);
            setError("Sorry, the AI assistant could not generate a cover letter at this time.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(coverLetter);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000); // Reset after 2 seconds
    };

    // Reset state when the modal is closed
    const handleClose = () => {
        setCoverLetter('');
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
                        <Sparkles className="w-6 h-6 text-sky-500" />
                        <h2 className="text-xl font-bold text-slate-800">AI Cover Letter Generator</h2>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100"><X className="w-5 h-5 text-slate-600" /></button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                        <p><span className="font-semibold">Target Job:</span> {job?.title || 'N/A'}</p>
                        <p><span className="font-semibold">Using Profile:</span> {profile?.profile_name || 'N/A'}</p>
                    </div>

                    {isLoading ? (
                        <AILoader />
                    ) : error ? (
                        <p className="text-center text-red-500 p-8">{error}</p>
                    ) : coverLetter ? (
                        <div className="bg-slate-100 p-4 rounded-md border prose prose-slate max-w-none">
                            <p style={{ whiteSpace: 'pre-wrap' }}>{coverLetter}</p>
                        </div>
                    ) : (
                        <div className="text-center p-8">
                            <p className="text-slate-600">Click the button below to generate a tailored first draft of your cover letter for this job.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-4">
                    {coverLetter && (
                         <button onClick={handleCopyToClipboard} className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-emerald-700 bg-emerald-100 rounded-md hover:bg-emerald-200 transition-all">
                            {hasCopied ? <><Check className="w-5 h-5" /> Copied!</> : <><Clipboard className="w-5 h-5" /> Copy to Clipboard</>}
                        </button>
                    )}
                    <button
                        onClick={handleGenerateLetter}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-all disabled:bg-sky-400 disabled:cursor-not-allowed"
                    >
                        <Sparkles className="w-5 h-5" />
                        {isLoading ? 'Generating...' : (coverLetter ? 'Regenerate' : 'Generate Cover Letter')}
                    </button>
                </div>
            </div>
        </div>
    );
}
