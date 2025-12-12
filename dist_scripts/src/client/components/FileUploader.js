"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_hot_toast_1 = require("react-hot-toast");
const FileUploader = ({ onFileSelect, accept = '*/*', maxSize = 10, // Default 10MB
label = 'Upload File' }) => {
    const [isDragging, setIsDragging] = (0, react_1.useState)(false);
    const [fileName, setFileName] = (0, react_1.useState)(null);
    const fileInputRef = (0, react_1.useRef)(null);
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) {
            setIsDragging(true);
        }
    };
    const validateFile = (file) => {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
            react_hot_toast_1.toast.error(`File size exceeds ${maxSize}MB limit`);
            return false;
        }
        // Check file type if accept is specified
        if (accept !== '*/*') {
            const fileType = file.type;
            const acceptTypes = accept.split(',').map(type => type.trim());
            // Check if the file type matches any of the accepted types
            const isAccepted = acceptTypes.some(type => {
                if (type.includes('/*')) {
                    // Handle wildcard mime types like 'image/*'
                    const typeCategory = type.split('/')[0];
                    return fileType.startsWith(`${typeCategory}/`);
                }
                return type === fileType;
            });
            if (!isAccepted) {
                react_hot_toast_1.toast.error('File type not accepted');
                return false;
            }
        }
        return true;
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (validateFile(file)) {
                setFileName(file.name);
                onFileSelect(file);
            }
        }
    };
    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (validateFile(file)) {
                setFileName(file.name);
                onFileSelect(file);
            }
        }
    };
    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "w-full", children: (0, jsx_runtime_1.jsxs)("div", { className: `border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`, onDragEnter: handleDragEnter, onDragLeave: handleDragLeave, onDragOver: handleDragOver, onDrop: handleDrop, onClick: handleButtonClick, children: [(0, jsx_runtime_1.jsx)("input", { type: "file", ref: fileInputRef, onChange: handleFileSelect, accept: accept, className: "hidden" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center space-y-2", children: [(0, jsx_runtime_1.jsx)("svg", { className: `w-12 h-12 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" }) }), fileName ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-indigo-600", children: fileName }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 mt-1", children: "Click to change file" })] })) : ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "font-medium text-gray-700", children: label }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 mt-1", children: "Drag & drop or click to browse" }), accept !== '*/*' && ((0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-gray-400 mt-1", children: ["Accepted formats: ", accept] })), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-gray-400", children: ["Max size: ", maxSize, "MB"] })] }))] })] }) }));
};
exports.default = FileUploader;
