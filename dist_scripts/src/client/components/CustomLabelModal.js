"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomLabelModal = CustomLabelModal;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const react_hot_toast_1 = require("react-hot-toast");
const api_1 = require("../api");
function CustomLabelModal({ isOpen, onClose }) {
    const [labelName, setLabelName] = (0, react_1.useState)('');
    const queryClient = (0, react_query_1.useQueryClient)();
    const requestLabelMutation = (0, react_query_1.useMutation)({
        mutationFn: (name) => api_1.api.customLabels.request(name),
        onSuccess: () => {
            react_hot_toast_1.toast.success('Label request submitted successfully!');
            setLabelName('');
            queryClient.invalidateQueries(['customLabelRequests']);
            onClose();
        },
        onError: (error) => {
            react_hot_toast_1.toast.error(error.message || 'Failed to submit label request');
        },
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!labelName.trim()) {
            react_hot_toast_1.toast.error('Label name is required');
            return;
        }
        requestLabelMutation.mutate(labelName);
    };
    if (!isOpen)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg p-6 w-full max-w-md", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold mb-4", children: "Request Custom Label" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 mb-4", children: "Request a custom label to be added. Once approved by an admin, it will be available in your list." }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-4", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Label Name" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: labelName, onChange: (e) => setLabelName(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Enter label name", autoFocus: true })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end gap-3", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: onClose, className: "px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700", children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: requestLabelMutation.isLoading, className: "px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-70", children: requestLabelMutation.isLoading ? 'Submitting...' : 'Submit Request' })] })] })] }) }));
}
