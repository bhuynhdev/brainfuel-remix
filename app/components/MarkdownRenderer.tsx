import React, { memo } from 'react';
import ReactMarkdown, { type Components as ReactMarkdownComponentsOptions } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize, { defaultSchema, type Options as RehypeSanitizeOptions } from 'rehype-sanitize';
import remarkDirective from 'remark-directive';
import remarkDirectiveRehype from 'remark-directive-rehype';
import { rehypeCodeQuiz } from '~/utils/markdown-plugins';
import CodeQuiz from './CodeQuiz';
import cn from 'classnames';

interface MarkdownRendererProps {
	content: string;
}

const componentsOptions: ReactMarkdownComponentsOptions = {
	// The "inline" prop isn't part of normal HTML attributes
	code: ({ node, inline, children, className, ...props }) =>
		(node.data?.meta as string)?.includes('quiz') && !inline ? (
			<CodeQuiz node={node} />
		) : (
			<code {...props} className={cn(className, 'relative')}>
				{!inline && <span className="absolute left-3 top-0 text-[10px] uppercase">{node.properties?.dataLang}</span>}
				{children}
			</code>
		),
};

// Use rehype-sanitize with rehype-highlight: https://github.com/rehypejs/rehype-sanitize#example-syntax-highlighting
const rehypeSanitizeOptions: RehypeSanitizeOptions = {
	...defaultSchema,
	attributes: {
		...defaultSchema.attributes,
		code: [
			...(defaultSchema?.attributes?.code || []),
			'data*',
			// List of all allowed hljs languages:
			['className', 'hljs', /^language-/],
		],
	},
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = memo(({ content }) => {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkDirective, remarkDirectiveRehype]}
			rehypePlugins={[
				rehypeCodeQuiz,
				[rehypeSanitize, rehypeSanitizeOptions],
				[rehypeHighlight, { ignoreMissing: true }],
			]}
			components={componentsOptions}
		>
			{content}
		</ReactMarkdown>
	);
});

export default MarkdownRenderer;
