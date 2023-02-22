import React, { memo } from 'react';
import ReactMarkdown, { type Components as ReactMarkdownComponents } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkDirective from 'remark-directive';
import remarkDirectiveRehype from 'remark-directive-rehype';
import { rehypeCodeQuiz } from '~/utils/markdown-plugins';
import CodeQuiz from './CodeQuiz';

interface MarkdownRendererProps {
	content: string;
}

const componentsOptions: ReactMarkdownComponents = {
	// The "inline" prop isn't part of normal HTML attributes
	code: ({ node, inline, children, ...props }) =>
		(node.data?.meta as string)?.includes('quiz') ? <CodeQuiz node={node} /> : <code {...props}>{children}</code>,
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = memo(({ content }) => {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkDirective, remarkDirectiveRehype]}
			rehypePlugins={[[rehypeCodeQuiz, rehypeHighlight, { ignoreMissing: true }]]}
			components={componentsOptions}
		>
			{content}
		</ReactMarkdown>
	);
});

export default MarkdownRenderer;
