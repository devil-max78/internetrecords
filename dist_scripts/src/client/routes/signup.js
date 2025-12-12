"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupRoute = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_1 = require("@tanstack/react-router");
const react_hook_form_1 = require("react-hook-form");
const react_hot_toast_1 = require("react-hot-toast");
const root_1 = require("./root");
const AuthContext_1 = require("../context/AuthContext");
exports.signupRoute = (0, react_router_1.createRoute)({
    getParentRoute: () => root_1.rootRoute,
    path: '/signup',
    component: SignupComponent,
});
function SignupComponent() {
    const { signup, isLoading } = (0, AuthContext_1.useAuth)();
    const { register, handleSubmit, formState: { errors } } = (0, react_hook_form_1.useForm)({
        defaultValues: {
            role: 'ARTIST',
        },
    });
    const onSubmit = async (data) => {
        try {
            await signup(data.email, data.password, data.name, data.role);
            react_hot_toast_1.toast.success('Account created successfully!');
        }
        catch (error) {
            react_hot_toast_1.toast.error('Signup failed. Please try again.');
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center items-center min-h-[80vh]", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-6 rounded-lg shadow-lg w-full max-w-md", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-center mb-1", children: (0, jsx_runtime_1.jsx)("img", { src: "/assets/logo.svg", alt: "Internet Records", className: "h-72 w-auto" }) }), (0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-center mb-4 text-indigo-700", children: "Sign Up" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700 mb-1", children: "Name" }), (0, jsx_runtime_1.jsx)("input", { id: "name", type: "text", ...register('name', { required: 'Name is required' }), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Your Name" }), errors.name && ((0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.name.message }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), (0, jsx_runtime_1.jsx)("input", { id: "email", type: "email", ...register('email', { required: 'Email is required' }), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "your@email.com" }), errors.email && ((0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.email.message }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-1", children: "Password" }), (0, jsx_runtime_1.jsx)("input", { id: "password", type: "password", ...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } }), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }), errors.password && ((0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.password.message }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "role", className: "block text-sm font-medium text-gray-700 mb-1", children: "Role" }), (0, jsx_runtime_1.jsxs)("select", { id: "role", ...register('role', { required: 'Role is required' }), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "ARTIST", children: "Artist" }), (0, jsx_runtime_1.jsx)("option", { value: "LABEL", children: "Label" })] }), errors.role && ((0, jsx_runtime_1.jsx)("p", { className: "text-red-500 text-sm mt-1", children: errors.role.message }))] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: isLoading, className: "w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-70", children: isLoading ? 'Creating Account...' : 'Sign Up' })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-center mt-4 text-gray-600", children: ["Already have an account?", ' ', (0, jsx_runtime_1.jsx)(react_router_1.Link, { to: "/login", className: "text-indigo-600 hover:text-indigo-800", children: "Login" })] })] }) }));
}
