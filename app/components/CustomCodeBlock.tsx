import React from 'react';
import cn from 'classnames';
import FlashCards from './FlashCards';
import CodeQuiz from './CodeQuiz';
import { AugmentedCodeProps } from './MarkdownRenderer';

interface CustomCodeBlockProps extends AugmentedCodeProps {}

const CustomCodeBlock: React.FC<CustomCodeBlockProps> = ({ node, inline, children, className, ...props }) => {
	const language = node.data?.lang || 'plaintext';
	if (language === 'qa') {
		return <FlashCards node={node} />;
	}
	if (node.data?.meta.includes('quiz')) {
		return <CodeQuiz node={node} />;
	}
	// Normal code block
	return (
		<code {...props} className={cn(className, 'relative')}>
			{!inline && <span className="absolute left-3 top-0 text-[10px] uppercase">{node.properties?.dataLang}</span>}
			{children}
		</code>
	);
};

export default CustomCodeBlock;
