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
		const mappedCategories = categories.map((category) => {
			const [title, description] = category.description.split(" (");
			return {
				...category,
				title,
				description: description?.replace(")", ""),
			};
		});
		return mappedCategories.sort((a, b) => a.title.localeCompare(b.title));
	}, [categories]);

	useEffect(() => {
		setInternalValue(value?.toString() ?? "");
	}, [value]);

	const selectedCategory = enhancedCategories.find(
		(category) => category.categoryId.toString() === internalValue,
	);

	const filterByTitle = (
		value: string,
		search: string,
		keywords?: string[],
	) => {
		const category = enhancedCategories.find(
			(cat) => cat.categoryId.toString() === value,
		);
		if (!category) return 0;
		const searchString =
			`${category.title} ${keywords?.join(" ") || ""}`.toLowerCase();
		return searchString.includes(search.toLowerCase()) ? 1 : 0;
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={merge(
						"flex w-full justify-between text-left truncate",
						className,
					)}
					style={{
						maxWidth: "100%",
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis",
					}}
					title={
						selectedCategory
							? `${selectedCategory.title} (${selectedCategory.description})`
							: "Select product..."
					}
					aria-label={
						selectedCategory
							? `${selectedCategory.title} (${selectedCategory.description})`
							: "Select product..."
					}
					{...props}
					role="combobox"
					aria-expanded={open}
				>
					{selectedCategory ? selectedCategory.title : "Select product..."}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<input type="hidden" name={name} value={Number(internalValue) || ""} />
			<PopoverContent align="start" className="w-[449px] p-0">
				<Command className="w-[449px]" filter={filterByTitle}>
					<CommandInput
						className="w-[449px] h-10"
						placeholder="Search products..."
					/>
					<CommandEmpty>No product found.</CommandEmpty>
					<CommandGroup className="max-h-80 overflow-y-scroll w-[449px]">
						{enhancedCategories.map(({ categoryId, title, description }) => (
							<CommandItem
								key={categoryId.toString()}
								value={categoryId.toString()}
								aria-label={`${title} (${description})`}
								onSelect={() => {
									setInternalValue(categoryId.toString());
									onValueChange?.(categoryId);
									setOpen(false);
								}}
								className={merge(
									"flex-col items-start w-[449px]",
									categoryId.toString() === internalValue && "bg-stone-100",
								)}
							>
								<span
									style={{
										maxWidth: "100%",
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis",
									}}
									title={`${title} (${description})`}
								>
									{title}
								</span>
								{description && (
									<span
										className="mr-2 opacity-50"
										style={{
											maxWidth: "100%",
											whiteSpace: "nowrap",
											overflow: "hidden",
											textOverflow: "ellipsis",
										}}
										title={description}
									>
										{description}
									</span>
								)}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
