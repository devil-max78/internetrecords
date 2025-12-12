"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.artistProfileLinkingRoute = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_1 = require("@tanstack/react-router");
const react_hot_toast_1 = require("react-hot-toast");
const react_query_1 = require("@tanstack/react-query");
const root_1 = require("./root");
const AuthContext_1 = require("../context/AuthContext");
const api_1 = require("../api");
exports.artistProfileLinkingRoute = (0, react_router_1.createRoute)({
    getParentRoute: () => root_1.rootRoute,
    path: '/artist-profile-linking',
    component: ArtistProfileLinkingComponent,
});
function ArtistProfileLinkingComponent() {
    const { user } = (0, AuthContext_1.useAuth)();
    const queryClient = (0, react_query_1.useQueryClient)();
    const [artistName, setArtistName] = (0, react_1.useState)('');
    const [email, setEmail] = (0, react_1.useState)(user?.email || '');
    const [instagramUrl, setInstagramUrl] = (0, react_1.useState)('');
    const [youtubeUrl, setYoutubeUrl] = (0, react_1.useState)('');
    const [facebookUrl, setFacebookUrl] = (0, react_1.useState)('');
    const [spotifyUrl, setSpotifyUrl] = (0, react_1.useState)('');
    const [appleMusicUrl, setAppleMusicUrl] = (0, react_1.useState)('');
    const [isrcCode, setIsrcCode] = (0, react_1.useState)('');
    const [additionalNotes, setAdditionalNotes] = (0, react_1.useState)('');
    const { data: requests, isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['artistProfileLinkingRequests'],
        queryFn: () => api_1.api.artistProfileLinking.getAll(),
    });
    const submitMutation = (0, react_query_1.useMutation)({
        mutationFn: (data) => api_1.api.artistProfileLinking.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['artistProfileLinkingRequests'] });
            // Reset form
            setArtistName('');
            setInstagramUrl('');
            setYoutubeUrl('');
            setFacebookUrl('');
            setSpotifyUrl('');
            setAppleMusicUrl('');
            setIsrcCode('');
            setAdditionalNotes('');
            react_hot_toast_1.toast.success('Profile linking request submitted successfully!');
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to submit request');
        },
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!artistName.trim()) {
            react_hot_toast_1.toast.error('Artist name is required');
            return;
        }
        if (!email.trim()) {
            react_hot_toast_1.toast.error('Email is required');
            return;
        }
        // At least one platform URL must be provided
        if (!instagramUrl && !youtubeUrl && !facebookUrl && !spotifyUrl && !appleMusicUrl) {
            react_hot_toast_1.toast.error('Please provide at least one platform URL');
            return;
        }
        submitMutation.mutate({
            artistName: artistName.trim(),
            email: email.trim(),
            instagramUrl: instagramUrl.trim() || null,
            youtubeUrl: youtubeUrl.trim() || null,
            facebookUrl: facebookUrl.trim() || null,
            spotifyUrl: spotifyUrl.trim() || null,
            appleMusicUrl: appleMusicUrl.trim() || null,
            isrcCode: isrcCode.trim() || null,
            additionalNotes: additionalNotes.trim() || null,
        });
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'PROCESSING': return 'bg-blue-100 text-blue-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-4xl mx-auto p-6", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold mb-6", children: "Artist Profile Linking" }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-blue-50 border border-blue-200 rounded-md p-4 mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold text-blue-900 mb-2", children: "What is Profile Linking?" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-blue-800 mb-2", children: "Link your artist profiles across major streaming and social media platforms to ensure your music reaches the right audience." }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-blue-700", children: "We'll verify and connect your profiles on Instagram, YouTube, Facebook, Spotify, and Apple Music." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6 mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-semibold mb-4", children: "Submit Linking Request" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Artist Name ", (0, jsx_runtime_1.jsx)("span", { className: "text-red-600", children: "*" })] }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: artistName, onChange: (e) => setArtistName(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Your artist name", required: true })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Email ", (0, jsx_runtime_1.jsx)("span", { className: "text-red-600", children: "*" })] }), (0, jsx_runtime_1.jsx)("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "your@email.com", required: true })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "border-t pt-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold mb-3", children: "Platform URLs" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 mb-4", children: "Provide at least one platform URL" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Instagram Profile URL" }), (0, jsx_runtime_1.jsx)("input", { type: "url", value: instagramUrl, onChange: (e) => setInstagramUrl(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "https://instagram.com/yourartist" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "YouTube Channel URL" }), (0, jsx_runtime_1.jsx)("input", { type: "url", value: youtubeUrl, onChange: (e) => setYoutubeUrl(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "https://youtube.com/@yourartist" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Facebook Page URL" }), (0, jsx_runtime_1.jsx)("input", { type: "url", value: facebookUrl, onChange: (e) => setFacebookUrl(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "https://facebook.com/yourartist" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Spotify Artist URL" }), (0, jsx_runtime_1.jsx)("input", { type: "url", value: spotifyUrl, onChange: (e) => setSpotifyUrl(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "https://open.spotify.com/artist/..." })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Apple Music Artist URL" }), (0, jsx_runtime_1.jsx)("input", { type: "url", value: appleMusicUrl, onChange: (e) => setAppleMusicUrl(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "https://music.apple.com/artist/..." })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "ISRC Code (Optional)" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: isrcCode, onChange: (e) => setIsrcCode(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "USRC17607839" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Additional Notes (Optional)" }), (0, jsx_runtime_1.jsx)("textarea", { value: additionalNotes, onChange: (e) => setAdditionalNotes(e.target.value), rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Any additional information..." })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: submitMutation.isPending, className: "w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition disabled:opacity-50", children: submitMutation.isPending ? 'Submitting...' : 'Submit Request' })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-semibold mb-4", children: "Your Requests" }), isLoading ? ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Loading..." })) : requests && requests.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: requests.map((request) => ((0, jsx_runtime_1.jsxs)("div", { className: "border border-gray-200 rounded-md p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start mb-2", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-semibold text-lg", children: request.artistName }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600", children: request.email })] }), (0, jsx_runtime_1.jsx)("span", { className: `px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`, children: request.status })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-sm text-gray-700 space-y-1", children: [request.instagramUrl && (0, jsx_runtime_1.jsxs)("p", { children: ["\uD83D\uDCF7 Instagram: ", request.instagramUrl] }), request.youtubeUrl && (0, jsx_runtime_1.jsxs)("p", { children: ["\u25B6\uFE0F YouTube: ", request.youtubeUrl] }), request.facebookUrl && (0, jsx_runtime_1.jsxs)("p", { children: ["\uD83D\uDC65 Facebook: ", request.facebookUrl] }), request.spotifyUrl && (0, jsx_runtime_1.jsxs)("p", { children: ["\uD83C\uDFB5 Spotify: ", request.spotifyUrl] }), request.appleMusicUrl && (0, jsx_runtime_1.jsxs)("p", { children: ["\uD83C\uDF4E Apple Music: ", request.appleMusicUrl] })] }), request.adminNotes && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-3 p-2 bg-gray-50 rounded", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-700", children: "Admin Notes:" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600", children: request.adminNotes })] })), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-gray-500 mt-2", children: ["Submitted: ", new Date(request.createdAt).toLocaleDateString()] })] }, request.id))) })) : ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "No requests yet. Submit your first request above!" }))] })] }));
}
