import { type Plugin } from 'unified';
import HAST from 'hast';
import { visit } from 'unist-util-visit';

export const rehypeCodeQuiz: Plugin<Array<{}>, HAST.Root> = () => {
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (node.tagName === 'code' && (node.data?.meta as string)?.includes('quiz')) {
				// This "code" node should have one children, which is of type "text" that contains the code block value
				node.data = node.data || {};
				// Inject the original text value into the node
				if (node.children[0].type === 'text') {
					node.data.value = node.children[0].value;
				}
			}
		});
	};
};
