import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkDirective from 'remark-directive';
import remarkDirectiveRehype from 'remark-directive-rehype';

interface MarkdownRendererProps {
	content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = memo(({ content }) => {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkDirective, remarkDirectiveRehype]}
			remarkRehypeOptions={{ passThrough: ['quiz'] }}
			rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }]]}
		>
			{content}
		</ReactMarkdown>
	);
});

export default MarkdownRenderer;
