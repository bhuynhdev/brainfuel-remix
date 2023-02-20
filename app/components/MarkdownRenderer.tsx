import React, { memo } from 'react';
import ReactMarkdown, { type Components as ReactMarkdownComponents } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkDirective from 'remark-directive';
import remarkDirectiveRehype from 'remark-directive-rehype';
import CodeQuiz from './CodeQuiz';

interface MarkdownRendererProps {
	content: string;
}

const componentsOptions: ReactMarkdownComponents = {
	// The "inline" prop isn't part of normal HTML attributes and causes issue of "received 'true' for non-boolean attribute"
	// Thus take it out before spreading the HTMl props
	code: ({ node, children, inline, ...props }) =>
		(node.data?.meta as string)?.includes('quiz') ? <CodeQuiz /> : <code {...props}>{children}</code>,
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = memo(({ content }) => {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkDirective, remarkDirectiveRehype]}
			rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }]]}
			components={componentsOptions}
		>
			{content}
		</ReactMarkdown>
	);
});

export default MarkdownRenderer;
