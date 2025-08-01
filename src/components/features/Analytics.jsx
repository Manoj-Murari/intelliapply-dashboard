import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Target, BarChart2, CheckCircle, XCircle, Award, Briefcase } from 'lucide-react';

// A reusable card for displaying a single statistic
function StatCard({ title, value, icon, color }) {
    const Icon = icon;
    return (
        <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center">
                <div className={`p-3 rounded-full mr-4 ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="text-3xl font-bold text-slate-800">{value}</p>
                </div>
            </div>
        </div>
    );
}

export default function Analytics({ jobs }) {
    // --- DATA CALCULATION ---
    const totalJobs = jobs.length;
    const statusCounts = jobs.reduce((acc, job) => {
        const status = job.status || 'Applied';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const appliedCount = statusCounts['Applied'] || 0;
    const interviewingCount = statusCounts['Interviewing'] || 0;
    const offerCount = statusCounts['Offer'] || 0;
    const rejectedCount = statusCounts['Rejected'] || 0;

    // Data for the funnel chart (represented as a bar chart)
    const funnelData = [
        { name: 'Applied', value: appliedCount, fill: '#38bdf8' },
        { name: 'Interviewing', value: interviewingCount, fill: '#a78bfa' },
        { name: 'Offer', value: offerCount, fill: '#34d399' },
    ];

    // Data for the status pie chart
    const pieData = [
        { name: 'Applied', value: appliedCount },
        { name: 'Interviewing', value: interviewingCount },
        { name: 'Offer', value: offerCount },
        { name: 'Rejected', value: rejectedCount },
    ];
    const COLORS = ['#38bdf8', '#a78bfa', '#34d399', '#f87171'];


    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Your Analytics Dashboard</h2>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Applications" value={totalJobs} icon={Briefcase} color="bg-blue-500" />
                <StatCard title="Interviews" value={interviewingCount} icon={CheckCircle} color="bg-purple-500" />
                <StatCard title="Offers" value={offerCount} icon={Award} color="bg-emerald-500" />
                <StatCard title="Rejections" value={rejectedCount} icon={XCircle} color="bg-red-500" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg border border-slate-200">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-slate-600" />Application Funnel</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={80} />
                            <Tooltip />
                            <Bar dataKey="value" barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg border border-slate-200">
                     <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-slate-600" />Application Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={120} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
