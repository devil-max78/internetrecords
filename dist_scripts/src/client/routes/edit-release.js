"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editReleaseRoute = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_1 = require("@tanstack/react-router");
const react_hook_form_1 = require("react-hook-form");
const react_hot_toast_1 = require("react-hot-toast");
const react_query_1 = require("@tanstack/react-query");
const root_1 = require("./root");
const api_1 = require("../api");
exports.editReleaseRoute = (0, react_router_1.createRoute)({
    getParentRoute: () => root_1.rootRoute,
    path: '/release/$releaseId/edit',
    component: EditReleaseComponent,
});
function EditReleaseComponent() {
    const { releaseId } = exports.editReleaseRoute.useParams();
    const navigate = (0, react_router_1.useNavigate)();
    const queryClient = (0, react_query_1.useQueryClient)();
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [artworkFile, setArtworkFile] = (0, react_1.useState)(null);
    const [artworkPreview, setArtworkPreview] = (0, react_1.useState)(null);
    const [tracks, setTracks] = (0, react_1.useState)([]);
    const { data: release, isLoading: loadingRelease } = (0, react_query_1.useQuery)({
        queryKey: ['release', releaseId],
        queryFn: () => api_1.api.releases.getById(releaseId),
    });
    const { data: subLabels } = (0, react_query_1.useQuery)({
        queryKey: ['subLabels'],
        queryFn: () => api_1.api.metadata.getSubLabels(),
    });
    const { data: publishers } = (0, react_query_1.useQuery)({
        queryKey: ['publishers'],
        queryFn: () => api_1.api.metadata.getPublishers(),
    });
    const { data: albumCategories } = (0, react_query_1.useQuery)({
        queryKey: ['albumCategories'],
        queryFn: () => api_1.api.metadata.getAlbumCategories(),
    });
    const { data: contentTypes } = (0, react_query_1.useQuery)({
        queryKey: ['contentTypes'],
        queryFn: () => api_1.api.metadata.getContentTypes(),
    });
    const { register, handleSubmit, formState: { errors }, reset } = (0, react_hook_form_1.useForm)();
    // Load existing data when release is fetched
    (0, react_1.useEffect)(() => {
        if (release) {
            reset({
                title: release.title,
                upc: release.upc,
                originalReleaseDate: release.originalReleaseDate,
                goLiveDate: release.goLiveDate,
                subLabelId: release.subLabelId,
                albumCategoryId: release.albumCategoryId,
                contentTypeId: release.contentTypeId,
                publisherId: release.publisherId,
                primaryArtistName: release.primaryArtistName,
            });
            // Load existing tracks
            if (release.tracks && release.tracks.length > 0) {
                setTracks(release.tracks.map((track) => ({
                    id: track.id,
                    title: track.title,
                    genre: track.genre,
                    language: track.language,
                    isrc: track.isrc,
                    lyricist: track.lyricist,
                    composer: track.composer,
                    producer: track.producer,
                    featuring: track.featuring,
                    singer: track.singer,
                    crbtStartTime: track.crbtStartTime,
                    crbtEndTime: track.crbtEndTime,
                    existingAudioUrl: track.audioUrl,
                })));
            }
            // Set existing artwork preview
            if (release.artworkUrl) {
                setArtworkPreview(release.artworkUrl);
            }
        }
    }, [release, reset]);
    const updateTrack = (index, field, value) => {
        const newTracks = [...tracks];
        newTracks[index] = { ...newTracks[index], [field]: value };
        setTracks(newTracks);
    };
    const addTrack = () => {
        setTracks([...tracks, { title: '', genre: '', language: '', isrc: '' }]);
    };
    const removeTrack = (index) => {
        setTracks(tracks.filter((_, i) => i !== index));
    };
    const handleArtworkChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setArtworkFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setArtworkPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const updateMutation = (0, react_query_1.useMutation)({
        mutationFn: (data) => api_1.api.releases.update(releaseId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['release', releaseId] });
            react_hot_toast_1.toast.success('Release updated successfully!');
            navigate({ to: '/release/$releaseId', params: { releaseId } });
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to update release');
        },
    });
    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await updateMutation.mutateAsync(data);
        }
        finally {
            setIsLoading(false);
        }
    };
    if (loadingRelease) {
        return (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center items-center h-64", children: "Loading..." });
    }
    if (!release) {
        return (0, jsx_runtime_1.jsx)("div", { className: "text-center text-red-600", children: "Release not found" });
    }
    // Check if user can edit
    const canEdit = release.status === 'DRAFT' ||
        release.status === 'UNDER_REVIEW' ||
        (release.status === 'REJECTED' && release.allowResubmission);
    if (!canEdit) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "max-w-4xl mx-auto p-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-red-50 border border-red-200 rounded-md p-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-red-800", children: "This release cannot be edited." }), (0, jsx_runtime_1.jsx)("button", { onClick: () => navigate({ to: '/release/$releaseId', params: { releaseId } }), className: "mt-4 text-indigo-600 hover:text-indigo-800", children: "\u2190 Back to Release" })] }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-4xl mx-auto p-6", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => navigate({ to: '/release/$releaseId', params: { releaseId } }), className: "text-indigo-600 hover:text-indigo-800 mb-4", children: "\u2190 Back to Release" }), (0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold mb-6", children: "Edit Release" }), release.status === 'REJECTED' && release.rejectionReason && ((0, jsx_runtime_1.jsxs)("div", { className: "mb-6 p-4 bg-red-50 border border-red-200 rounded-md", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-red-800 mb-1", children: "Rejection Reason:" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-700", children: release.rejectionReason })] })), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6 bg-white rounded-lg shadow-md p-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Release Title *" }), (0, jsx_runtime_1.jsx)("input", { type: "text", ...register('title', { required: 'Title is required' }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" }), errors.title && (0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.title.message })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "UPC *" }), (0, jsx_runtime_1.jsx)("input", { type: "text", ...register('upc', { required: 'UPC is required' }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" }), errors.upc && (0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.upc.message })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Primary Artist Name *" }), (0, jsx_runtime_1.jsx)("input", { type: "text", ...register('primaryArtistName', { required: 'Artist name is required' }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" }), errors.primaryArtistName && (0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.primaryArtistName.message })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Original Release Date *" }), (0, jsx_runtime_1.jsx)("input", { type: "date", ...register('originalReleaseDate', { required: 'Original release date is required' }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" }), errors.originalReleaseDate && (0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.originalReleaseDate.message })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Go Live Date *" }), (0, jsx_runtime_1.jsx)("input", { type: "date", ...register('goLiveDate', { required: 'Go live date is required' }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" }), errors.goLiveDate && (0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.goLiveDate.message })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Sub-Label *" }), (0, jsx_runtime_1.jsxs)("select", { ...register('subLabelId', { required: 'Sub-label is required' }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Select Sub-Label" }), subLabels?.map((label) => ((0, jsx_runtime_1.jsx)("option", { value: label.id, children: label.name }, label.id)))] }), errors.subLabelId && (0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.subLabelId.message })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Publisher *" }), (0, jsx_runtime_1.jsxs)("select", { ...register('publisherId', { required: 'Publisher is required' }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Select Publisher" }), publishers?.map((publisher) => ((0, jsx_runtime_1.jsx)("option", { value: publisher.id, children: publisher.name }, publisher.id)))] }), errors.publisherId && (0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.publisherId.message })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Album Category *" }), (0, jsx_runtime_1.jsxs)("select", { ...register('albumCategoryId', { required: 'Album category is required' }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Select Category" }), albumCategories?.map((category) => ((0, jsx_runtime_1.jsx)("option", { value: category.id, children: category.name }, category.id)))] }), errors.albumCategoryId && (0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.albumCategoryId.message })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Content Type *" }), (0, jsx_runtime_1.jsxs)("select", { ...register('contentTypeId', { required: 'Content type is required' }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Select Content Type" }), contentTypes?.map((type) => ((0, jsx_runtime_1.jsx)("option", { value: type.id, children: type.name }, type.id)))] }), errors.contentTypeId && (0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.contentTypeId.message })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-4", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => navigate({ to: '/release/$releaseId', params: { releaseId } }), className: "flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50", children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: isLoading, className: "flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50", children: isLoading ? 'Saving...' : 'Save Changes' })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-sm font-medium text-yellow-800 mb-2", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Important:" }), " This page only allows editing release-level metadata."] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-yellow-700 mb-2", children: "To edit the following, please create a new release with the corrected information:" }), (0, jsx_runtime_1.jsxs)("ul", { className: "text-sm text-yellow-700 list-disc list-inside space-y-1", children: [(0, jsx_runtime_1.jsx)("li", { children: "Album artwork" }), (0, jsx_runtime_1.jsx)("li", { children: "Track details (singer, composer, producer, lyricist, featuring)" }), (0, jsx_runtime_1.jsx)("li", { children: "Audio files" }), (0, jsx_runtime_1.jsx)("li", { children: "Track ISRC codes" }), (0, jsx_runtime_1.jsx)("li", { children: "CRBT timings" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-yellow-600 mt-2", children: "Recommendation: For rejected releases requiring extensive changes, create a new release to ensure all corrections are properly applied." })] })] }));
}
