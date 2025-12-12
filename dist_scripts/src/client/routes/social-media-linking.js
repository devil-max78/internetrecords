"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialMediaLinkingRoute = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_1 = require("@tanstack/react-router");
const react_hot_toast_1 = require("react-hot-toast");
const react_query_1 = require("@tanstack/react-query");
const root_1 = require("./root");
const AuthContext_1 = require("../context/AuthContext");
const api_1 = require("../api");
exports.socialMediaLinkingRoute = (0, react_router_1.createRoute)({
    getParentRoute: () => root_1.rootRoute,
    path: '/social-media-linking',
    component: SocialMediaLinkingComponent,
});
function SocialMediaLinkingComponent() {
    const { user } = (0, AuthContext_1.useAuth)();
    const queryClient = (0, react_query_1.useQueryClient)();
    const [email, setEmail] = (0, react_1.useState)('');
    const [label, setLabel] = (0, react_1.useState)('');
    const [platforms, setPlatforms] = (0, react_1.useState)('');
    const [facebookPageUrl, setFacebookPageUrl] = (0, react_1.useState)('');
    const [instagramHandle, setInstagramHandle] = (0, react_1.useState)('');
    const [isrc, setIsrc] = (0, react_1.useState)('');
    // Fetch user's requests
    const { data: requests, isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['socialMediaLinkingRequests'],
        queryFn: () => api_1.api.socialMediaLinking.getAll(),
    });
    // Submit request mutation
    const submitRequestMutation = (0, react_query_1.useMutation)({
        mutationFn: (data) => api_1.api.socialMediaLinking.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['socialMediaLinkingRequests'] });
            setEmail('');
            setLabel('');
            setPlatforms('');
            setFacebookPageUrl('');
            setInstagramHandle('');
            setIsrc('');
            react_hot_toast_1.toast.success('Social media linking request submitted successfully');
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to submit request');
        },
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !label || !platforms || !isrc) {
            react_hot_toast_1.toast.error('Please fill in all required fields');
            return;
        }
        if (platforms === 'facebook' && !facebookPageUrl) {
            react_hot_toast_1.toast.error('Please enter Facebook Page URL');
            return;
        }
        if (platforms === 'instagram' && !instagramHandle) {
            react_hot_toast_1.toast.error('Please enter Instagram Handle');
            return;
        }
        if (platforms === 'both' && (!facebookPageUrl || !instagramHandle)) {
            react_hot_toast_1.toast.error('Please enter both Facebook and Instagram details');
            return;
        }
        submitRequestMutation.mutate({
            email,
            label,
            platforms,
            facebookPageUrl: platforms !== 'instagram' ? facebookPageUrl : undefined,
            instagramHandle: platforms !== 'facebook' ? instagramHandle : undefined,
            isrc,
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
        return ((0, jsx_runtime_1.jsxs)("div", { className: "text-center p-8", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-red-600 mb-2", children: "Access Denied" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Please log in to request social media linking." })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-4xl mx-auto space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-indigo-800", children: "Facebook & Instagram Linking" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mt-1", children: "Request to link your social media profiles to your music" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "Facebook & Instagram Linking" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email *" }), (0, jsx_runtime_1.jsx)("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "your@email.com", className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", required: true })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Label *" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: label, onChange: (e) => setLabel(e.target.value), placeholder: "Your label name", className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", required: true })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Select Platforms *" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsxs)("label", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("input", { type: "radio", value: "facebook", checked: platforms === 'facebook', onChange: (e) => setPlatforms(e.target.value), className: "mr-2" }), (0, jsx_runtime_1.jsx)("span", { children: "Facebook Page" })] }), (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("input", { type: "radio", value: "instagram", checked: platforms === 'instagram', onChange: (e) => setPlatforms(e.target.value), className: "mr-2" }), (0, jsx_runtime_1.jsx)("span", { children: "Instagram Handle" })] }), (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("input", { type: "radio", value: "both", checked: platforms === 'both', onChange: (e) => setPlatforms(e.target.value), className: "mr-2" }), (0, jsx_runtime_1.jsx)("span", { children: "Both" })] })] })] }), (platforms === 'facebook' || platforms === 'both') && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Facebook Page URL" }), (0, jsx_runtime_1.jsx)("input", { type: "url", value: facebookPageUrl, onChange: (e) => setFacebookPageUrl(e.target.value), placeholder: "https://facebook.com/yourpage", className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" })] })), (platforms === 'instagram' || platforms === 'both') && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Instagram Handle" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: instagramHandle, onChange: (e) => setInstagramHandle(e.target.value), placeholder: "Enter Instagram profile/page handle or URL", className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" })] })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "ISRC *" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: isrc, onChange: (e) => setIsrc(e.target.value), placeholder: "International Standard Recording Code", className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", required: true })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: submitRequestMutation.isPending, className: "w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition", children: submitRequestMutation.isPending ? 'Submitting...' : 'Submit' })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "Request History" }), isLoading ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-gray-600", children: "Loading..." })] })) : requests && requests.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: requests.map((request) => ((0, jsx_runtime_1.jsx)("div", { className: "border border-gray-200 rounded-lg p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start mb-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-medium text-gray-900", children: request.label }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-600 mt-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Email:" }), " ", request.email] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-600", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Platforms:" }), " ", request.platforms] }), request.facebookPageUrl && ((0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-600", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Facebook:" }), ' ', (0, jsx_runtime_1.jsx)("a", { href: request.facebookPageUrl, target: "_blank", rel: "noopener noreferrer", className: "text-indigo-600 hover:underline", children: request.facebookPageUrl })] })), request.instagramHandle && ((0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-600", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Instagram:" }), " ", request.instagramHandle] })), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-600", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "ISRC:" }), " ", request.isrc] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-500 mt-1", children: ["Submitted: ", new Date(request.submittedAt).toLocaleString()] }), request.adminNotes && ((0, jsx_runtime_1.jsx)("div", { className: "mt-2 p-2 bg-gray-50 rounded", children: (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-700", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Admin Notes:" }), " ", request.adminNotes] }) }))] }), (0, jsx_runtime_1.jsx)("div", { className: "ml-4", children: getStatusBadge(request.status) })] }) }, request.id))) })) : ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 text-center py-4", children: "No requests submitted yet" }))] })] }));
}
