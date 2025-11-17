import React from 'react';

export function Th({ children, className = '' }) {
    return <th className={`px-3 py-3 text-left font-medium ${className}`}>{children}</th>;
}
export function Td({ children, className = '' }) {
    return <td className={`px-3 py-3 align-middle ${className}`}>{children}</td>;
}