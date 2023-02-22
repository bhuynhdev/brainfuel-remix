import { type Plugin } from 'unified';
import HAST from 'hast';
import { visit } from 'unist-util-visit';

export const rehypeCodeQuiz: Plugin<Array<{}>, HAST.Root> = () => {
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (node.tagName === 'code') {
				// Inject the language as a data properties, using the className
				node.properties = Object.assign({}, node.properties);
				let language = '';
				const className = node.properties.className ?? [''];
				if (Array.isArray(className)) {
					const languageClasses = className.map((val) => val.toString()).filter((name) => name.startsWith('language'));
					if (languageClasses.length > 0) {
						language = languageClasses[0].split('-')[1];
					}
				} else {
					const regex = /\blanguage-(\w*)\b/;
					const matches = className.toString().match(regex);
					// Since there is not /g flag, the 2nd item of the array is the first capturing group
					if (matches) language = matches[1];
				}
				node.properties.dataLang = language || 'plaintext';

				// If the code is a quiz, inject the original code block value
				if ((node.data?.meta as string)?.includes('quiz')) {
					node.data = Object.assign({}, node.data);
					// This "code" node should have one children, which is of type "text" that contains the code block value
					// Inject the original text value into the node
					if (node.children[0].type === 'text') {
						node.data.value = node.children[0].value;
					}
				}
			}
		});
	};
};
