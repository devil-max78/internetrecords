"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.labelPublisherSettingsRoute = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const react_router_1 = require("@tanstack/react-router");
const root_1 = require("./root");
const api_1 = require("../api");
exports.labelPublisherSettingsRoute = (0, react_router_1.createRoute)({
    getParentRoute: () => root_1.rootRoute,
    path: '/label-publisher-settings',
    component: LabelPublisherSettings,
});
function LabelPublisherSettings() {
    const queryClient = (0, react_query_1.useQueryClient)();
    const [newLabel, setNewLabel] = (0, react_1.useState)('');
    const [newPublisher, setNewPublisher] = (0, react_1.useState)('');
    const [selectedLabel, setSelectedLabel] = (0, react_1.useState)('');
    const [selectedPublisher, setSelectedPublisher] = (0, react_1.useState)('');
    // Fetch global defaults
    const { data: globalDefaults } = (0, react_query_1.useQuery)({
        queryKey: ['globalDefaults'],
        queryFn: () => api_1.api.labelPublisher.getGlobalDefaults()
    });
    // Fetch user labels
    const { data: userLabels = [] } = (0, react_query_1.useQuery)({
        queryKey: ['userLabels'],
        queryFn: () => api_1.api.labelPublisher.getUserLabels()
    });
    // Fetch user publishers
    const { data: userPublishers = [] } = (0, react_query_1.useQuery)({
        queryKey: ['userPublishers'],
        queryFn: () => api_1.api.labelPublisher.getUserPublishers()
    });
    // Fetch user preferences
    (0, react_query_1.useQuery)({
        queryKey: ['userPreferences'],
        queryFn: () => api_1.api.labelPublisher.getUserPreferences(),
        onSuccess: (data) => {
            setSelectedLabel(data.customLabel || '');
            setSelectedPublisher(data.customPublisher || '');
        }
    });
    // Add label mutation
    const addLabelMutation = (0, react_query_1.useMutation)({
        mutationFn: (labelName) => api_1.api.labelPublisher.addUserLabel(labelName),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userLabels'] });
            setNewLabel('');
        }
    });
    // Add publisher mutation
    const addPublisherMutation = (0, react_query_1.useMutation)({
        mutationFn: (publisherName) => api_1.api.labelPublisher.addUserPublisher(publisherName),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userPublishers'] });
            setNewPublisher('');
        }
    });
    // Delete label mutation
    const deleteLabelMutation = (0, react_query_1.useMutation)({
        mutationFn: (id) => api_1.api.labelPublisher.deleteUserLabel(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userLabels'] });
        }
    });
    // Delete publisher mutation
    const deletePublisherMutation = (0, react_query_1.useMutation)({
        mutationFn: (id) => api_1.api.labelPublisher.deleteUserPublisher(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userPublishers'] });
        }
    });
    // Update preferences mutation
    const updatePreferencesMutation = (0, react_query_1.useMutation)({
        mutationFn: (preferences) => api_1.api.labelPublisher.updateUserPreferences(preferences),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
        }
    });
    const handleAddLabel = (e) => {
        e.preventDefault();
        if (newLabel.trim()) {
            addLabelMutation.mutate(newLabel.trim());
        }
    };
    const handleAddPublisher = (e) => {
        e.preventDefault();
        if (newPublisher.trim()) {
            addPublisherMutation.mutate(newPublisher.trim());
        }
    };
    const handleSavePreferences = () => {
        updatePreferencesMutation.mutate({
            customLabel: selectedLabel || null,
            customPublisher: selectedPublisher || null
        });
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-4xl mx-auto p-6", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold mb-6", children: "Label & Publisher Settings" }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow p-6 mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "Global Defaults" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Default Label:" }), " ", globalDefaults?.defaultLabel] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Default Publisher:" }), " ", globalDefaults?.defaultPublisher] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow p-6 mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "Your Custom Labels" }), (0, jsx_runtime_1.jsx)("form", { onSubmit: handleAddLabel, className: "mb-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: newLabel, onChange: (e) => setNewLabel(e.target.value), placeholder: "Enter new label name", className: "flex-1 px-3 py-2 border rounded" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: addLabelMutation.isPending, className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50", children: "Add Label" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [userLabels.map((label) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center p-2 border rounded", children: [(0, jsx_runtime_1.jsx)("span", { children: label.labelName }), (0, jsx_runtime_1.jsx)("button", { onClick: () => deleteLabelMutation.mutate(label.id), className: "text-red-600 hover:text-red-800", children: "Delete" })] }, label.id))), userLabels.length === 0 && ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-500", children: "No custom labels yet" }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow p-6 mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "Your Custom Publishers" }), (0, jsx_runtime_1.jsx)("form", { onSubmit: handleAddPublisher, className: "mb-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: newPublisher, onChange: (e) => setNewPublisher(e.target.value), placeholder: "Enter new publisher name", className: "flex-1 px-3 py-2 border rounded" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: addPublisherMutation.isPending, className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50", children: "Add Publisher" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [userPublishers.map((publisher) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center p-2 border rounded", children: [(0, jsx_runtime_1.jsx)("span", { children: publisher.publisherName }), (0, jsx_runtime_1.jsx)("button", { onClick: () => deletePublisherMutation.mutate(publisher.id), className: "text-red-600 hover:text-red-800", children: "Delete" })] }, publisher.id))), userPublishers.length === 0 && ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-500", children: "No custom publishers yet" }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "Your Active Selection" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block mb-2 font-medium", children: "Active Label" }), (0, jsx_runtime_1.jsxs)("select", { value: selectedLabel, onChange: (e) => setSelectedLabel(e.target.value), className: "w-full px-3 py-2 border rounded", children: [(0, jsx_runtime_1.jsxs)("option", { value: "", children: ["Use Global Default (", globalDefaults?.defaultLabel, ")"] }), userLabels.map((label) => ((0, jsx_runtime_1.jsx)("option", { value: label.labelName, children: label.labelName }, label.id)))] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block mb-2 font-medium", children: "Active Publisher" }), (0, jsx_runtime_1.jsxs)("select", { value: selectedPublisher, onChange: (e) => setSelectedPublisher(e.target.value), className: "w-full px-3 py-2 border rounded", children: [(0, jsx_runtime_1.jsxs)("option", { value: "", children: ["Use Global Default (", globalDefaults?.defaultPublisher, ")"] }), userPublishers.map((publisher) => ((0, jsx_runtime_1.jsx)("option", { value: publisher.publisherName, children: publisher.publisherName }, publisher.id)))] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: handleSavePreferences, disabled: updatePreferencesMutation.isPending, className: "w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50", children: "Save Preferences" })] })] })] }));
}
