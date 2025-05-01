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
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { deleteCategoryAction } from "@/server/actions/category";
import { Category } from "@/server/requests/categoryRequests";
import { ComponentProps } from "react";

const CategoryDeleteButton = ({
	category,
	...rest
}: { category: Category } & ComponentProps<typeof Button>) => {
	const { toast } = useToast();

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive" {...rest}>
					Delete
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Category?</AlertDialogTitle>
					<AlertDialogDescription>
						This will <strong>permanently delete</strong> the category "
						{category.description}" and set all products to the default
						category.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction asChild>
						<Button
							className="bg-red-500 hover:bg-red-600"
							onClick={async () => {
								try {
									const data = await deleteCategoryAction(category.categoryId);

									toast({
										title: "Category deleted",
										description: `Moved ${data.movedProducts.length} products to the default category.`,
										duration: 3000,
									});
								} catch {
									toast({
										title: "Error deleting category",
										duration: 3000,
									});
								}
							}}
						>
							Delete
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default CategoryDeleteButton;
