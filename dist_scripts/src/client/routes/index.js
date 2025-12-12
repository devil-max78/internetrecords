"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexRoute = void 0;
const react_router_1 = require("@tanstack/react-router");
const root_1 = require("./root");
exports.indexRoute = (0, react_router_1.createRoute)({
    getParentRoute: () => root_1.rootRoute,
    path: '/',
    component: IndexComponent,
    beforeLoad: ({ context }) => {
        const token = localStorage.getItem('token');
        if (token) {
            throw (0, react_router_1.redirect)({ to: '/dashboard' });
        }
        else {
            throw (0, react_router_1.redirect)({ to: '/login' });
        }
    },
});
function IndexComponent() {
    return null;
}
