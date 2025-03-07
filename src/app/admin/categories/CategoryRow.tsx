"use client";

import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/use-toast";
import { updateCategoryAction } from "@/server/actions/category";
import { Category } from "@/server/requests/categoryRequests";
import { Pen } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import CategoryDeleteButton from "./CategoryDeleteButton";

const TextDescription = ({
  description,
  setEditing,
  category,
}: {
  description: string;
  setEditing: (editing: boolean) => void;
  category: Category;
}) => {
  return (
    <>
      <div className="flex flex-grow items-center gap-x-2">
        <p>{description}</p>
        <Pen
          width={16}
          className="hidden cursor-pointer hover:text-gray-500 group-hover:block"
          onClick={() => setEditing(true)}
        />
      </div>
      <CategoryDeleteButton
        className="hidden h-7 group-hover:flex"
        category={category}
      />
    </>
  );
};

const EditDescription = ({
  description,
  originalDescription,
  setDescription,
  setEditing,
  formAction,
}: {
  description: string;
  originalDescription: string;
  setDescription: (description: string) => void;
  setEditing: (editing: boolean) => void;
  formAction: (formData: FormData) => void;
}) => {
  return (
    <div className="-my-0.5 flex flex-grow items-center gap-x-2">
      <input
        type="text"
        name="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        autoFocus
        className="flex-grow rounded-sm border-b-2 transition-colors duration-200 focus:border-stone-950 focus-visible:outline-none"
      />
      <SubmitButton formAction={formAction} className="h-8">
        Save
      </SubmitButton>
      <Button
        className="h-8"
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
};
export const CategoryRow = ({
  category,
  productCount,
}: {
  category: Category;
  productCount: number;
}) => {
  const [description, setDescription] = useState(category.description);
  const [editing, setEditing] = useState(false);

  const [state, updateCategory] = useFormState<
    ReturnType<typeof updateCategoryAction>,
    FormData
  >(updateCategoryAction, { success: false });

  const { toast } = useToast();
  useEffect(() => {
    if (state.success && state.updatedCategory) {
      setDescription(state.updatedCategory.description);
      setEditing(false);

      toast({
        title: "Category Updated",
        description: `Category "${category.description}" is now "${state.updatedCategory.description}"`,
        duration: 6000,
      });
    }
  }, [state.success, state.updatedCategory]);

  useEffect(() => {
    if (state.error) {
      toast({
        title: "Error",
        description: "An error occurred while updating the category",
        duration: 6000,
      });
    }
  }, [state.error]);

  return (
    <form
      key={category.categoryId}
      className="group flex items-center justify-start border-b border-gray-200 p-4"
    >
      <input type="hidden" name="categoryId" value={category.categoryId} />
      <div className="w-24 text-lg font-semibold">{category.categoryId}</div>
      <div className="w-24 text-lg font-semibold">{productCount}</div>
      <div className="flex flex-grow items-center gap-x-2 text-lg">
        {editing ? (
          <EditDescription
            description={description}
            originalDescription={category.description}
            setDescription={setDescription}
            setEditing={setEditing}
            formAction={updateCategory}
          />
        ) : (
          <TextDescription
            description={description}
            category={category}
            setEditing={setEditing}
          />
        )}
      </div>
    </form>
  );
};
