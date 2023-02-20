/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
	ignoredRouteFiles: ['**/.*'],
	// appDirectory: "app",
	// assetsBuildDirectory: "public/build",
	// serverBuildPath: "build/index.js",
	// publicPath: "/build/",
	serverDependenciesToBundle: [
		// remix ESM issue: https://github.com/remix-run/remix/issues/109#issuecomment-1100583571
		/^rehype.*/,
		/^remark.*/,
		/^unified.*/,
		/^unist.*/,
		/^hast.*/,
		/^bail.*/,
		/^trough.*/,
		/^mdast.*/,
		/^micromark.*/,
		/^decode.*/,
		/^character.*/,
		/^property.*/,
		/^space.*/,
		/^comma.*/,
		/^react-markdown$/,
		/^vfile.*/,
		'trim-lines',
	],
	future: {
		unstable_tailwind: true,
	},
};
