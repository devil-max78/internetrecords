"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRoute = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_1 = require("@tanstack/react-router");
const react_hook_form_1 = require("react-hook-form");
const react_hot_toast_1 = require("react-hot-toast");
const root_1 = require("./root");
const api_1 = require("../api");
exports.uploadRoute = (0, react_router_1.createRoute)({
    getParentRoute: () => root_1.rootRoute,
    path: '/upload',
    component: UploadComponent,
});
function UploadComponent() {
    const navigate = (0, react_router_1.useNavigate)();
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const { register, handleSubmit, formState: { errors } } = (0, react_hook_form_1.useForm)();
    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            const release = await api_1.api.releases.create({
                title: data.title,
            });
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-2xl mx-auto", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-gray-800 mb-6", children: "Create New Release" }), (0, jsx_runtime_1.jsx)("div", { className: "bg-white rounded-lg shadow-md p-6", children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "title", className: "block text-sm font-medium text-gray-700 mb-1", children: "Release Title" }), (0, jsx_runtime_1.jsx)("input", { id: "title", type: "text", ...register('title', { required: 'Title is required' }), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Enter release title" }), errors.title && ((0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.title.message }))] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: isLoading, className: "w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-70", children: isLoading ? 'Creating...' : 'Create Release' })] }) })] }));
}
