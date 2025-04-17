"use client";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { merge } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";
import { ComponentProps, useEffect, useMemo, useState } from "react";

interface Category {
	categoryId: number;
	description: string;
}

interface BoxComboboxProps extends ComponentProps<typeof Button> {
	categories: Category[];
	value?: number;
	onValueChange?: (value: number | null) => void;
}

export function BoxCombobox({
	categories,
	value,
	onValueChange,
	className,
	name,
	...props
}: BoxComboboxProps) {
	const [open, setOpen] = useState(false);
	const [internalValue, setInternalValue] = useState(value?.toString() ?? "");
	const enhancedCategories = useMemo(() => {
		return categories.map((category) => {
			const [title, description] = category.description.split(" (");
			return {
				...category,
				title,
				description: description?.replace(")", ""),
			};
		});
	}, [categories]);

	useEffect(() => {
		setInternalValue(value?.toString() ?? "");
	}, [value]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={merge("flex w-full justify-between", className)}
					{...props}
					role="combobox"
					aria-expanded={open}
				>
					{internalValue
						? enhancedCategories.find(
								(category) => category.categoryId.toString() === internalValue,
							)?.title
						: "Select product..."}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<input type="hidden" name={name} value={Number(internalValue) || ""} />
			<PopoverContent align="start" className="w-96 p-0">
				<Command className="w-96">
					<CommandInput className="w-96" placeholder="Search products..." />
					<CommandEmpty>No product found.</CommandEmpty>
					<CommandGroup className="max-h-80 overflow-y-scroll w-96">
						{enhancedCategories.map(({ categoryId, title, description }) => (
							<CommandItem
								key={categoryId.toString()}
								value={title}
								aria-label={title}
								onSelect={() => {
									setInternalValue(categoryId.toString());
									onValueChange?.(categoryId);
									setOpen(false);
								}}
								className={merge(
									"flex-col items-start w-96",
									categoryId.toString() === internalValue && "bg-stone-100",
								)}
							>
								<span>{title}</span>
								{description && (
									<span className="mr-2 opacity-50">{description}</span>
								)}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
