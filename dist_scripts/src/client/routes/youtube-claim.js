"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.youtubeClaimRoute = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_1 = require("@tanstack/react-router");
const react_hot_toast_1 = require("react-hot-toast");
const react_query_1 = require("@tanstack/react-query");
const root_1 = require("./root");
const AuthContext_1 = require("../context/AuthContext");
const api_1 = require("../api");
exports.youtubeClaimRoute = (0, react_router_1.createRoute)({
    getParentRoute: () => root_1.rootRoute,
    path: '/youtube-claim',
    component: YoutubeClaimComponent,
});
function YoutubeClaimComponent() {
    const { user } = (0, AuthContext_1.useAuth)();
    const queryClient = (0, react_query_1.useQueryClient)();
    const [videoUrls, setVideoUrls] = (0, react_1.useState)('');
    const [selectedReleaseId, setSelectedReleaseId] = (0, react_1.useState)('');
    // Fetch user's releases
    const { data: releases } = (0, react_query_1.useQuery)({
        queryKey: ['releases'],
        queryFn: () => api_1.api.releases.getAll(),
    });
    // Fetch user's YouTube claims history
    const { data: claims, isLoading: claimsLoading } = (0, react_query_1.useQuery)({
        queryKey: ['youtubeClaims'],
        queryFn: () => api_1.api.youtubeClaims.getAll(),
    });
    // Submit claim mutation
    const submitClaimMutation = (0, react_query_1.useMutation)({
        mutationFn: (data) => api_1.api.youtubeClaims.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['youtubeClaims'] });
            setVideoUrls('');
            setSelectedReleaseId('');
            react_hot_toast_1.toast.success('YouTube claim submitted successfully');
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to submit claim');
        },
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!videoUrls.trim()) {
            react_hot_toast_1.toast.error('Please enter at least one video URL');
            return;
        }
        submitClaimMutation.mutate({
            releaseId: selectedReleaseId || undefined,
            videoUrls: videoUrls.trim(),
        });
    };
    const getStatusBadge = (status) => {
        const statusColors = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            PROCESSING: 'bg-blue-100 text-blue-800',
            COMPLETED: 'bg-green-100 text-green-800',
            REJECTED: 'bg-red-100 text-red-800',
        };
        return ((0, jsx_runtime_1.jsx)("span", { className: `px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`, children: status }));
    };
    if (!user) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "text-center p-8", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-red-600 mb-2", children: "Access Denied" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Please log in to submit YouTube claims." })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-4xl mx-auto space-y-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-between", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-indigo-800", children: "YouTube Claim Release" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mt-1", children: "Submit YouTube video URLs for content claiming" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "YouTube Claim Release" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Select Release (Optional)" }), (0, jsx_runtime_1.jsxs)("select", { value: selectedReleaseId, onChange: (e) => setSelectedReleaseId(e.target.value), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "-- No release selected --" }), releases?.map((release) => ((0, jsx_runtime_1.jsx)("option", { value: release.id, children: release.title }, release.id)))] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mt-1", children: "Link this claim to one of your releases (optional)" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "URL of the Video to Release Claim (Use comma for multiple links) *" }), (0, jsx_runtime_1.jsx)("textarea", { value: videoUrls, onChange: (e) => setVideoUrls(e.target.value), placeholder: "https://youtube.com/...", rows: 5, className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", required: true }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mt-1", children: "Enter one or more YouTube video URLs separated by commas" })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: submitClaimMutation.isPending, className: "w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition", children: submitClaimMutation.isPending ? 'Submitting...' : 'Submit' })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "History" }), claimsLoading ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-gray-600", children: "Loading..." })] })) : claims && claims.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "min-w-full divide-y divide-gray-200", children: [(0, jsx_runtime_1.jsx)("thead", { className: "bg-gray-50", children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "SN" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "YouTube Video URL" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Submitted on" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { className: "bg-white divide-y divide-gray-200", children: claims.map((claim, index) => ((0, jsx_runtime_1.jsxs)("tr", { className: "hover:bg-gray-50", children: [(0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: index + 1 }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 text-sm text-gray-900", children: (0, jsx_runtime_1.jsx)("div", { className: "max-w-md truncate", children: claim.videoUrls.split(',').map((url, i) => ((0, jsx_runtime_1.jsx)("div", { className: "mb-1", children: (0, jsx_runtime_1.jsx)("a", { href: url.trim(), target: "_blank", rel: "noopener noreferrer", className: "text-indigo-600 hover:text-indigo-800 hover:underline", children: url.trim() }) }, i))) }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: new Date(claim.submittedAt).toLocaleString() }), (0, jsx_runtime_1.jsxs)("td", { className: "px-6 py-4 whitespace-nowrap", children: [getStatusBadge(claim.status), claim.notes && ((0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 mt-1", children: claim.notes }))] })] }, claim.id))) })] }) })) : ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 text-center py-4", children: "No claims submitted yet" }))] })] }));
}
