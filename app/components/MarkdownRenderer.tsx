import React, { memo } from 'react';
import ReactMarkdown, { type Components as ReactMarkdownComponentsOptions } from 'react-markdown';
import { defaultHandlers, type Options as RemarkRehypeOptions } from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize, { defaultSchema, type Options as RehypeSanitizeOptions } from 'rehype-sanitize';
import remarkDirective from 'remark-directive';
import remarkDirectiveRehype from 'remark-directive-rehype';
import { rehypeCodeQuiz } from '~/utils/markdown-plugins';
import CodeQuiz from './CodeQuiz';
import cn from 'classnames';
import type MDAST from 'mdast';
import { type Element as HastElement } from 'hast';

interface MarkdownRendererProps {
	content: string;
}

const remarkRehypeOptions: RemarkRehypeOptions = {
	handlers: {
		code: (h, node: MDAST.Code) => {
			// Since the defaultHandler returns a wrapping <pre> element, we need to go into children[0]
			// to change the underlying <code> element: https://github.com/syntax-tree/mdast-util-to-hast/blob/main/lib/handlers/code.js
			const preElement = defaultHandlers.code(h, node);
			const codeElement = preElement.children[0] as HastElement;
			// Inject the value into node.data
			codeElement.data = Object.assign({ value: node.value }, codeElement.data);
			// Inject "data-lang" properties
			codeElement.properties = Object.assign({ dataLang: node.lang || 'plaintext' }, codeElement.properties);
			return preElement;
		},
	},
};

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
			remarkRehypeOptions={remarkRehypeOptions}
			rehypePlugins={[
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
