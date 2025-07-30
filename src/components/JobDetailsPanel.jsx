import React, { useState, useEffect } from 'react';
import { ChevronLeft, X, ExternalLink, Sparkles, Clipboard, ClipboardCheck } from 'lucide-react';

export default function JobDetailsPanel({ job, setSelectedJob, activeProfile }) {
    const [generatedLetter, setGeneratedLetter] = useState('');
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    // Reset state when the selected job changes
    useEffect(() => {
        setGeneratedLetter('');
        setError('');
        setCopied(false);
    }, [job]);

    // The core function to generate the cover letter via Gemini API
    const generateCoverLetter = async () => {
        if (!activeProfile) {
            setError("Please create and save a resume profile before generating a cover letter.");
            return;
        }

        setGenerating(true);
        setError('');
        setGeneratedLetter('');

        // Construct the prompt for the Gemini API
        const prompt = `
            Act as a professional career coach and expert copywriter. Your task is to write a compelling, concise, and professional cover letter.

            **Instructions:**
            1.  Use the provided "Candidate's Resume Context" to understand the candidate's skills, experience, and strengths.
            2.  Tailor the letter specifically to the "Job Description".
            3.  Directly address the key requirements mentioned in the job description and highlight how the candidate's experience aligns with them.
            4.  Maintain a professional and enthusiastic tone.
            5.  Keep the letter concise, ideally between 3-4 paragraphs.
            6.  Do not include placeholders like "[Your Name]" or "[Company Name]". The letter should be ready to use.

            ---CANDIDATE'S RESUME CONTEXT---
            ${activeProfile.resume_context}

            ---JOB DESCRIPTION---
            Title: ${job.title}
            Company: ${job.company}
            Description: ${job.description}
            ---
        `;

        try {
            // Prepare the payload for the Gemini API
            const payload = {
                contents: [{
                    parts: [{ text: prompt }]
                }],
            };
            
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            
            if (!apiKey) {
                throw new Error("API key is missing. Please add it to your .env.local file.");
            }

            // --- FIX: Use the latest stable model name ---
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

            // Make the API call
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorBody = await response.json();
                // --- FIX: Improved error logging ---
                console.error("API Error Response:", JSON.stringify(errorBody, null, 2));
                const errorMessage = errorBody?.error?.message || `API request failed with status ${response.status}.`;
                throw new Error(errorMessage);
            }

            const result = await response.json();
            
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts.length > 0) {
                const letterText = result.candidates[0].content.parts[0].text;
                setGeneratedLetter(letterText);
            } else {
                console.warn("API Warning: No content returned.", result);
                if (result.promptFeedback && result.promptFeedback.blockReason) {
                     throw new Error(`Request was blocked by the API. Reason: ${result.promptFeedback.blockReason}`);
                }
                throw new Error("Received an invalid or empty response from the AI.");
            }

        } catch (err) {
            console.error("Error generating cover letter:", err);
            setError(err.message || "An unknown error occurred. Please try again later.");
        } finally {
            setGenerating(false);
        }
    };

    // Function to copy the generated letter to the clipboard
    const copyToClipboard = () => {
        if (!generatedLetter) return;
        
        const textArea = document.createElement("textarea");
        textArea.value = generatedLetter;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    };

    if (!job) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20" onClick={() => setSelectedJob(null)}>
            <div 
                className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl p-6 sm:p-8 overflow-y-auto transform transition-transform duration-300 ease-in-out" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* --- HEADER --- */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <button onClick={() => setSelectedJob(null)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <ChevronLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <h2 className="text-xl font-bold text-slate-800 text-center flex-grow truncate px-4">{job.title}</h2>
                    <button onClick={() => setSelectedJob(null)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <X className="w-6 h-6 text-slate-600" />
                    </button>
                </div>

                <div className="mt-6">
                    <p className="text-lg font-semibold text-slate-800">{job.company}</p>
                    <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 hover:underline mt-1 text-sm font-medium">
                        View Original Post <ExternalLink className="w-4 h-4" />
                    </a>
                </div>

                {/* --- AI ANALYSIS SECTION --- */}
                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h3 className="font-semibold text-slate-700 mb-3">AI Analysis</h3>
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-sky-600">{(job.similarity_score * 100).toFixed(0)}%</p>
                            <p className="text-xs text-slate-500 font-medium">Similarity Match</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-amber-600">{job.gemini_rating}/10</p>
                            <p className="text-xs text-slate-500 font-medium">Gemini Fit Score</p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-600 leading-relaxed"><span className="font-semibold text-slate-700">Reason:</span> {job.ai_reason}</p>
                </div>

                {/* --- AI COVER LETTER SECTION --- */}
                <div className="mt-8">
                    <h3 className="font-semibold text-slate-700 mb-3">AI Cover Letter Generator</h3>
                    <button 
                        onClick={generateCoverLetter} 
                        disabled={generating} 
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 disabled:bg-sky-400 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
                    >
                        <Sparkles className="w-5 h-5" />
                        {generating ? 'Generating, Please Wait...' : 'Generate Cover Letter'}
                    </button>
                    
                    {error && <p className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</p>}

                    {generating && (
                        <div className="mt-4 p-4 border rounded-lg bg-slate-50 animate-pulse">
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                            <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                        </div>
                    )}

                    {generatedLetter && (
                        <div className="mt-4 p-4 border rounded-lg bg-slate-50 relative">
                            <h4 className="font-semibold text-md mb-2 text-slate-800">Your Generated Cover Letter</h4>
                            <div className="p-4 bg-white border rounded-md text-sm text-slate-700 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap cover-letter-content">
                                {generatedLetter}
                            </div>
                            <button 
                                onClick={copyToClipboard} 
                                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-md font-semibold hover:bg-slate-700 transition-colors"
                            >
                                {copied ? <ClipboardCheck className="w-5 h-5" /> : <Clipboard className="w-5 h-5" />}
                                {copied ? 'Copied!' : 'Copy Letter'}
                            </button>
                        </div>
                    )}
                </div>

                {/* --- JOB DESCRIPTION --- */}
                <div className="mt-8">
                    <h3 className="font-semibold text-slate-700 mb-2">Job Description</h3>
                    <div className="prose prose-sm max-w-none text-slate-700 job-description-content border-t border-slate-200 pt-4">
                        {job.description}
                    </div>
                </div>
            </div>
        </div>
    );
}
