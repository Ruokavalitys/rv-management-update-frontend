"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/use-toast";
import { updateCategoryAction } from "@/server/actions/category";
import { Category } from "@/server/requests/categoryRequests";
import { Pen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import CategoryDeleteButton from "./CategoryDeleteButton";

const TextDescription = ({
	description,
	setEditing,
}: {
	description: string;
	setEditing: (editing: boolean) => void;
}) => (
	<div className="flex items-center gap-x-2">
		<p className="text-lg text-gray-800 max-w-full flex-grow">{description}</p>
		<Pen
			width={16}
			className="hidden cursor-pointer text-gray-400 hover:text-gray-600 group-hover:block"
			onClick={() => setEditing(true)}
		/>
	</div>
);

const EditDescription = ({
	description,
	originalDescription,
	setDescription,
	setEditing,
	formAction,
	setOpenDialog,
}: {
	description: string;
	originalDescription: string;
	setDescription: (description: string) => void;
	setEditing: (editing: boolean) => void;
	formAction: (formData: FormData) => void;
	setOpenDialog: (open: boolean) => void;
}) => (
	<div className="flex items-center gap-x-2">
		<input
			type="text"
			name="description"
			value={description}
			onChange={(e) => setDescription(e.target.value)}
			autoFocus
			className="w-full max-w-md rounded-sm border border-gray-300 p-2 text-lg focus:border-gray-500"
		/>
		<SubmitButton
			formAction={formAction}
			className="h-8 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded transition duration-200"
			onClick={(e) => {
				e.preventDefault();
				setOpenDialog(true);
			}}
		>
			Save
		</SubmitButton>
		<Button
			className="h-8 px-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition duration-200"
			variant="secondary"
			onClick={() => {
				setDescription(originalDescription);
				setEditing(false);
			}}
		>
			Cancel
		</Button>
	</div>
);

export const CategoryRow = ({
	category,
	productCount,
}: {
	category: Category;
	productCount: number;
}) => {
	const [description, setDescription] = useState(category.description);
	const [editing, setEditing] = useState(false);
	const [state, updateCategory] = useFormState(updateCategoryAction, {
		success: false,
	});
	const { toast } = useToast();
	const [openDialog, setOpenDialog] = useState(false);

	const oldDescriptionRef = useRef(category.description);

	useEffect(() => {
		if (state.success && state.updatedCategory) {
			const oldDescription = oldDescriptionRef.current;
			const newDescription = state.updatedCategory.description;

			setDescription(newDescription);
			setEditing(false);

			toast({
				title: "Category Updated",
				description: `Category "${oldDescription}" is now "${newDescription}"`,
				duration: 6000,
			});

			oldDescriptionRef.current = newDescription;
		}
	}, [state.success, state.updatedCategory]);

	const handleSave = () => {
    oldDescriptionRef.current = category.description;

    const formElement = document.getElementById(`category-form-${category.categoryId}`);

    if (formElement instanceof HTMLFormElement) {
        updateCategory(new FormData(formElement));
        setOpenDialog(false);
    } else {
        console.error("Form element not found:", `category-form-${category.categoryId}`);
    }
};

	const isDefaultCategory = category.categoryId === 0;

	return (
		<form
			id={`category-form-${category.categoryId}`}
			key={category.categoryId}
			className="group flex items-center border-b border-gray-200 py-4 hover:bg-gray-50 transition-colors"
		>
			<input type="hidden" name="categoryId" value={category.categoryId} />
			<div className="w-24 text-lg font-medium text-gray-700 text-center px-4">
				{category.categoryId}
			</div>
			<div className="w-28 text-lg font-medium text-gray-700 text-center px-4">
				{productCount}
			</div>
			<div className="flex-grow text-lg text-left px-4 flex items-center justify-between">
				{editing ? (
					<EditDescription
						description={description}
						originalDescription={category.description}
						setDescription={setDescription}
						setEditing={setEditing}
						formAction={updateCategory}
						setOpenDialog={setOpenDialog}
					/>
				) : (
					<TextDescription description={description} setEditing={setEditing} />
				)}
				{!isDefaultCategory && (
					<CategoryDeleteButton
						className="hidden h-7 bg-red-500 hover:bg-red-600 text-white rounded px-2 group-hover:inline-flex"
						category={category}
					/>
				)}
			</div>

			<AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm Category Update</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to rename the category to{" "}
							<strong>{description}</strong>?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setOpenDialog(false)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleSave}
							className="bg-blue-600 text-white hover:bg-blue-700"
						>
							Save
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</form>
	);
};