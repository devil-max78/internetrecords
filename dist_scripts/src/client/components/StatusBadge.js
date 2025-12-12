"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const StatusBadge = ({ status }) => {
    const getStatusStyles = () => {
        switch (status) {
            case 'DRAFT':
                return 'bg-gray-100 text-gray-800';
            case 'UNDER_REVIEW':
                return 'bg-yellow-100 text-yellow-800';
            case 'RESUBMITTED':
                return 'bg-blue-100 text-blue-800';
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            case 'DISTRIBUTED':
                return 'bg-indigo-100 text-indigo-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    const getStatusText = () => {
        switch (status) {
            case 'DRAFT':
                return 'Draft';
            case 'UNDER_REVIEW':
                return 'Under Review';
            case 'RESUBMITTED':
                return 'Resubmitted';
            case 'APPROVED':
                return 'Approved';
            case 'REJECTED':
                return 'Rejected';
            case 'DISTRIBUTED':
                return 'Distributed';
            default:
                return status;
        }
    };
    return ((0, jsx_runtime_1.jsx)("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`, children: getStatusText() }));
};
exports.default = StatusBadge;
