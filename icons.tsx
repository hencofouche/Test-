
import React from 'react';

export const CaptureIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className}
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
    >
        <path d="M4 20L20 4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14.5 4L20 9.5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 14.5L9.5 20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>

        <path d="M20 20L4 4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 14.5L14.5 20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.5 4L4 9.5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const GuardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
    >
        <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const StealIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
    >
        <path d="M10 14.5L5.5 19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.5 12L8 16.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 9.5L10.5 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.5 7L13 11.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.5 20.5c-2.43-.96-4.2-3.3-4-5.91.2-2.62 2.1-4.81 4.59-5.52 2.5-.7 5.1.33 6.62 2.37 1.51 2.04 1.8 4.8.72 7.06-.52 1.08-1.28 2-2.22 2.7l-4.21 3.2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
