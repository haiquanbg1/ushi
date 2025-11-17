import React from 'react';

export default function EmptyState({ title, emoji }) {
    return (
        <div className="py-16 text-center animate-fade-in">
            <div className="text-6xl mb-4 animate-bounce">{emoji}</div>
            <div className="font-semibold text-gray-600 text-lg">{title}</div>
        </div>
    );
}
