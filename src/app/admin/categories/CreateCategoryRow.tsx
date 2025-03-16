"use client";

import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/use-toast";
import { createCategoryAction } from "@/server/actions/category";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";

export const CreateCategoryRow = () => {
	const [value, setValue] = useState("");
	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
	};

	const [state, createCategory] = useFormState<
		ReturnType<typeof createCategoryAction>,
		FormData
	>(createCategoryAction, { success: false });

	const { toast } = useToast();

	useEffect(() => {
		if (state.success && state.createdCategory) {
			setValue("");
			toast({
				title: "Category Created",
				description: `Category "${state.createdCategory.description}" has been created`,
				duration: 6000,
			});
		}
	}, [state.success, state.createdCategory]);

	useEffect(() => {
		if (state.error) {
			toast({
				title: "Failed to create category",
				description: "Please try again",
				duration: 6000,
			});
		}
	}, [state.error]);

	return (
		<div className="sticky bottom-0 flex items-center justify-start border-t border-gray-200 bg-white p-2 shadow-2xl">
			<form className="flex items-center w-full">
				<div className="flex w-full pl-[200px]">
					<input
						type="text"
						data-next="createCategory"
						className="h-10 w-full border-0 bg-white py-2 px-3 text-[15px] font-normal text-gray-700 placeholder-gray-400 placeholder:text-[15px] focus:outline-none focus:ring-0 focus:border-b-[0.5px] focus:border-gray-300 transition-all duration-300 mr-3"
						placeholder="New category"
						name="description"
						value={value}
						onChange={onChange}
					/>
				</div>
				<SubmitButton
					type="submit"
					id="createCategory"
					formAction={createCategory}
					variant="green"
					disabled={value.trim().length === 0}
					className="h-9 px-3 py-1.5 bg-green-700 text-white text-[15px] rounded shadow-2xl hover:bg-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-colors duration-300 ease-in-out"
				>
					Create category
				</SubmitButton>
			</form>
		</div>
	);
};
