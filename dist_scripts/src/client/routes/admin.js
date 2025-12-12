"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoute = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_1 = require("@tanstack/react-router");
const react_hot_toast_1 = require("react-hot-toast");
const react_query_1 = require("@tanstack/react-query");
const root_1 = require("./root");
const AuthContext_1 = require("../context/AuthContext");
const api_1 = require("../api");
const StatusBadge_1 = __importDefault(require("../components/StatusBadge"));
exports.adminRoute = (0, react_router_1.createRoute)({
    getParentRoute: () => root_1.rootRoute,
    path: '/admin',
    component: AdminComponent,
});
function AdminComponent() {
    const { user } = (0, AuthContext_1.useAuth)();
    const queryClient = (0, react_query_1.useQueryClient)();
    const [selectedReleaseId, setSelectedReleaseId] = (0, react_1.useState)(null);
    const [playingTrackId, setPlayingTrackId] = (0, react_1.useState)(null);
    const [showRejectDialog, setShowRejectDialog] = (0, react_1.useState)(false);
    const [rejectingReleaseId, setRejectingReleaseId] = (0, react_1.useState)(null);
    const [rejectionReason, setRejectionReason] = (0, react_1.useState)('');
    const [allowResubmission, setAllowResubmission] = (0, react_1.useState)(true);
    const { data: releases, isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['releases'],
        queryFn: () => api_1.api.releases.getAll(),
    });
    const { data: downloadUrls } = (0, react_query_1.useQuery)({
        queryKey: ['downloadUrls', selectedReleaseId],
        queryFn: () => selectedReleaseId ? api_1.api.admin.getDownloadUrls(selectedReleaseId) : Promise.resolve([]),
        enabled: !!selectedReleaseId,
    });
    const approveMutation = (0, react_query_1.useMutation)({
        mutationFn: (id) => api_1.api.admin.approveRelease(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['releases'] });
            react_hot_toast_1.toast.success('Release approved successfully');
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to approve release');
        },
    });
    const rejectMutation = (0, react_query_1.useMutation)({
        mutationFn: ({ id, rejectionReason, allowResubmission }) => api_1.api.admin.rejectRelease(id, rejectionReason, allowResubmission),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['releases'] });
            setShowRejectDialog(false);
            setRejectingReleaseId(null);
            setRejectionReason('');
            setAllowResubmission(true);
            react_hot_toast_1.toast.success('Release rejected');
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to reject release');
        },
    });
    const deleteReleaseMutation = (0, react_query_1.useMutation)({
        mutationFn: (id) => api_1.api.admin.deleteRelease(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['releases'] });
            setSelectedReleaseId(null);
            react_hot_toast_1.toast.success('Release deleted successfully');
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to delete release');
        },
    });
    const deleteTrackMutation = (0, react_query_1.useMutation)({
        mutationFn: (id) => api_1.api.admin.deleteTrack(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['releases'] });
            react_hot_toast_1.toast.success('Track deleted successfully');
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to delete track');
        },
    });
    // Redirect if not admin
    if (user?.role !== 'ADMIN') {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "text-center p-8", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-red-600 mb-2", children: "Access Denied" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "You need admin privileges to access this page." })] }));
    }
    const handleApprove = (releaseId) => {
        approveMutation.mutate(releaseId);
    };
    const handleReject = (releaseId) => {
        setRejectingReleaseId(releaseId);
        setShowRejectDialog(true);
    };
    const confirmReject = () => {
        if (!rejectingReleaseId)
            return;
        if (!rejectionReason.trim()) {
            react_hot_toast_1.toast.error('Please provide a rejection reason');
            return;
        }
        rejectMutation.mutate({
            id: rejectingReleaseId,
            rejectionReason: rejectionReason.trim(),
            allowResubmission,
        });
    };
    const handleDeleteRelease = (releaseId, releaseTitle) => {
        if (window.confirm(`Are you sure you want to delete "${releaseTitle}"? This action cannot be undone.`)) {
            deleteReleaseMutation.mutate(releaseId);
        }
    };
    const handleDeleteTrack = (trackId, trackTitle) => {
        if (window.confirm(`Are you sure you want to delete track "${trackTitle}"? This action cannot be undone.`)) {
            deleteTrackMutation.mutate(trackId);
        }
    };
    const downloadReleaseData = async (release) => {
        try {
            // Get download URLs
            const urls = await api_1.api.admin.getDownloadUrls(release.id);
            const artworkUrl = urls?.find((u) => u.type === 'ARTWORK')?.url || '';
            // Create header row with ALL fields
            const headers = [
                'Release Title',
                'UPC',
                'Original Release Date',
                'Go Live Date',
                'C-Line',
                'Status',
                'Artist Name',
                'Artist Email',
                'Artwork URL',
                'Track #',
                'Track Title',
                'Singer',
                'Lyricist',
                'Composer',
                'Producer',
                'Featuring',
                'Duration',
                'Genre',
                'Language',
                'ISRC',
                'CRBT Start (sec)',
                'CRBT End (sec)',
                'Audio Download URL',
            ];
            const rows = [];
            // Add a row for each track with all release info repeated
            if (release.tracks && release.tracks.length > 0) {
                release.tracks.forEach((track, index) => {
                    const audioUrl = urls?.find((u) => u.type === 'AUDIO' && u.name === track.title)?.url || '';
                    const duration = track.duration
                        ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`
                        : '';
                    rows.push([
                        release.title || '',
                        release.upc || '',
                        release.originalReleaseDate || '',
                        release.goLiveDate || '',
                        release.cLine || 'Internet Records',
                        release.status || '',
                        release.user?.name || '',
                        release.user?.email || '',
                        artworkUrl,
                        (index + 1).toString(),
                        track.title || '',
                        track.singer || '',
                        track.lyricist || '',
                        track.composer || '',
                        track.producer || '',
                        track.featuring || '',
                        duration,
                        track.genre || '',
                        track.language || '',
                        track.isrc || '',
                        track.crbtStartTime?.toString() || '',
                        track.crbtEndTime?.toString() || '',
                        audioUrl,
                    ]);
                });
            }
            else {
                // If no tracks, add one row with release info only
                rows.push([
                    release.title || '',
                    release.upc || '',
                    release.originalReleaseDate || '',
                    release.goLiveDate || '',
                    release.cLine || 'Internet Records',
                    release.status || '',
                    release.user?.name || '',
                    release.user?.email || '',
                    artworkUrl,
                    '',
                    'No tracks',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                ]);
            }
            // Combine header and rows
            const csvContent = [
                headers.map(h => `"${h}"`).join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');
            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            a.setAttribute('download', `${release.title.replace(/[^a-z0-9]/gi, '_')}-data.csv`);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            react_hot_toast_1.toast.success('Release data downloaded as CSV');
        }
        catch (error) {
            react_hot_toast_1.toast.error(error.message || 'Failed to download release data');
        }
    };
    const generateCSV = () => {
        if (!releases || releases.length === 0) {
            react_hot_toast_1.toast.error('No releases to export');
            return;
        }
        // Create CSV header with all fields
        const headers = [
            'ID', 'Title', 'Artist', 'Email', 'Status', 'UPC',
            'Original Release Date', 'Go Live Date', 'C-Line',
            'Tracks Count', 'Created At'
        ];
        // Create rows
        const rows = releases.map((release) => [
            release.id,
            release.title,
            release.user?.name || 'Unknown',
            release.user?.email || '',
            release.status,
            release.upc || '',
            release.originalReleaseDate || '',
            release.goLiveDate || '',
            release.cLine || 'Internet Records',
            release.tracks?.length?.toString() || '0',
            new Date(release.createdAt).toISOString(),
        ]);
        // Combine header and rows
        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
        ].join('\n');
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'releases.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        react_hot_toast_1.toast.success('CSV downloaded successfully');
    };
    const selectedRelease = releases?.find((r) => r.id === selectedReleaseId);
    const getAudioUrl = (trackId) => {
        const audioDownload = downloadUrls?.find((d) => d.type === 'AUDIO' && d.name === selectedRelease?.tracks?.find((t) => t.id === trackId)?.title);
        return audioDownload?.url;
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-indigo-800", children: "Admin Dashboard" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3", children: [(0, jsx_runtime_1.jsx)("a", { href: "/admin/youtube-claims", className: "px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition", children: "YouTube Claims" }), (0, jsx_runtime_1.jsx)("a", { href: "/admin/artist-profile-linking", className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition", children: "Artist Profiles" }), (0, jsx_runtime_1.jsx)("a", { href: "/admin/settings", className: "px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition", children: "Settings" }), (0, jsx_runtime_1.jsx)("button", { onClick: generateCSV, className: "px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition", children: "Download All CSV" })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "bg-white rounded-lg shadow-md overflow-hidden", children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold text-gray-800 mb-4", children: "Releases Management" }), isLoading ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-gray-600", children: "Loading..." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "min-w-full divide-y divide-gray-200", children: [(0, jsx_runtime_1.jsx)("thead", { className: "bg-gray-50", children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Title" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Artist" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Date" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { className: "bg-white divide-y divide-gray-200", children: releases?.map((release) => ((0, jsx_runtime_1.jsxs)("tr", { className: "hover:bg-gray-50", children: [(0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap", children: (0, jsx_runtime_1.jsx)("div", { className: "text-sm font-medium text-gray-900", children: release.title }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap", children: (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-500", children: release.user?.name || 'Unknown' }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap", children: (0, jsx_runtime_1.jsx)(StatusBadge_1.default, { status: release.status }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: new Date(release.createdAt).toLocaleDateString() }), (0, jsx_runtime_1.jsxs)("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setSelectedReleaseId(release.id), className: "text-indigo-600 hover:text-indigo-900 mr-3", children: "View" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => downloadReleaseData(release), className: "text-blue-600 hover:text-blue-900 mr-3", children: "Download" }), release.status === 'UNDER_REVIEW' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => handleApprove(release.id), className: "text-green-600 hover:text-green-900 mr-3", children: "Approve" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleReject(release.id), className: "text-red-600 hover:text-red-900 mr-3", children: "Reject" })] })), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDeleteRelease(release.id, release.title), className: "text-red-600 hover:text-red-900 font-bold", title: "Delete release", children: "Delete" })] })] }, release.id))) })] }) }))] }) }), selectedRelease && ((0, jsx_runtime_1.jsx)("div", { className: "bg-white rounded-lg shadow-md overflow-hidden", children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-4", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold text-gray-800", children: "Release Details" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => downloadReleaseData(selectedRelease), className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700", children: "Download Data" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setSelectedReleaseId(null), className: "px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600", children: "Close" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900 mb-3", children: selectedRelease.title }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2 text-sm", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-gray-600", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Artist:" }), " ", selectedRelease.user?.name || 'Unknown'] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-gray-600", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Email:" }), " ", selectedRelease.user?.email || 'N/A'] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-gray-600", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Status:" }), " ", (0, jsx_runtime_1.jsx)(StatusBadge_1.default, { status: selectedRelease.status })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-gray-600", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "UPC:" }), " ", selectedRelease.upc || 'N/A'] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-gray-600", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Original Release Date:" }), " ", selectedRelease.originalReleaseDate || 'N/A'] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-gray-600", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Go Live Date:" }), " ", selectedRelease.goLiveDate || 'N/A'] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-gray-600", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "C-Line:" }), " ", selectedRelease.cLine || 'Internet Records'] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-gray-600", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Created:" }), " ", new Date(selectedRelease.createdAt).toLocaleDateString()] })] }), selectedRelease.status === 'UNDER_REVIEW' && ((0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-2 mt-4", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => handleApprove(selectedRelease.id), className: "px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition", children: "Approve" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleReject(selectedRelease.id), className: "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition", children: "Reject" })] }))] }), (0, jsx_runtime_1.jsx)("div", { children: selectedRelease.artworkUrl && downloadUrls?.find((d) => d.type === 'ARTWORK') && ((0, jsx_runtime_1.jsxs)("div", { className: "mb-4", children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-md font-medium text-gray-900 mb-2", children: "Artwork" }), (0, jsx_runtime_1.jsx)("img", { src: downloadUrls.find((d) => d.type === 'ARTWORK')?.url, alt: "Album artwork", className: "w-full max-w-xs rounded-lg shadow-md" })] })) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h4", { className: "text-md font-medium text-gray-900 mb-3", children: ["Tracks (", selectedRelease.tracks?.length || 0, ")"] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-3", children: selectedRelease.tracks?.map((track, index) => {
                                        const audioUrl = getAudioUrl(track.id);
                                        return ((0, jsx_runtime_1.jsxs)("div", { className: "border border-gray-200 rounded-lg p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start mb-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsxs)("h5", { className: "font-medium text-gray-900", children: [index + 1, ". ", track.title] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-sm text-gray-600 mt-1 space-y-1", children: [(0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Duration:" }), " ", track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : 'N/A'] }), track.genre && (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Genre:" }), " ", track.genre] }), track.language && (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Language:" }), " ", track.language] }), track.isrc && (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "ISRC:" }), " ", track.isrc] }), (track.crbtStartTime || track.crbtEndTime) && ((0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "CRBT:" }), " ", track.crbtStartTime, "s - ", track.crbtEndTime, "s"] }))] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDeleteTrack(track.id, track.title), className: "ml-4 text-red-600 hover:text-red-800 text-sm font-medium", title: "Delete track", children: "Delete" })] }), audioUrl && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-3", children: [(0, jsx_runtime_1.jsxs)("audio", { controls: true, className: "w-full", onPlay: () => setPlayingTrackId(track.id), onPause: () => setPlayingTrackId(null), children: [(0, jsx_runtime_1.jsx)("source", { src: audioUrl, type: "audio/mpeg" }), "Your browser does not support the audio element."] }), (0, jsx_runtime_1.jsx)("a", { href: audioUrl, download: `${track.title}.mp3`, className: "inline-block mt-2 text-sm text-blue-600 hover:text-blue-800", children: "Download Audio" })] })), !audioUrl && track.audioUrl && ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mt-2", children: "Audio file available but URL not loaded" })), !audioUrl && !track.audioUrl && ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mt-2", children: "No audio file uploaded" }))] }, track.id));
                                    }) })] })] }) })), showRejectDialog && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg p-6 max-w-md w-full mx-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xl font-bold mb-4", children: "Reject Release" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Rejection Reason *" }), (0, jsx_runtime_1.jsx)("textarea", { value: rejectionReason, onChange: (e) => setRejectionReason(e.target.value), placeholder: "Explain why this release is being rejected...", rows: 4, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", id: "allowResubmission", checked: allowResubmission, onChange: (e) => setAllowResubmission(e.target.checked), className: "h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "allowResubmission", className: "ml-2 block text-sm text-gray-900", children: "Allow user to edit and resubmit" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3 mt-6", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                                setShowRejectDialog(false);
                                                setRejectingReleaseId(null);
                                                setRejectionReason('');
                                                setAllowResubmission(true);
                                            }, className: "flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50", children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { onClick: confirmReject, disabled: rejectMutation.isPending || !rejectionReason.trim(), className: "flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed", children: rejectMutation.isPending ? 'Rejecting...' : 'Confirm Reject' })] })] })] }) }))] }));
}
