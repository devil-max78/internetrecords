"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trpcClient = exports.queryClient = exports.trpc = void 0;
const react_query_1 = require("@trpc/react-query");
const client_1 = require("@trpc/client");
const react_query_2 = require("@tanstack/react-query");
// Create tRPC client
exports.trpc = (0, react_query_1.createTRPCReact)();
// Create query client
exports.queryClient = new react_query_2.QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});
// Create tRPC client
exports.trpcClient = exports.trpc.createClient({
    links: [
        (0, client_1.httpBatchLink)({
            url: 'http://localhost:3001/api/trpc',
            headers: () => {
                const token = localStorage.getItem('token');
                return token ? { Authorization: `Bearer ${token}` } : {};
            },
        }),
    ],
});
