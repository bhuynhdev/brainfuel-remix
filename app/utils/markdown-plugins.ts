import { InputRule } from 'prosemirror-inputrules';
import { expectDomTypeError } from '@milkdown/exception';
import { codeBlockAttr, codeBlockSchema } from '@milkdown/preset-commonmark';
import { $inputRule, $nodeSchema, $remark } from '@milkdown/utils';
import remarkDirective from 'remark-directive';
import { type Plugin } from 'unified';
import type { MilkdownPlugin } from '@milkdown/ctx';

// export const rehypeCodeQuiz: Plugin<Array<{}>, HAST.Root> = () => {
// 	return (tree) => {
// 		visit(tree, 'element', (node) => {
// 			if (node.tagName === 'code') {
// 				// Inject the language as a data properties, using the className
// 				node.properties = Object.assign({}, node.properties);
// 				let language = '';
// 				const className = node.properties.className ?? [''];
// 				if (Array.isArray(className)) {
// 					const languageClasses = className.map((val) => val.toString()).filter((name) => name.startsWith('language'));
// 					if (languageClasses.length > 0) {
// 						language = languageClasses[0].split('-')[1];
// 					}
// 				} else {
// 					const regex = /\blanguage-(\w*)\b/;
// 					const matches = className.toString().match(regex);
// 					// Since there is not /g flag, the 2nd item of the array is the first capturing group
// 					if (matches) language = matches[1];
// 				}
// 				node.properties.dataLang = language || 'plaintext';

// 				// If the code is a quiz, inject the original code block value
// 				if ((node.data?.meta as string)?.includes('quiz')) {
// 					node.data = Object.assign({}, node.data);
// 					// This "code" node should have one children, which is of type "text" that contains the code block value
// 					// Inject the original text value into the node
// 					if (node.children[0].type === 'text') {
// 						node.data.value = node.children[0].value;
// 					}
// 				}
// 			}
// 		});
// 	};
// };

export const codeBlockWithMeta = codeBlockSchema.extendSchema((prev) => {
	return (ctx) => {
		const baseSchema = prev(ctx);
		return {
			...baseSchema,
			attrs: {
				...baseSchema.attrs,
				meta: { default: '' },
				value: { default: '' },
			},
			parseMarkdown: {
				match: ({ type }) => type === 'code',
				runner: (state, node, type) => {
					const language = node.lang as string;
					const meta = node.meta as string;
					const value = node.value as string;
					state.openNode(type, { language, meta, value });
					if (value) state.addText(value);
					state.closeNode();
				},
			},
			toMarkdown: {
				match: (node) => node.type.name === 'code_block',
				runner: (state, node) => {
					console.log('toMarkdown', node);
					state.addNode('code', undefined, node.content.firstChild?.text || '', {
						lang: node.attrs.language,
						meta: node.attrs.meta,
					});
				},
			},
			parseDOM: [
				{
					tag: 'pre',
					preserveWhitespace: 'full',
					getAttrs: (dom) => {
						if (!(dom instanceof HTMLElement)) throw expectDomTypeError(dom);
						return { language: dom.dataset.language, meta: dom.dataset.meta, value: dom.dataset.value };
					},
				},
			],
			toDOM: (node) => {
				const attr = ctx.get(codeBlockAttr.key)(node);
				return [
					'pre',
					{
						...attr.pre,
						'data-language': node.attrs.language,
						'data-meta': node.attrs.meta,
						'data-value': node.attrs.value,
					},
					['code', attr.code, 0],
				];
			},
		};
	};
});

// export const flashCardSchema = $nodeSchema('flashcard', () => ({
// 	content: 'block*',
// 	group: 'block',
// 	marks: '_',
// 	defining: true,
// 	atom: true,
// 	isolating: true,
// 	attrs: {
// 		value: {
// 			default: '',
// 		},
// 	},
// 	parseDOM: [
// 		{
// 			tag: `div[data-type="flashcard"]`,
// 			preserveWhitespace: 'full',
// 			getAttrs: (dom) => {
// 				console.log('parseDOM', dom);
// 				return { value: (dom as HTMLElement).textContent };
// 			},
// 		},
// 	],
// 	toDOM: (node) => {
// 		console.log('toDOM', node, node.textContent);
// 		const body = node.textContent;
// 		const dom = document.createElement('div');
// 		dom.dataset.type = 'flashcard';
// 		dom.textContent = body;
// 		return dom;
// 	},
// 	parseMarkdown: {
// 		// Since we will be using remark-directive to parse this note https://github.com/remarkjs/remark-directive
// 		// We will let the user type :::qa, so the MDAST node name is `qa`
// 		match: (node) => node.type === 'containerDirective' && node.name === 'qa',
// 		runner: (state, node, type) => {
// 			let value = '';
// 			console.log('parsemarkdown', node);
// 			// According to the AST described here: https://github.com/syntax-tree/mdast-util-directive#syntax-tree
// 			// remark-directive stores its values in the children
// 			// if (node.children && node.children.length > 0) {
// 			// 	value = (node.children[0].children?.[0].value as string) || '';
// 			// }
// 			state.openNode(type);
// 			state.next(node.children);
// 			state.closeNode();
// 		},
// 	},
// 	toMarkdown: {
// 		match: (node) => node.type.name === 'flashcard',
// 		runner: (state, node) => {
// 			const children = [
// 				{
// 					type: 'paragraph',
// 					children: [{ type: 'text', value: node.attrs.value }],
// 				},
// 			];
// 			state.addNode('containerDirective', children, node.attrs.value, {
// 				name: 'qa',
// 				attributes: { src: node.attrs.src },
// 			});
// 		},
// 	},
// }));

// export const remarkMilkdownDirective = $remark(() => remarkDirective);

// const flashCardInputRule = $inputRule(
// 	() =>
// 		new InputRule(/:::qa\n/, (state, match, start, end) => {
// 			const [okay, src = ''] = match;
// 			const $start = state.doc.resolve(start);

// 			if (!okay || !$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), flashCardSchema.type()))
// 				return null;

// 			return state.tr.delete(start, end).setBlockType(start, start, flashCardSchema.type());
// 		})
// );

// export const flashCardPlugin: MilkdownPlugin[] = [flashCardSchema, flashCardInputRule].flat();
