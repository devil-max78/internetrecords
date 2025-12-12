"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const react_query_1 = require("@tanstack/react-query");
const react_router_1 = require("@tanstack/react-router");
const react_hot_toast_1 = require("react-hot-toast");
const AuthContext_1 = require("./context/AuthContext");
// Import routes
const root_1 = require("./routes/root");
const index_1 = require("./routes/index");
const login_1 = require("./routes/login");
const signup_1 = require("./routes/signup");
const dashboard_1 = require("./routes/dashboard");
const upload_enhanced_1 = require("./routes/upload-enhanced");
const release_detail_1 = require("./routes/release-detail");
const admin_1 = require("./routes/admin");
const admin_settings_1 = require("./routes/admin-settings");
const youtube_claim_1 = require("./routes/youtube-claim");
const admin_youtube_claims_1 = require("./routes/admin-youtube-claims");
const youtube_oac_1 = require("./routes/youtube-oac");
const social_media_linking_1 = require("./routes/social-media-linking");
const label_publisher_settings_1 = require("./routes/label-publisher-settings");
const edit_release_1 = require("./routes/edit-release");
const artist_profile_linking_1 = require("./routes/artist-profile-linking");
const admin_artist_profile_linking_1 = require("./routes/admin-artist-profile-linking");
// Create query client outside component
const queryClient = new react_query_1.QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5000,
        },
    },
});
// Create router
const routeTree = root_1.rootRoute.addChildren([
    index_1.indexRoute,
    login_1.loginRoute,
    signup_1.signupRoute,
    dashboard_1.dashboardRoute,
    upload_enhanced_1.uploadEnhancedRoute,
    release_detail_1.releaseDetailRoute,
    admin_1.adminRoute,
    admin_settings_1.adminSettingsRoute,
    youtube_claim_1.youtubeClaimRoute,
    admin_youtube_claims_1.adminYoutubeClaimsRoute,
    youtube_oac_1.youtubeOacRoute,
    social_media_linking_1.socialMediaLinkingRoute,
    label_publisher_settings_1.labelPublisherSettingsRoute,
    edit_release_1.editReleaseRoute,
    artist_profile_linking_1.artistProfileLinkingRoute,
    admin_artist_profile_linking_1.adminArtistProfileLinkingRoute,
]);
const router = (0, react_router_1.createRouter)({
    routeTree,
    defaultPreload: 'intent',
    context: {
        queryClient,
    },
});
// App component
const App = () => {
    return ((0, jsx_runtime_1.jsx)(react_1.default.StrictMode, { children: (0, jsx_runtime_1.jsx)(react_query_1.QueryClientProvider, { client: queryClient, children: (0, jsx_runtime_1.jsxs)(AuthContext_1.AuthProvider, { children: [(0, jsx_runtime_1.jsx)(react_router_1.RouterProvider, { router: router }), (0, jsx_runtime_1.jsx)(react_hot_toast_1.Toaster, { position: "top-right" })] }) }) }));
};
exports.default = App;
