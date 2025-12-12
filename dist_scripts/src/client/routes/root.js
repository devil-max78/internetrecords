"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootRoute = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_1 = require("@tanstack/react-router");
const AuthContext_1 = require("../context/AuthContext");
const Navbar_1 = __importDefault(require("../components/Navbar"));
exports.rootRoute = (0, react_router_1.createRootRoute)({
    component: RootComponent,
});
function RootComponent() {
    const { isAuthenticated } = (0, AuthContext_1.useAuth)();
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50", children: [isAuthenticated && (0, jsx_runtime_1.jsx)(Navbar_1.default, {}), (0, jsx_runtime_1.jsx)("main", { className: "container mx-auto px-4 py-8", children: (0, jsx_runtime_1.jsx)(react_router_1.Outlet, {}) })] }));
}
