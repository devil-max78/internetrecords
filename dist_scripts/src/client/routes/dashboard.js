"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRoute = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_1 = require("@tanstack/react-router");
const react_hot_toast_1 = require("react-hot-toast");
const react_query_1 = require("@tanstack/react-query");
const root_1 = require("./root");
const AuthContext_1 = require("../context/AuthContext");
const api_1 = require("../api");
const StatusBadge_1 = __importDefault(require("../components/StatusBadge"));
exports.dashboardRoute = (0, react_router_1.createRoute)({
    getParentRoute: () => root_1.rootRoute,
    path: '/dashboard',
    component: DashboardComponent,
});
function DashboardComponent() {
    const { user } = (0, AuthContext_1.useAuth)();
    const { data: releases, isLoading, error } = (0, react_query_1.useQuery)({
        queryKey: ['releases'],
        queryFn: () => api_1.api.releases.getAll(),
    });
    if (isLoading) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center items-center h-64", children: (0, jsx_runtime_1.jsx)("div", { className: "text-indigo-600", children: "Loading releases..." }) }));
    }
    if (error) {
        react_hot_toast_1.toast.error('Failed to load releases');
        return ((0, jsx_runtime_1.jsx)("div", { className: "text-center text-red-600 p-4", children: "Error loading releases. Please try again." }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-6", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-gray-800", children: "Your Releases" }), (0, jsx_runtime_1.jsx)(react_router_1.Link, { to: "/upload", className: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-md hover:from-indigo-700 hover:to-purple-700 transition", children: "Create New Release" })] }), releases?.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-8 text-center", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold text-gray-700 mb-2", children: "No releases yet" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-4", children: "Get started by creating your first release." }), (0, jsx_runtime_1.jsx)(react_router_1.Link, { to: "/upload", className: "inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-md hover:from-indigo-700 hover:to-purple-700 transition", children: "Create Release" })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: releases?.map((release) => ((0, jsx_runtime_1.jsxs)(react_router_1.Link, { to: "/release/$releaseId", params: { releaseId: release.id }, className: "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition", children: [(0, jsx_runtime_1.jsx)("div", { className: "h-48 bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center overflow-hidden", children: release.artworkUrl ? ((0, jsx_runtime_1.jsx)("img", { src: release.artworkUrl, alt: release.title, className: "h-full w-full object-cover", onError: (e) => {
                                    // Fallback if image fails to load
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement.innerHTML = '<div class="text-white text-xl font-bold">No Artwork</div>';
                                } })) : ((0, jsx_runtime_1.jsx)("div", { className: "text-white text-xl font-bold", children: "No Artwork" })) }), (0, jsx_runtime_1.jsxs)("div", { className: "p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold text-gray-800 mb-2", children: release.title }), (0, jsx_runtime_1.jsx)(StatusBadge_1.default, { status: release.status })] }), release.status === 'REJECTED' && release.rejectionReason && ((0, jsx_runtime_1.jsxs)("div", { className: "mb-3 p-3 bg-red-50 border border-red-200 rounded-md", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-red-800 mb-1", children: "Rejection Reason:" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-700", children: release.rejectionReason }), release.allowResubmission && ((0, jsx_runtime_1.jsx)("p", { className: "text-xs text-red-600 mt-2", children: "\u2713 You can edit and resubmit this release" })), !release.allowResubmission && ((0, jsx_runtime_1.jsx)("p", { className: "text-xs text-red-600 mt-2", children: "\u2717 Resubmission not allowed. Please contact support." }))] })), (0, jsx_runtime_1.jsxs)("p", { className: "text-gray-600 text-sm mb-2", children: [release.tracks.length, " tracks"] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-gray-500 text-xs", children: ["Created: ", new Date(release.createdAt).toLocaleDateString()] })] })] }, release.id))) }))] }));
}
