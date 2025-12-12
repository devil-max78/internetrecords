"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.youtubeOacRoute = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_1 = require("@tanstack/react-router");
const react_hot_toast_1 = require("react-hot-toast");
const react_query_1 = require("@tanstack/react-query");
const root_1 = require("./root");
const AuthContext_1 = require("../context/AuthContext");
const api_1 = require("../api");
exports.youtubeOacRoute = (0, react_router_1.createRoute)({
    getParentRoute: () => root_1.rootRoute,
    path: '/youtube-oac',
    component: YoutubeOacComponent,
});
function YoutubeOacComponent() {
    const { user } = (0, AuthContext_1.useAuth)();
    const queryClient = (0, react_query_1.useQueryClient)();
    const [channelLink, setChannelLink] = (0, react_1.useState)('');
    const [legalName, setLegalName] = (0, react_1.useState)('');
    const [channelName, setChannelName] = (0, react_1.useState)('');
    // Fetch user's releases to check eligibility
    const { data: releases } = (0, react_query_1.useQuery)({
        queryKey: ['releases'],
        queryFn: () => api_1.api.releases.getAll(),
    });
    // Fetch user's OAC requests
    const { data: requests, isLoading: requestsLoading } = (0, react_query_1.useQuery)({
        queryKey: ['youtubeOacRequests'],
        queryFn: () => api_1.api.youtubeOac.getAll(),
    });
    // Submit request mutation
    const submitRequestMutation = (0, react_query_1.useMutation)({
        mutationFn: (data) => api_1.api.youtubeOac.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['youtubeOacRequests'] });
            setChannelLink('');
            setLegalName('');
            setChannelName('');
            react_hot_toast_1.toast.success('YouTube OAC request submitted successfully');
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to submit request');
        },
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!channelLink.trim() || !legalName.trim() || !channelName.trim()) {
            react_hot_toast_1.toast.error('Please fill in all required fields');
            return;
        }
        submitRequestMutation.mutate({
            channelLink: channelLink.trim(),
            legalName: legalName.trim(),
            channelName: channelName.trim(),
        });
    };
    const getStatusBadge = (status) => {
        const statusColors = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            PROCESSING: 'bg-blue-100 text-blue-800',
            APPROVED: 'bg-green-100 text-green-800',
            REJECTED: 'bg-red-100 text-red-800',
        };
        return ((0, jsx_runtime_1.jsx)("span", { className: `px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`, children: status }));
    };
    const releaseCount = releases?.length || 0;
    const isEligible = releaseCount >= 3;
    const hasPendingRequest = requests?.some((r) => r.status === 'PENDING');
    if (!user) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "text-center p-8", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-red-600 mb-2", children: "Access Denied" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Please log in to request YouTube OAC." })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-4xl mx-auto space-y-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-between", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-indigo-800", children: "YouTube Official Artist Channel (OAC)" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mt-1", children: "Request verification for your YouTube channel" })] }) }), (0, jsx_runtime_1.jsx)("div", { className: `p-4 rounded-lg ${isEligible ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0", children: isEligible ? ((0, jsx_runtime_1.jsx)("svg", { className: "h-5 w-5 text-green-400", fill: "currentColor", viewBox: "0 0 20 20", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) })) : ((0, jsx_runtime_1.jsx)("svg", { className: "h-5 w-5 text-yellow-400", fill: "currentColor", viewBox: "0 0 20 20", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) })) }), (0, jsx_runtime_1.jsxs)("div", { className: "ml-3", children: [(0, jsx_runtime_1.jsx)("h3", { className: `text-sm font-medium ${isEligible ? 'text-green-800' : 'text-yellow-800'}`, children: isEligible ? 'You are eligible!' : 'Eligibility Requirement' }), (0, jsx_runtime_1.jsx)("div", { className: `mt-2 text-sm ${isEligible ? 'text-green-700' : 'text-yellow-700'}`, children: (0, jsx_runtime_1.jsxs)("p", { children: ["You have ", (0, jsx_runtime_1.jsx)("strong", { children: releaseCount }), " song", releaseCount !== 1 ? 's' : '', " distributed through our platform.", !isEligible && ` You need at least 3 songs to request YouTube OAC.`] }) })] })] }) }), isEligible && !hasPendingRequest && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "Request YouTube OAC" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "YouTube Channel Link *" }), (0, jsx_runtime_1.jsx)("input", { type: "url", value: channelLink, onChange: (e) => setChannelLink(e.target.value), placeholder: "https://youtube.com/@yourchannel", className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", required: true }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mt-1", children: "Enter your YouTube channel URL" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Legal Name *" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: legalName, onChange: (e) => setLegalName(e.target.value), placeholder: "Your legal name or company name", className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", required: true }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mt-1", children: "As it appears on official documents" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Channel Name *" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: channelName, onChange: (e) => setChannelName(e.target.value), placeholder: "Your YouTube channel name", className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", required: true }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mt-1", children: "The name displayed on your YouTube channel" })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: submitRequestMutation.isPending, className: "w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition", children: submitRequestMutation.isPending ? 'Submitting...' : 'Submit Request' })] })] })), hasPendingRequest && ((0, jsx_runtime_1.jsx)("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: (0, jsx_runtime_1.jsx)("p", { className: "text-blue-800", children: "You already have a pending OAC request. Please wait for admin review." }) })), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "Request History" }), requestsLoading ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-gray-600", children: "Loading..." })] })) : requests && requests.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: requests.map((request) => ((0, jsx_runtime_1.jsx)("div", { className: "border border-gray-200 rounded-lg p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start mb-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-medium text-gray-900", children: request.channelName }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-600 mt-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Legal Name:" }), " ", request.legalName] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-600", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Channel:" }), ' ', (0, jsx_runtime_1.jsx)("a", { href: request.channelLink, target: "_blank", rel: "noopener noreferrer", className: "text-indigo-600 hover:text-indigo-800 hover:underline", children: request.channelLink })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-500 mt-1", children: ["Submitted: ", new Date(request.submittedAt).toLocaleString()] }), request.adminNotes && ((0, jsx_runtime_1.jsx)("div", { className: "mt-2 p-2 bg-gray-50 rounded", children: (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-700", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Admin Notes:" }), " ", request.adminNotes] }) }))] }), (0, jsx_runtime_1.jsx)("div", { className: "ml-4", children: getStatusBadge(request.status) })] }) }, request.id))) })) : ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 text-center py-4", children: "No requests submitted yet" }))] })] }));
}
