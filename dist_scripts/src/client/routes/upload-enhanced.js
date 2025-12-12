"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadEnhancedRoute = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_1 = require("@tanstack/react-router");
const react_hook_form_1 = require("react-hook-form");
const react_hot_toast_1 = require("react-hot-toast");
const react_query_1 = require("@tanstack/react-query");
const root_1 = require("./root");
const api_1 = require("../api");
const CustomLabelModal_1 = require("../components/CustomLabelModal");
exports.uploadEnhancedRoute = (0, react_router_1.createRoute)({
    getParentRoute: () => root_1.rootRoute,
    path: '/upload',
    component: UploadEnhancedComponent,
});
function UploadEnhancedComponent() {
    const navigate = (0, react_router_1.useNavigate)();
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [artworkFile, setArtworkFile] = (0, react_1.useState)(null);
    const [artworkPreview, setArtworkPreview] = (0, react_1.useState)(null);
    const [selectedArtist, setSelectedArtist] = (0, react_1.useState)(null);
    const [tracks, setTracks] = (0, react_1.useState)([]);
    const [showArtistDropdown, setShowArtistDropdown] = (0, react_1.useState)(false);
    const [isCustomLabelModalOpen, setIsCustomLabelModalOpen] = (0, react_1.useState)(false);
    const { register, handleSubmit, watch, setValue, formState: { errors } } = (0, react_hook_form_1.useForm)({
        defaultValues: {
            subLabelId: '',
            albumCategoryId: '',
            contentTypeId: '',
            primaryArtistName: '',
        },
    });
    const primaryArtistName = watch('primaryArtistName');
    // Fetch sub-labels
    const { data: subLabels } = (0, react_query_1.useQuery)({
        queryKey: ['subLabels'],
        queryFn: () => api_1.api.metadata.getSubLabels(),
    });
    // Fetch publishers
    const { data: publishers } = (0, react_query_1.useQuery)({
        queryKey: ['publishers'],
        queryFn: () => api_1.api.metadata.getPublishers(),
    });
    // Fetch album categories
    const { data: albumCategories } = (0, react_query_1.useQuery)({
        queryKey: ['albumCategories'],
        queryFn: () => api_1.api.metadata.getAlbumCategories(),
    });
    // Fetch content types
    const { data: contentTypes } = (0, react_query_1.useQuery)({
        queryKey: ['contentTypes'],
        queryFn: () => api_1.api.metadata.getContentTypes(),
    });
    // Search artists
    const { data: artists } = (0, react_query_1.useQuery)({
        queryKey: ['artists', primaryArtistName],
        queryFn: () => primaryArtistName.length > 2 ? api_1.api.metadata.searchArtists(primaryArtistName) : Promise.resolve([]),
        enabled: primaryArtistName.length > 2,
    });
    // Create sub-label mutation
    const createSubLabelMutation = (0, react_query_1.useMutation)({
        mutationFn: (name) => api_1.api.metadata.createSubLabel(name),
    });
    // Create artist mutation
    const createArtistMutation = (0, react_query_1.useMutation)({
        mutationFn: (name) => api_1.api.metadata.createArtist(name),
    });
    const handleArtworkChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.match(/image\/(jpg|jpeg|png)/)) {
                react_hot_toast_1.toast.error('Please upload a JPG, JPEG, or PNG file');
                e.target.value = '';
                return;
            }
            // Check image dimensions
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(objectUrl);
                const width = img.width;
                const height = img.height;
                // Validate dimensions: must be square and between 1600x1600 and 3000x3000
                if (width !== height) {
                    react_hot_toast_1.toast.error('Album artwork must be square (equal width and height)');
                    e.target.value = '';
                    return;
                }
                if (width < 1600 || width > 3000) {
                    react_hot_toast_1.toast.error('Album artwork must be between 1600x1600px and 3000x3000px');
                    e.target.value = '';
                    return;
                }
                // Dimensions are valid, proceed with file
                setArtworkFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setArtworkPreview(reader.result);
                };
                reader.readAsDataURL(file);
                react_hot_toast_1.toast.success(`✓ Valid artwork: ${width}x${height}px`);
            };
            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                react_hot_toast_1.toast.error('Failed to load image');
                e.target.value = '';
            };
            img.src = objectUrl;
        }
    };
    const handleArtistSelect = (artist) => {
        setSelectedArtist(artist);
        setValue('primaryArtistName', artist.name);
        setShowArtistDropdown(false);
    };
    const addTrack = () => {
        setTracks([...tracks, { title: '', genre: '', language: '', isrc: '' }]);
    };
    const updateTrack = (index, field, value) => {
        const updatedTracks = [...tracks];
        updatedTracks[index] = { ...updatedTracks[index], [field]: value };
        setTracks(updatedTracks);
    };
    const removeTrack = (index) => {
        setTracks(tracks.filter((_, i) => i !== index));
    };
    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            // Validate artwork
            if (!artworkFile) {
                react_hot_toast_1.toast.error('Please upload album artwork');
                return;
            }
            // Validate tracks
            if (tracks.length === 0) {
                react_hot_toast_1.toast.error('Please add at least one track');
                return;
            }
            // Use selected sub-label
            const subLabelId = data.subLabelId;
            // Create or find artist
            let primaryArtistId;
            if (selectedArtist) {
                primaryArtistId = selectedArtist.id;
            }
            else if (data.primaryArtistName) {
                const newArtist = await createArtistMutation.mutateAsync(data.primaryArtistName);
                primaryArtistId = newArtist.id;
            }
            // Create release with all fields
            const release = await api_1.api.releases.create({
                title: data.title,
                upc: data.upc,
                originalReleaseDate: data.originalReleaseDate,
                goLiveDate: data.goLiveDate,
                albumCategoryId: data.albumCategoryId,
                contentTypeId: data.contentTypeId,
                cLine: 'Internet Records', // Fixed value
                subLabelId,
                publisherId: data.publisherId,
                primaryArtistId,
            });
            // Upload artwork
            if (artworkFile) {
                const uploadUrlResponse = await api_1.api.upload.getPresignedUrl({
                    fileType: 'ARTWORK',
                    fileName: artworkFile.name,
                    releaseId: release.id,
                });
                await fetch(uploadUrlResponse.uploadUrl, {
                    method: 'PUT',
                    body: artworkFile,
                    headers: {
                        'Content-Type': artworkFile.type,
                    },
                });
            }
            // Add tracks
            for (const track of tracks) {
                // Validate audio file is required
                if (!track.audioFile) {
                    throw new Error(`Audio file is required for track: ${track.title}`);
                }
                const trackData = {
                    title: track.title,
                    genre: track.genre,
                    language: track.language,
                    isrc: track.isrc,
                    singer: track.singer,
                    lyricist: track.lyricist,
                    composer: track.composer,
                    producer: track.producer,
                    featuring: track.featuring,
                    crbtStartTime: track.crbtStartTime,
                    crbtEndTime: track.crbtEndTime,
                };
                const createdTrack = await api_1.api.releases.addTrack(release.id, trackData);
                // Upload audio file (now required)
                if (track.audioFile) {
                    const audioUploadResponse = await api_1.api.upload.getPresignedUrl({
                        fileType: 'AUDIO',
                        fileName: track.audioFile.name,
                        releaseId: release.id,
                    });
                    await fetch(audioUploadResponse.uploadUrl, {
                        method: 'PUT',
                        body: track.audioFile,
                        headers: {
                            'Content-Type': track.audioFile.type,
                        },
                    });
                    // Update track with audio URL
                    await api_1.api.upload.updateTrackAudio({
                        trackId: createdTrack.id,
                        audioUrl: audioUploadResponse.fileUrl,
                    });
                }
            }
            react_hot_toast_1.toast.success('Release created successfully!');
            navigate({ to: '/release/$releaseId', params: { releaseId: release.id } });
        }
        catch (error) {
            console.error('Create release error:', error);
            react_hot_toast_1.toast.error(error.message || 'Failed to create release');
        }
        finally {
            setIsLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-4xl mx-auto", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-gray-800 mb-6", children: "Create New Release" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit(onSubmit), className: "bg-white rounded-lg shadow-md p-6 space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "border-b pb-4", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "Sub-Label" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Select Sub-Label *" }), (0, jsx_runtime_1.jsxs)("select", { ...register('subLabelId', { required: 'Sub-label is required' }), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "--Select a sub-label--" }), subLabels?.map((label) => ((0, jsx_runtime_1.jsx)("option", { value: label.id, children: label.name }, label.id)))] }), errors.subLabelId && ((0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.subLabelId.message })), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mt-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500", children: "Can't find your label?" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setIsCustomLabelModalOpen(true), className: "text-sm text-indigo-600 hover:text-indigo-800 font-medium", children: "Request Custom Label" })] })] })] }), (0, jsx_runtime_1.jsx)(CustomLabelModal_1.CustomLabelModal, { isOpen: isCustomLabelModalOpen, onClose: () => setIsCustomLabelModalOpen(false) }), (0, jsx_runtime_1.jsxs)("div", { className: "border-b pb-4", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "Basic Information" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Title *" }), (0, jsx_runtime_1.jsx)("input", { type: "text", ...register('title', { required: 'Title is required' }), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Album/Release title" }), errors.title && ((0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.title.message }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "UPC" }), (0, jsx_runtime_1.jsx)("input", { type: "text", ...register('upc'), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Universal Product Code" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Original Release Date *" }), (0, jsx_runtime_1.jsx)("input", { type: "date", ...register('originalReleaseDate', { required: 'Original release date is required' }), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" }), errors.originalReleaseDate && ((0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.originalReleaseDate.message }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Go Live Date *" }), (0, jsx_runtime_1.jsx)("input", { type: "date", ...register('goLiveDate', { required: 'Go live date is required' }), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" }), errors.goLiveDate && ((0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.goLiveDate.message }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Album Category *" }), (0, jsx_runtime_1.jsxs)("select", { ...register('albumCategoryId', { required: 'Album category is required' }), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "--Select an option--" }), albumCategories?.map((category) => ((0, jsx_runtime_1.jsx)("option", { value: category.id, children: category.name }, category.id)))] }), errors.albumCategoryId && ((0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.albumCategoryId.message }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Content Type *" }), (0, jsx_runtime_1.jsxs)("select", { ...register('contentTypeId', { required: 'Content type is required' }), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "--Select an option--" }), contentTypes?.map((type) => ((0, jsx_runtime_1.jsx)("option", { value: type.id, children: type.name }, type.id)))] }), errors.contentTypeId && ((0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.contentTypeId.message }))] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "border-b pb-4", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "Copyright & Publisher" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "C Line" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: "Internet Records", disabled: true, className: "w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mt-1", children: "Fixed copyright line" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Publisher" }), (0, jsx_runtime_1.jsxs)("select", { ...register('publisherId'), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "--Select Publisher--" }), publishers?.map((pub) => ((0, jsx_runtime_1.jsx)("option", { value: pub.id, children: pub.name }, pub.id)))] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "border-b pb-4", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "Inlay / Album Art *" }), (0, jsx_runtime_1.jsx)("div", { className: "bg-blue-50 border border-blue-200 rounded-md p-3 mb-4", children: (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-blue-800", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Requirements:" }), " Square image (equal width and height), minimum 1600x1600px, maximum 3000x3000px"] }) }), (0, jsx_runtime_1.jsx)("div", { className: "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center", children: artworkPreview ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("img", { src: artworkPreview, alt: "Artwork preview", className: "max-w-xs mx-auto mb-4" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => {
                                                setArtworkFile(null);
                                                setArtworkPreview(null);
                                            }, className: "text-red-600 hover:text-red-800", children: "Remove" })] })) : ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-2", children: "Drop file here OR" }), (0, jsx_runtime_1.jsxs)("label", { className: "cursor-pointer inline-block bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700", children: ["Browse files", (0, jsx_runtime_1.jsx)("input", { type: "file", accept: ".jpg,.jpeg,.png", onChange: handleArtworkChange, className: "hidden" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mt-2", children: "JPG, JPEG, or PNG (1600x1600px - 3000x3000px)" })] })) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "border-b pb-4", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "Primary Artist" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Artist Name *" }), (0, jsx_runtime_1.jsx)("input", { type: "text", ...register('primaryArtistName', { required: 'Artist name is required' }), onChange: (e) => {
                                            setValue('primaryArtistName', e.target.value);
                                            setShowArtistDropdown(e.target.value.length > 2);
                                            setSelectedArtist(null);
                                        }, className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Type artist name..." }), errors.primaryArtistName && ((0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.primaryArtistName.message })), showArtistDropdown && artists && artists.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto", children: artists.map((artist) => ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => handleArtistSelect(artist), className: "w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0", children: artist.name }, artist.id))) })), selectedArtist && ((0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-green-600 mt-1", children: ["\u2713 Selected: ", selectedArtist.name] })), primaryArtistName && primaryArtistName.length > 2 && !selectedArtist && (!artists || artists.length === 0) && ((0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-blue-600 mt-1", children: ["New artist \"", primaryArtistName, "\" will be created"] }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "border-b pb-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-4", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold", children: "Tracks" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: addTrack, className: "bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700", children: "Add Track" })] }), tracks.map((track, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "border border-gray-200 rounded-md p-4 mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-3", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "font-medium", children: ["Track ", index + 1] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => removeTrack(index), className: "text-red-600 hover:text-red-800", children: "Remove" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Track Title *" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: track.title, onChange: (e) => updateTrack(index, 'title', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Enter track title", required: true })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Genre" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: track.genre || '', onChange: (e) => updateTrack(index, 'genre', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Pop, Rock, etc." })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Language" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: track.language || '', onChange: (e) => updateTrack(index, 'language', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "English, Hindi, etc." })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "ISRC" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: track.isrc || '', onChange: (e) => updateTrack(index, 'isrc', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "International Standard Recording Code" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Singer" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: track.singer || '', onChange: (e) => updateTrack(index, 'singer', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Singer name" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Lyricist" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: track.lyricist || '', onChange: (e) => updateTrack(index, 'lyricist', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Lyricist name" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Composer" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: track.composer || '', onChange: (e) => updateTrack(index, 'composer', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Composer name" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Producer" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: track.producer || '', onChange: (e) => updateTrack(index, 'producer', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Producer name" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Featuring" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: track.featuring || '', onChange: (e) => updateTrack(index, 'featuring', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Featured artists" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Audio File (MP3 only) ", (0, jsx_runtime_1.jsx)("span", { className: "text-red-600", children: "*" })] }), (0, jsx_runtime_1.jsx)("input", { type: "file", accept: ".mp3,audio/mpeg", required: true, onChange: (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                // Validate MP3 format
                                                                if (!file.name.toLowerCase().endsWith('.mp3') && file.type !== 'audio/mpeg') {
                                                                    react_hot_toast_1.toast.error('Only MP3 files are allowed for audio uploads');
                                                                    e.target.value = '';
                                                                    return;
                                                                }
                                                                updateTrack(index, 'audioFile', file);
                                                            }
                                                        }, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" }), track.audioFile && ((0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-green-600 mt-1", children: ["\u2713 ", track.audioFile.name] })), !track.audioFile && ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-600 mt-1", children: "Audio file is required" }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium mb-2", children: "CRBT (Caller Ring Back Tone) Time" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Start Time (seconds)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", value: track.crbtStartTime || '', onChange: (e) => updateTrack(index, 'crbtStartTime', parseInt(e.target.value) || 0), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "30" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "End Time (seconds)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", value: track.crbtEndTime || '', onChange: (e) => updateTrack(index, 'crbtEndTime', parseInt(e.target.value) || 0), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "60" })] })] })] })] }, index))), tracks.length === 0 && ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 text-center py-8", children: "No tracks added yet. Click \"Add Track\" to get started." }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end gap-4", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => navigate({ to: '/dashboard' }), className: "px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50", children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: isLoading, className: "px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 disabled:opacity-70", children: isLoading ? 'Creating...' : 'Create Release' })] })] })] }));
}
