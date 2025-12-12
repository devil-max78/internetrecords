"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSettingsRoute = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_1 = require("@tanstack/react-router");
const react_hot_toast_1 = require("react-hot-toast");
const react_query_1 = require("@tanstack/react-query");
const root_1 = require("./root");
const AuthContext_1 = require("../context/AuthContext");
const api_1 = require("../api");
exports.adminSettingsRoute = (0, react_router_1.createRoute)({
    getParentRoute: () => root_1.rootRoute,
    path: '/admin/settings',
    component: AdminSettingsComponent,
});
function AdminSettingsComponent() {
    const { user } = (0, AuthContext_1.useAuth)();
    const queryClient = (0, react_query_1.useQueryClient)();
    const [newSubLabel, setNewSubLabel] = (0, react_1.useState)('');
    const [newPublisher, setNewPublisher] = (0, react_1.useState)('');
    const [newAlbumCategory, setNewAlbumCategory] = (0, react_1.useState)('');
    const [newContentType, setNewContentType] = (0, react_1.useState)('');
    // Fetch all dropdown data
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
    const { data: users } = (0, react_query_1.useQuery)({
        queryKey: ['users'],
        queryFn: () => api_1.api.admin.getAllUsers(),
    });
    const { data: labelRequests } = (0, react_query_1.useQuery)({
        queryKey: ['customLabelRequests'],
        queryFn: () => api_1.api.customLabels.getAll(),
    });
    // Mutations
    const createSubLabelMutation = (0, react_query_1.useMutation)({
        mutationFn: (name) => api_1.api.admin.createSubLabel(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subLabels'] });
            setNewSubLabel('');
            react_hot_toast_1.toast.success('Sub-label added successfully');
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to add sub-label');
        },
    });
    const createPublisherMutation = (0, react_query_1.useMutation)({
        mutationFn: (name) => api_1.api.admin.createPublisher(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['publishers'] });
            setNewPublisher('');
            react_hot_toast_1.toast.success('Publisher added successfully');
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to add publisher');
        },
    });
    const createAlbumCategoryMutation = (0, react_query_1.useMutation)({
        mutationFn: (name) => api_1.api.admin.createAlbumCategory(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['albumCategories'] });
            setNewAlbumCategory('');
            react_hot_toast_1.toast.success('Album category added successfully');
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to add album category');
        },
    });
    const createContentTypeMutation = (0, react_query_1.useMutation)({
        mutationFn: (name) => api_1.api.admin.createContentType(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contentTypes'] });
            setNewContentType('');
            react_hot_toast_1.toast.success('Content type added successfully');
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to add content type');
        },
    });
    // Delete mutations
    const deleteSubLabelMutation = (0, react_query_1.useMutation)({
        mutationFn: (id) => api_1.api.admin.deleteSubLabel(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subLabels'] });
            react_hot_toast_1.toast.success('Sub-label deleted successfully');
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to delete sub-label');
        },
    });
    const deletePublisherMutation = (0, react_query_1.useMutation)({
        mutationFn: (id) => api_1.api.admin.deletePublisher(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['publishers'] });
            react_hot_toast_1.toast.success('Publisher deleted successfully');
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to delete publisher');
        },
    });
    const deleteAlbumCategoryMutation = (0, react_query_1.useMutation)({
        mutationFn: (id) => api_1.api.admin.deleteAlbumCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['albumCategories'] });
            react_hot_toast_1.toast.success('Album category deleted successfully');
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to delete album category');
        },
    });
    const deleteContentTypeMutation = (0, react_query_1.useMutation)({
        mutationFn: (id) => api_1.api.admin.deleteContentType(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contentTypes'] });
            react_hot_toast_1.toast.success('Content type deleted successfully');
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to delete content type');
        },
    });
    const approveLabelRequestMutation = (0, react_query_1.useMutation)({
        mutationFn: (id) => api_1.api.customLabels.approve(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['customLabelRequests'] });
            queryClient.invalidateQueries({ queryKey: ['subLabels'] }); // Update sub-labels list
            react_hot_toast_1.toast.success(`Label "${data.label.name}" approved`);
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to approve label');
        },
    });
    const rejectLabelRequestMutation = (0, react_query_1.useMutation)({
        mutationFn: ({ id, reason }) => api_1.api.customLabels.reject(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customLabelRequests'] });
            react_hot_toast_1.toast.success('Label request rejected');
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to reject label');
        },
    });
    const updateUserRoleMutation = (0, react_query_1.useMutation)({
        mutationFn: ({ id, role }) => api_1.api.admin.updateUserRole(id, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            react_hot_toast_1.toast.success('User role updated successfully');
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to update user role');
        },
    });
    if (user?.role !== 'ADMIN') {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "text-center p-8", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-red-600 mb-2", children: "Access Denied" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "You need admin privileges to access this page." })] }));
    }
    const handleAddSubLabel = (e) => {
        e.preventDefault();
        if (newSubLabel.trim()) {
            createSubLabelMutation.mutate(newSubLabel.trim());
        }
    };
    const handleAddPublisher = (e) => {
        e.preventDefault();
        if (newPublisher.trim()) {
            createPublisherMutation.mutate(newPublisher.trim());
        }
    };
    const handleAddAlbumCategory = (e) => {
        e.preventDefault();
        if (newAlbumCategory.trim()) {
            createAlbumCategoryMutation.mutate(newAlbumCategory.trim());
        }
    };
    const handleAddContentType = (e) => {
        e.preventDefault();
        if (newContentType.trim()) {
            createContentTypeMutation.mutate(newContentType.trim());
        }
    };
    const handleRoleChange = (userId, currentRole, userName) => {
        const roles = ['ARTIST', 'LABEL', 'ADMIN'];
        const newRole = window.prompt(`Change role for ${userName}\nCurrent: ${currentRole}\n\nEnter new role (ARTIST, LABEL, or ADMIN):`, currentRole);
        if (newRole && roles.includes(newRole.toUpperCase())) {
            updateUserRoleMutation.mutate({ id: userId, role: newRole.toUpperCase() });
        }
        else if (newRole) {
            react_hot_toast_1.toast.error('Invalid role. Must be ARTIST, LABEL, or ADMIN');
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-6xl mx-auto space-y-6", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-indigo-800", children: "Admin Settings" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Manage global dropdown options and users" }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "Custom Label Requests" }), labelRequests?.filter((r) => r.status === 'PENDING').length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 italic", children: "No pending requests." })) : ((0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "min-w-full divide-y divide-gray-200", children: [(0, jsx_runtime_1.jsx)("thead", { className: "bg-gray-50", children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Requested Label" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Artist" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Date" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { className: "bg-white divide-y divide-gray-200", children: labelRequests?.filter((r) => r.status === 'PENDING').map((req) => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap font-medium", children: req.name }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-gray-600", children: req.user?.name || 'Unknown' }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-gray-500", children: new Date(req.createdAt).toLocaleDateString() }), (0, jsx_runtime_1.jsxs)("td", { className: "px-6 py-4 whitespace-nowrap space-x-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => approveLabelRequestMutation.mutate(req.id), disabled: approveLabelRequestMutation.isPending, className: "text-green-600 hover:text-green-800 font-medium disabled:opacity-50", children: "Approve" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                                            const reason = window.prompt("Reason for rejection:");
                                                            if (reason !== null) {
                                                                rejectLabelRequestMutation.mutate({ id: req.id, reason });
                                                            }
                                                        }, disabled: rejectLabelRequestMutation.isPending, className: "text-red-600 hover:text-red-800 font-medium disabled:opacity-50", children: "Reject" })] })] }, req.id))) })] }) }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "User Management" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-600 mb-4", children: ["Total Users: ", (0, jsx_runtime_1.jsx)("strong", { children: users?.length || 0 }), " | Admins: ", (0, jsx_runtime_1.jsx)("strong", { children: users?.filter((u) => u.role === 'ADMIN').length || 0 }), " | Artists: ", (0, jsx_runtime_1.jsx)("strong", { children: users?.filter((u) => u.role === 'ARTIST').length || 0 }), " | Labels: ", (0, jsx_runtime_1.jsx)("strong", { children: users?.filter((u) => u.role === 'LABEL').length || 0 })] }), (0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "min-w-full divide-y divide-gray-200", children: [(0, jsx_runtime_1.jsx)("thead", { className: "bg-gray-50", children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Name" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Email" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Role" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Joined" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { className: "bg-white divide-y divide-gray-200", children: users?.map((u) => ((0, jsx_runtime_1.jsxs)("tr", { className: "hover:bg-gray-50", children: [(0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: u.name }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: u.email }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap", children: (0, jsx_runtime_1.jsx)("span", { className: `px-2 py-1 text-xs font-semibold rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                        u.role === 'LABEL' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-green-100 text-green-800'}`, children: u.role }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: new Date(u.createdAt).toLocaleDateString() }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium", children: (0, jsx_runtime_1.jsx)("button", { onClick: () => handleRoleChange(u.id, u.role, u.name), disabled: u.id === user?.id, className: "text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed", children: "Change Role" }) })] }, u.id))) })] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "Sub-Labels" }), (0, jsx_runtime_1.jsx)("form", { onSubmit: handleAddSubLabel, className: "mb-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: newSubLabel, onChange: (e) => setNewSubLabel(e.target.value), placeholder: "Enter new sub-label", className: "flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: !newSubLabel.trim() || createSubLabelMutation.isPending, className: "px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50", children: "Add" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-700", children: "Current Sub-Labels:" }), (0, jsx_runtime_1.jsx)("ul", { className: "space-y-1", children: subLabels?.map((label) => ((0, jsx_runtime_1.jsxs)("li", { className: "flex justify-between items-center px-3 py-2 bg-gray-50 rounded text-sm", children: [(0, jsx_runtime_1.jsx)("span", { children: label.name }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                                        if (window.confirm(`Delete "${label.name}"?`)) {
                                                            deleteSubLabelMutation.mutate(label.id);
                                                        }
                                                    }, className: "text-red-600 hover:text-red-800 text-xs font-medium", children: "Delete" })] }, label.id))) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "Publishers" }), (0, jsx_runtime_1.jsx)("form", { onSubmit: handleAddPublisher, className: "mb-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: newPublisher, onChange: (e) => setNewPublisher(e.target.value), placeholder: "Enter new publisher", className: "flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: !newPublisher.trim() || createPublisherMutation.isPending, className: "px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50", children: "Add" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-700", children: "Current Publishers:" }), (0, jsx_runtime_1.jsx)("ul", { className: "space-y-1", children: publishers?.map((pub) => ((0, jsx_runtime_1.jsxs)("li", { className: "flex justify-between items-center px-3 py-2 bg-gray-50 rounded text-sm", children: [(0, jsx_runtime_1.jsx)("span", { children: pub.name }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                                        if (window.confirm(`Delete "${pub.name}"?`)) {
                                                            deletePublisherMutation.mutate(pub.id);
                                                        }
                                                    }, className: "text-red-600 hover:text-red-800 text-xs font-medium", children: "Delete" })] }, pub.id))) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "Album Categories" }), (0, jsx_runtime_1.jsx)("form", { onSubmit: handleAddAlbumCategory, className: "mb-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: newAlbumCategory, onChange: (e) => setNewAlbumCategory(e.target.value), placeholder: "Enter new category", className: "flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: !newAlbumCategory.trim() || createAlbumCategoryMutation.isPending, className: "px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50", children: "Add" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-700", children: "Current Categories:" }), (0, jsx_runtime_1.jsx)("ul", { className: "space-y-1", children: albumCategories?.map((cat) => ((0, jsx_runtime_1.jsxs)("li", { className: "flex justify-between items-center px-3 py-2 bg-gray-50 rounded text-sm", children: [(0, jsx_runtime_1.jsx)("span", { children: cat.name }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                                        if (window.confirm(`Delete "${cat.name}"?`)) {
                                                            deleteAlbumCategoryMutation.mutate(cat.id);
                                                        }
                                                    }, className: "text-red-600 hover:text-red-800 text-xs font-medium", children: "Delete" })] }, cat.id))) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "Content Types" }), (0, jsx_runtime_1.jsx)("form", { onSubmit: handleAddContentType, className: "mb-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: newContentType, onChange: (e) => setNewContentType(e.target.value), placeholder: "Enter new content type", className: "flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: !newContentType.trim() || createContentTypeMutation.isPending, className: "px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50", children: "Add" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-700", children: "Current Types:" }), (0, jsx_runtime_1.jsx)("ul", { className: "space-y-1", children: contentTypes?.map((type) => ((0, jsx_runtime_1.jsxs)("li", { className: "flex justify-between items-center px-3 py-2 bg-gray-50 rounded text-sm", children: [(0, jsx_runtime_1.jsx)("span", { children: type.name }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                                        if (window.confirm(`Delete "${type.name}"?`)) {
                                                            deleteContentTypeMutation.mutate(type.id);
                                                        }
                                                    }, className: "text-red-600 hover:text-red-800 text-xs font-medium", children: "Delete" })] }, type.id))) })] })] })] })] }));
}
