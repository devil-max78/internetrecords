"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminYoutubeClaimsRoute = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_1 = require("@tanstack/react-router");
const react_hot_toast_1 = require("react-hot-toast");
const react_query_1 = require("@tanstack/react-query");
const root_1 = require("./root");
const AuthContext_1 = require("../context/AuthContext");
const api_1 = require("../api");
exports.adminYoutubeClaimsRoute = (0, react_router_1.createRoute)({
    getParentRoute: () => root_1.rootRoute,
    path: '/admin/youtube-claims',
    component: AdminYoutubeClaimsComponent,
});
function AdminYoutubeClaimsComponent() {
    const { user } = (0, AuthContext_1.useAuth)();
    const queryClient = (0, react_query_1.useQueryClient)();
    const [selectedClaim, setSelectedClaim] = (0, react_1.useState)(null);
    const [status, setStatus] = (0, react_1.useState)('');
    const [notes, setNotes] = (0, react_1.useState)('');
    const { data: claims, isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['adminYoutubeClaims'],
        queryFn: () => api_1.api.youtubeClaims.getAllAdmin(),
    });
    const updateStatusMutation = (0, react_query_1.useMutation)({
        mutationFn: ({ id, status, notes }) => api_1.api.youtubeClaims.updateStatus(id, status, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminYoutubeClaims'] });
            setSelectedClaim(null);
            setStatus('');
            setNotes('');
            react_hot_toast_1.toast.success('Claim status updated successfully');
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to update claim status');
        },
    });
    if (user?.role !== 'ADMIN') {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "text-center p-8", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-red-600 mb-2", children: "Access Denied" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "You need admin privileges to access this page." })] }));
    }
    const handleUpdateStatus = (e) => {
        e.preventDefault();
        if (!selectedClaim || !status)
            return;
        updateStatusMutation.mutate({
            id: selectedClaim.id,
            status,
            notes: notes.trim() || undefined,
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
    const getStatusCounts = () => {
        if (!claims)
            return { pending: 0, processing: 0, completed: 0, rejected: 0 };
        return {
            pending: claims.filter((c) => c.status === 'PENDING').length,
            processing: claims.filter((c) => c.status === 'PROCESSING').length,
            completed: claims.filter((c) => c.status === 'COMPLETED').length,
            rejected: claims.filter((c) => c.status === 'REJECTED').length,
        };
    };
    const counts = getStatusCounts();
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-between items-center", children: (0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-indigo-800", children: "YouTube Claims Management" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-yellow-800", children: "Pending" }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-bold text-yellow-900", children: counts.pending })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-blue-800", children: "Processing" }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-bold text-blue-900", children: counts.processing })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-green-800", children: "Completed" }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-bold text-green-900", children: counts.completed })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-red-800", children: "Rejected" }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-bold text-red-900", children: counts.rejected })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "bg-white rounded-lg shadow-md overflow-hidden", children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold text-gray-800 mb-4", children: "All Claims" }), isLoading ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-gray-600", children: "Loading..." })] })) : claims && claims.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "min-w-full divide-y divide-gray-200", children: [(0, jsx_runtime_1.jsx)("thead", { className: "bg-gray-50", children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "User" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Video URLs" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Submitted" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { className: "bg-white divide-y divide-gray-200", children: claims.map((claim) => ((0, jsx_runtime_1.jsxs)("tr", { className: "hover:bg-gray-50", children: [(0, jsx_runtime_1.jsxs)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: ["User ID: ", claim.userId.substring(0, 8), "..."] }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 text-sm text-gray-900", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-xs", children: [claim.videoUrls.split(',').slice(0, 2).map((url, i) => ((0, jsx_runtime_1.jsx)("div", { className: "truncate", children: (0, jsx_runtime_1.jsx)("a", { href: url.trim(), target: "_blank", rel: "noopener noreferrer", className: "text-indigo-600 hover:text-indigo-800 hover:underline", children: url.trim() }) }, i))), claim.videoUrls.split(',').length > 2 && ((0, jsx_runtime_1.jsxs)("span", { className: "text-xs text-gray-500", children: ["+", claim.videoUrls.split(',').length - 2, " more"] }))] }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: new Date(claim.submittedAt).toLocaleDateString() }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap", children: getStatusBadge(claim.status) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium", children: (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                                            setSelectedClaim(claim);
                                                            setStatus(claim.status);
                                                            setNotes(claim.notes || '');
                                                        }, className: "text-indigo-600 hover:text-indigo-900", children: "Manage" }) })] }, claim.id))) })] }) })) : ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 text-center py-4", children: "No claims found" }))] }) }), selectedClaim && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xl font-semibold mb-4", children: "Update Claim Status" }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-4 p-4 bg-gray-50 rounded", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-600 mb-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Submitted:" }), ' ', new Date(selectedClaim.submittedAt).toLocaleString()] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 mb-2", children: (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Video URLs:" }) }), (0, jsx_runtime_1.jsx)("div", { className: "ml-4 space-y-1", children: selectedClaim.videoUrls.split(',').map((url, i) => ((0, jsx_runtime_1.jsx)("a", { href: url.trim(), target: "_blank", rel: "noopener noreferrer", className: "block text-sm text-indigo-600 hover:text-indigo-800 hover:underline", children: url.trim() }, i))) })] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleUpdateStatus, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status *" }), (0, jsx_runtime_1.jsxs)("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", required: true, children: [(0, jsx_runtime_1.jsx)("option", { value: "PENDING", children: "Pending" }), (0, jsx_runtime_1.jsx)("option", { value: "PROCESSING", children: "Processing" }), (0, jsx_runtime_1.jsx)("option", { value: "COMPLETED", children: "Completed" }), (0, jsx_runtime_1.jsx)("option", { value: "REJECTED", children: "Rejected" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Notes (Optional)" }), (0, jsx_runtime_1.jsx)("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), rows: 3, className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Add any notes or comments..." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end space-x-3", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => {
                                                setSelectedClaim(null);
                                                setStatus('');
                                                setNotes('');
                                            }, className: "px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400", children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: updateStatusMutation.isPending, className: "px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50", children: updateStatusMutation.isPending ? 'Updating...' : 'Update Status' })] })] })] }) }))] }));
}
