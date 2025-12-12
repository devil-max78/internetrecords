"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.artistRoute = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_1 = require("@tanstack/react-router");
const react_hot_toast_1 = require("react-hot-toast");
const root_1 = require("./root");
const AuthContext_1 = require("../context/AuthContext");
// Mock releases data
const mockUserReleases = [
    {
        id: '101',
        title: 'Midnight Dreams',
        status: 'PENDING',
        createdAt: '2023-08-10T14:30:00Z',
        tracks: [
            { id: '1001', title: 'Starlight', duration: '3:45' },
            { id: '1002', title: 'Moonwalk', duration: '4:12' }
        ]
    },
    {
        id: '102',
        title: 'Urban Jungle',
        status: 'APPROVED',
        createdAt: '2023-07-22T09:15:00Z',
        tracks: [
            { id: '1003', title: 'City Beats', duration: '3:30' },
            { id: '1004', title: 'Concrete Dreams', duration: '4:05' }
        ]
    }
];
// Status badge component
const StatusBadge = ({ status }) => {
    let bgColor = '';
    let textColor = '';
    switch (status) {
        case 'PENDING':
            bgColor = 'bg-yellow-100';
            textColor = 'text-yellow-800';
            break;
        case 'APPROVED':
            bgColor = 'bg-green-100';
            textColor = 'text-green-800';
            break;
        case 'REJECTED':
            bgColor = 'bg-red-100';
            textColor = 'text-red-800';
            break;
        default:
            bgColor = 'bg-gray-100';
            textColor = 'text-gray-800';
    }
    return ((0, jsx_runtime_1.jsx)("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`, children: status }));
};
exports.artistRoute = (0, react_router_1.createRoute)({
    getParentRoute: () => root_1.rootRoute,
    path: '/artist',
    component: ArtistComponent,
});
function ArtistComponent() {
    const { user } = (0, AuthContext_1.useAuth)();
    const [releases, setReleases] = (0, react_1.useState)(mockUserReleases);
    const [selectedReleaseId, setSelectedReleaseId] = (0, react_1.useState)(null);
    const [isUploading, setIsUploading] = (0, react_1.useState)(false);
    const [newRelease, setNewRelease] = (0, react_1.useState)({
        title: '',
        tracks: [{ title: '', file: null }]
    });
    // Redirect if not artist
    if (user?.role !== 'ARTIST') {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "text-center p-8", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-red-600 mb-2", children: "Access Denied" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "You need artist privileges to access this page." })] }));
    }
    const handleAddTrack = () => {
        setNewRelease(prev => ({
            ...prev,
            tracks: [...prev.tracks, { title: '', file: null }]
        }));
    };
    const handleTrackChange = (index, field, value) => {
        setNewRelease(prev => {
            const updatedTracks = [...prev.tracks];
            updatedTracks[index] = { ...updatedTracks[index], [field]: value };
            return { ...prev, tracks: updatedTracks };
        });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsUploading(true);
        // Simulate API call
        setTimeout(() => {
            const newId = `${Date.now()}`;
            const newReleaseData = {
                id: newId,
                title: newRelease.title,
                status: 'PENDING',
                createdAt: new Date().toISOString(),
                tracks: newRelease.tracks.map((track, index) => ({
                    id: `${newId}-${index}`,
                    title: track.title,
                    duration: '0:00' // Placeholder
                }))
            };
            setReleases(prev => [newReleaseData, ...prev]);
            setNewRelease({
                title: '',
                tracks: [{ title: '', file: null }]
            });
            setIsUploading(false);
            react_hot_toast_1.toast.success('Release submitted successfully!');
        }, 1500);
    };
    const selectedRelease = releases.find(r => r.id === selectedReleaseId);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-8", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-indigo-800 mb-6", children: "Artist Dashboard" }), (0, jsx_runtime_1.jsx)("div", { className: "bg-white rounded-lg shadow-md overflow-hidden mb-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold text-gray-800 mb-4", children: "Upload New Release" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-4", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-gray-700 text-sm font-bold mb-2", htmlFor: "title", children: "Release Title" }), (0, jsx_runtime_1.jsx)("input", { id: "title", type: "text", value: newRelease.title, onChange: (e) => setNewRelease(prev => ({ ...prev, title: e.target.value })), className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline", required: true })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-4", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-gray-700 text-sm font-bold mb-2", children: "Tracks" }), newRelease.tracks.map((track, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4 mb-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-grow", children: (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Track title", value: track.title, onChange: (e) => handleTrackChange(index, 'title', e.target.value), className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline", required: true }) }), (0, jsx_runtime_1.jsx)("div", { className: "flex-grow", children: (0, jsx_runtime_1.jsx)("input", { type: "file", onChange: (e) => handleTrackChange(index, 'file', e.target.files?.[0] || null), className: "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100", accept: "audio/*", required: true }) })] }, index))), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: handleAddTrack, className: "mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition", children: "+ Add Track" })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-end", children: (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: isUploading, className: "px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:bg-indigo-300", children: isUploading ? ((0, jsx_runtime_1.jsxs)("span", { className: "flex items-center", children: [(0, jsx_runtime_1.jsxs)("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [(0, jsx_runtime_1.jsx)("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), (0, jsx_runtime_1.jsx)("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Uploading..."] })) : 'Submit Release' }) })] })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "bg-white rounded-lg shadow-md overflow-hidden", children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold text-gray-800 mb-4", children: "Your Releases" }), releases.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 text-center py-4", children: "You haven't uploaded any releases yet." })) : ((0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "min-w-full divide-y divide-gray-200", children: [(0, jsx_runtime_1.jsx)("thead", { className: "bg-gray-50", children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Title" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Date" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { className: "bg-white divide-y divide-gray-200", children: releases.map((release) => ((0, jsx_runtime_1.jsxs)("tr", { className: "hover:bg-gray-50", children: [(0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap", children: (0, jsx_runtime_1.jsx)("div", { className: "text-sm font-medium text-gray-900", children: release.title }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap", children: (0, jsx_runtime_1.jsx)(StatusBadge, { status: release.status }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: new Date(release.createdAt).toLocaleDateString() }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium", children: (0, jsx_runtime_1.jsx)("button", { onClick: () => setSelectedReleaseId(release.id), className: "text-indigo-600 hover:text-indigo-900", children: "View Details" }) })] }, release.id))) })] }) }))] }) })] }), selectedRelease && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: (0, jsx_runtime_1.jsx)("div", { className: "bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-4", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold text-gray-800", children: "Release Details" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setSelectedReleaseId(null), className: "text-gray-500 hover:text-gray-700", children: (0, jsx_runtime_1.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: selectedRelease.title }), (0, jsx_runtime_1.jsxs)("p", { className: "text-gray-600 mb-1", children: ["Status: ", (0, jsx_runtime_1.jsx)(StatusBadge, { status: selectedRelease.status })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-gray-600 mb-4", children: ["Submitted: ", new Date(selectedRelease.createdAt).toLocaleDateString()] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-md font-medium text-gray-900 mb-2", children: "Tracks" }), (0, jsx_runtime_1.jsx)("ul", { className: "divide-y divide-gray-200", children: selectedRelease.tracks.map((track) => ((0, jsx_runtime_1.jsx)("li", { className: "py-3", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-800", children: track.title }), (0, jsx_runtime_1.jsx)("span", { className: "text-gray-500", children: track.duration })] }) }, track.id))) })] })] }) }) }))] }));
}
exports.default = exports.artistRoute;
