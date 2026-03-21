import React from 'react';

export default function Logo({ 
  className = '', 
  size = 40, 
  variant = 'full', // 'full' (with background) or 'mark' (just the logo)
  color = '#f07c28'
}) {
  if (variant === 'mark') {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path d="M 100 50 A 50 50 0 1 0 50 100 L 50 50 Z" fill={color} />
      </svg>
    );
  }

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="100" height="100" rx="22" fill={color} />
      <path d="M 80 50 A 30 30 0 1 0 50 80 L 50 50 Z" fill="#ffffff" />
    </svg>
  );
}
