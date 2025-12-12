"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.releaseDetailRoute = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_1 = require("@tanstack/react-router");
const react_hook_form_1 = require("react-hook-form");
const react_hot_toast_1 = require("react-hot-toast");
const react_query_1 = require("@tanstack/react-query");
const root_1 = require("./root");
const api_1 = require("../api");
const StatusBadge_1 = __importDefault(require("../components/StatusBadge"));
const AuthContext_1 = require("../context/AuthContext");
exports.releaseDetailRoute = (0, react_router_1.createRoute)({
    getParentRoute: () => root_1.rootRoute,
    path: '/release/$releaseId',
    component: ReleaseDetailComponent,
});
function ReleaseDetailComponent() {
    const { releaseId } = exports.releaseDetailRoute.useParams();
    const navigate = (0, react_router_1.useNavigate)();
    const queryClient = (0, react_query_1.useQueryClient)();
    const { user } = (0, AuthContext_1.useAuth)();
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const [audioFile, setAudioFile] = (0, react_1.useState)(null);
    const { register, handleSubmit, reset, formState: { errors } } = (0, react_hook_form_1.useForm)();
    const { data: release, isLoading, refetch } = (0, react_query_1.useQuery)({
        queryKey: ['release', releaseId],
        queryFn: () => api_1.api.releases.getById(releaseId),
    });
    const addTrackMutation = (0, react_query_1.useMutation)({
        mutationFn: (data) => api_1.api.releases.addTrack(releaseId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['release', releaseId] });
            reset();
            react_hot_toast_1.toast.success('Track added successfully!');
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to add track');
        },
    });
    const submitForReviewMutation = (0, react_query_1.useMutation)({
        mutationFn: () => api_1.api.releases.submitForReview(releaseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['release', releaseId] });
            react_hot_toast_1.toast.success('Release submitted for review!');
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to submit release');
        },
    });
    const onAddTrack = async (data) => {
        if (!audioFile) {
            react_hot_toast_1.toast.error('Audio file is required');
            return;
        }
        try {
            // First, add the track
            const createdTrack = await api_1.api.releases.addTrack(releaseId, data);
            // Then upload the audio file
            const audioUploadResponse = await api_1.api.upload.getPresignedUrl({
                fileType: 'AUDIO',
                fileName: audioFile.name,
                releaseId: releaseId,
            });
            await fetch(audioUploadResponse.uploadUrl, {
                method: 'PUT',
                body: audioFile,
                headers: {
                    'Content-Type': audioFile.type,
                },
            });
            // Update track with audio URL
            await api_1.api.upload.updateTrackAudio({
                trackId: createdTrack.id,
                audioUrl: audioUploadResponse.fileUrl,
            });
            queryClient.invalidateQueries({ queryKey: ['release', releaseId] });
            reset();
            setAudioFile(null);
            react_hot_toast_1.toast.success('Track added successfully!');
        }
        catch (error) {
            react_hot_toast_1.toast.error(error.message || 'Failed to add track');
        }
    };
    const handleSubmitForReview = async () => {
        if (!release?.tracks || release.tracks.length === 0) {
            react_hot_toast_1.toast.error('Please add at least one track before submitting');
            return;
        }
        if (window.confirm('Are you sure you want to submit this release for review?')) {
            submitForReviewMutation.mutate();
        }
    };
    if (isLoading) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center items-center h-64", children: (0, jsx_runtime_1.jsx)("div", { className: "text-indigo-600", children: "Loading release..." }) }));
    }
    if (!release) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "text-center text-red-600 p-4", children: "Release not found" }));
    }
    const canEdit = release.status === 'DRAFT';
    const canEditRejected = release.status === 'REJECTED' && release.allowResubmission;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-4xl mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-6", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => navigate({ to: '/dashboard' }), className: "text-indigo-600 hover:text-indigo-800 mb-4", children: "\u2190 Back to Dashboard" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-gray-800", children: release.title }), (0, jsx_runtime_1.jsxs)("p", { className: "text-gray-600 mt-2", children: ["Created: ", new Date(release.createdAt).toLocaleDateString()] })] }), (0, jsx_runtime_1.jsx)(StatusBadge_1.default, { status: release.status })] }), release.status === 'REJECTED' && release.rejectionReason && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-4 p-4 bg-red-50 border border-red-200 rounded-md", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-red-800 mb-2", children: "Rejection Reason:" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-700 mb-3", children: release.rejectionReason }), release.allowResubmission ? ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-yellow-50 border border-yellow-300 rounded p-3", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-yellow-800 mb-2", children: "\u26A0\uFE0F Limited Editing Available" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-yellow-700 mb-2", children: "You can edit basic release metadata, but for comprehensive changes (artwork, track credits, audio files), we recommend creating a new release." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => navigate({ to: '/release/$releaseId/edit', params: { releaseId: release.id } }), className: "px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm", children: "Edit Basic Metadata" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => navigate({ to: '/upload' }), className: "px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm", children: "Create New Release" })] })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "mt-3 p-3 bg-gray-100 border border-gray-300 rounded", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-700", children: "\u2717 Resubmission not allowed. Please contact support or create a new release." }), (0, jsx_runtime_1.jsx)("button", { onClick: () => navigate({ to: '/upload' }), className: "mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm", children: "Create New Release" })] }))] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6 mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-semibold text-gray-800 mb-4", children: "Tracks" }), release.tracks && release.tracks.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "space-y-3 mb-6", children: release.tracks.map((track, index) => ((0, jsx_runtime_1.jsx)("div", { className: "border border-gray-200 rounded-md p-4", children: (0, jsx_runtime_1.jsx)("div", { className: "flex justify-between items-start", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h3", { className: "font-semibold text-gray-800", children: [index + 1, ". ", track.title] }), track.duration && ((0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-600", children: ["Duration: ", Math.floor(track.duration / 60), ":", (track.duration % 60).toString().padStart(2, '0')] })), track.genre && ((0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-600", children: ["Genre: ", track.genre] }))] }) }) }, track.id))) })) : ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-6", children: "No tracks added yet." })), (canEdit || canEditRejected) && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit(onAddTrack), className: "space-y-4 border-t pt-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-gray-800", children: "Add New Track" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "title", className: "block text-sm font-medium text-gray-700 mb-1", children: "Track Title *" }), (0, jsx_runtime_1.jsx)("input", { id: "title", type: "text", ...register('title', { required: 'Title is required' }), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Enter track title" }), errors.title && ((0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.title.message }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "singer", className: "block text-sm font-medium text-gray-700 mb-1", children: "Singer" }), (0, jsx_runtime_1.jsx)("input", { id: "singer", type: "text", ...register('singer'), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Vocalist name" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "lyricist", className: "block text-sm font-medium text-gray-700 mb-1", children: "Lyricist" }), (0, jsx_runtime_1.jsx)("input", { id: "lyricist", type: "text", ...register('lyricist'), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Lyrics writer" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "composer", className: "block text-sm font-medium text-gray-700 mb-1", children: "Composer" }), (0, jsx_runtime_1.jsx)("input", { id: "composer", type: "text", ...register('composer'), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Music composer" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "producer", className: "block text-sm font-medium text-gray-700 mb-1", children: "Producer" }), (0, jsx_runtime_1.jsx)("input", { id: "producer", type: "text", ...register('producer'), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Track producer" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "featuring", className: "block text-sm font-medium text-gray-700 mb-1", children: "Featuring" }), (0, jsx_runtime_1.jsx)("input", { id: "featuring", type: "text", ...register('featuring'), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Featured artists" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "genre", className: "block text-sm font-medium text-gray-700 mb-1", children: "Genre" }), (0, jsx_runtime_1.jsx)("input", { id: "genre", type: "text", ...register('genre'), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Pop, Rock, etc." })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "language", className: "block text-sm font-medium text-gray-700 mb-1", children: "Language" }), (0, jsx_runtime_1.jsx)("input", { id: "language", type: "text", ...register('language'), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "English, Hindi, etc." })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "isrc", className: "block text-sm font-medium text-gray-700 mb-1", children: "ISRC" }), (0, jsx_runtime_1.jsx)("input", { id: "isrc", type: "text", ...register('isrc'), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "ISRC code" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "crbtStartTime", className: "block text-sm font-medium text-gray-700 mb-1", children: "CRBT Start (seconds)" }), (0, jsx_runtime_1.jsx)("input", { id: "crbtStartTime", type: "number", ...register('crbtStartTime', { valueAsNumber: true }), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "30" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "crbtEndTime", className: "block text-sm font-medium text-gray-700 mb-1", children: "CRBT End (seconds)" }), (0, jsx_runtime_1.jsx)("input", { id: "crbtEndTime", type: "number", ...register('crbtEndTime', { valueAsNumber: true }), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "60" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Audio File (MP3 only) ", (0, jsx_runtime_1.jsx)("span", { className: "text-red-600", children: "*" })] }), (0, jsx_runtime_1.jsx)("input", { type: "file", accept: ".mp3,audio/mpeg", required: true, onChange: (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                if (!file.name.toLowerCase().endsWith('.mp3') && file.type !== 'audio/mpeg') {
                                                    react_hot_toast_1.toast.error('Only MP3 files are allowed');
                                                    e.target.value = '';
                                                    return;
                                                }
                                                setAudioFile(file);
                                            }
                                        }, className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" }), audioFile && ((0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-green-600 mt-1", children: ["\u2713 ", audioFile.name] })), !audioFile && ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-600 mt-1", children: "Audio file is required" }))] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: addTrackMutation.isPending || !audioFile, className: "w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition disabled:opacity-70", children: addTrackMutation.isPending ? 'Adding...' : 'Add Track' })] }))] }), (canEdit || canEditRejected) && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold text-gray-800 mb-4", children: canEditRejected ? 'Resubmit for Review' : 'Submit for Review' }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-4", children: canEditRejected
                            ? 'After making the necessary changes, resubmit your release for admin review.'
                            : 'Once you\'re done adding tracks, submit your release for admin review.' }), (0, jsx_runtime_1.jsx)("button", { onClick: handleSubmitForReview, disabled: submitForReviewMutation.isPending || !release.tracks || release.tracks.length === 0, className: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-6 rounded-md hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-70", children: submitForReviewMutation.isPending
                            ? (canEditRejected ? 'Resubmitting...' : 'Submitting...')
                            : (canEditRejected ? 'Resubmit for Review' : 'Submit for Review') })] }))] }));
}
