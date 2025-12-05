'use client';

import React from 'react';

interface MarkdownTextProps {
  content: string;
}

export default function MarkdownText({ content }: MarkdownTextProps) {
  // Simple markdown parser for common patterns
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        elements.push(<div key={`br-${index}`} className="h-4" />);
        return;
      }
      
      // Headings
      if (trimmedLine.startsWith('### ')) {
        const text = trimmedLine.substring(4);
        elements.push(
          <h3 
            key={`h3-${index}`} 
            className="text-lg font-semibold mb-3 mt-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {text}
          </h3>
        );
        return;
      }
      
      if (trimmedLine.startsWith('## ')) {
        const text = trimmedLine.substring(3);
        elements.push(
          <h2 
            key={`h2-${index}`} 
            className="text-xl font-semibold mb-3 mt-5"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {text}
          </h2>
        );
        return;
      }
      
      // Parse inline formatting (bold, etc.)
      const parseInline = (text: string) => {
        const parts: (string | JSX.Element)[] = [];
        let currentIndex = 0;
        
        // Match **bold** text
        const boldRegex = /\*\*(.*?)\*\*/g;
        let match;
        
        while ((match = boldRegex.exec(text)) !== null) {
          // Add text before match
          if (match.index > currentIndex) {
            parts.push(text.substring(currentIndex, match.index));
          }
          
          // Add bold text
          parts.push(
            <strong 
              key={`bold-${index}-${match.index}`}
              className="font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {match[1]}
            </strong>
          );
          
          currentIndex = match.index + match[0].length;
        }
        
        // Add remaining text
        if (currentIndex < text.length) {
          parts.push(text.substring(currentIndex));
        }
        
        return parts.length > 0 ? parts : [text];
      };
      
      // Regular paragraph
      elements.push(
        <p 
          key={`p-${index}`} 
          className="text-sm leading-relaxed mb-3"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {parseInline(trimmedLine)}
        </p>
      );
    });
    
    return elements;
  };
  
  return <div className="markdown-content">{parseMarkdown(content)}</div>;
}
