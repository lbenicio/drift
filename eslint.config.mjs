import nextConfig from "eslint-config-next"

const eslintConfig = [
	{
		ignores: ["node_modules/**", "**/__tests__/**", "coverage/**", ".next/**", "public/**"]
	},
	...nextConfig
]

export default eslintConfig
