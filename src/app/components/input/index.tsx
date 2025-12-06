import * as React from "react"

import { cn } from "@lib/cn"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
	label?: string
	hideLabel?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, label, hideLabel, ...props }, ref) => {
	const id = React.useId()
	return (
		<span className="flex w-full flex-row items-center">
			{label && !hideLabel ? (
				<label htmlFor={id} className={cn("border-input text-muted-foreground h-10 rounded-md border bg-transparent px-3 py-2 text-sm font-medium", "rounded-tr-none rounded-br-none", className)}>
					{label}
				</label>
			) : null}
			{label && hideLabel ? (
				<label htmlFor={id} className="sr-only">
					{label}
				</label>
			) : null}
			<input
				type={type}
				className={cn(
					"border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full border bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
					label && !hideLabel ? "rounded-tl-none rounded-bl-none border-l-0" : "rounded-md",
					className
				)}
				ref={ref}
				id={id}
				{...props}
			/>
		</span>
	)
})
Input.displayName = "Input"

export { Input }
