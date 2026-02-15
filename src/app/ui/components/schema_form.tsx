/**
 * Component for generating a form from a Zod object.
 */

import { FormEvent } from "react";
import { toast } from "sonner";
import { ZodObject } from "zod";

export default function SchemaForm({
  obj,
  schema,
  isNew = false,
  customLabels,
  hiddenColumns = ["documentId"],
  readonlyColumns,
  suggestedValues,
  onSubmitted,
}: {
  obj: object;
  schema: ZodObject;
  isNew?: boolean;
  customLabels?: Record<string, string>;
  hiddenColumns?: string[];
  readonlyColumns?: string[];
  suggestedValues?: Record<string, string[]>;
  onSubmitted?: (newObj: object) => void;
}) {
  const keys = Object.keys(obj);
  const types = Object.values(obj).map((v) => typeof v);
  const keysAndTypes = Array.from({ length: keys.length }, (_, i) => [
    keys[i],
    types[i],
  ]);

  // Guess the type from the name or type string
  function inferType(name: string, type: string) {
    if (name.includes("phone")) {
      return "tel";
    } else if (name.includes("mail")) {
      return "email";
    } else if (name.includes("time") || name.includes("date")) {
      return "datetime-local";
    } else if (name.includes("link")) {
      return "url";
    } else if (
      type.includes("number") ||
      name.includes("amount") ||
      name.includes("cost")
    ) {
      return "number";
    }

    return "text";
  }

  function formSubmitted(e: FormEvent<HTMLFormElement>) {
    // Prevents the page from reloading.
    // The default behaviour is to perform a GET request at the current URL with the values of the form passed in
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    // Convert form data to object
    const newObj: Record<string, string> = { ...(isNew ? {} : obj) };
    for (const [k, v] of formData.entries()) {
      newObj[k] = String(v);
    }

    // Ensure "documentId" is included (even though it wasn't part of the form)
    // This is for object creation see "models/base.ts"
    if ("documentId" in obj && !("documentId" in newObj)) {
      const documentId = obj["documentId" as keyof object];
      if (typeof documentId === "string") {
        newObj["documentId"] = documentId;
      }
    }

    const validObj = schema.safeParse(newObj);
    if (validObj.success) {
      onSubmitted?.(validObj.data);
    } else {
      const errorObj = JSON.parse(validObj.error.message)[0];
      const errorField = errorObj["path"][0];

      toast.error(`${errorField} is not valid: '${errorObj["message"]}'.`);
    }
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={formSubmitted}>
      <div>
        {/* For each property in the object */}
        {keysAndTypes.map(([k, t]) => {
          if (hiddenColumns.includes(k)) {
            return null;
          }

          const inferredType = inferType(k, t);
          const key = k as keyof object;
          // full_name -> ["full", "name"] -> ["Full", "Name"] -> "Full Name"
          const generatedLabel = k
            .split("_")
            .map((el) => `${el[0].toUpperCase()}${el.slice(1)}`)
            .join(" ");

          const v = obj[key];
          let currentValue = String(v);
          if (inferredType === "datetime-local") {
            try {
              // Accepted value for datetime-local inputs
              currentValue = new Date(v).toISOString().replace("Z", "");
            } catch (e) {}
          } else if (["true", "false"].includes(currentValue)) {
            // Boolean field
            currentValue = currentValue === "true" ? "Yes" : "No";
          } else if (currentValue === "[object Object]") {
            currentValue = ""; // If an object is passed, just show an empty value
          }

          return (
            <div
              key={k}
              className="py-2 flex flex-col items-baseline justify-start gap-0.5"
            >
              <label htmlFor={k} className="text-xs">
                {customLabels && k in customLabels
                  ? customLabels[k]
                  : generatedLabel}
              </label>
              {/* If the user suggests values for this field, create a dropdown */}
              {suggestedValues && k in suggestedValues ? (
                <select
                  id={k}
                  name={k}
                  defaultValue={currentValue}
                  aria-readonly={readonlyColumns?.includes(k)}
                  className="w-full border border-gray-200 dark:border-gray-600 focus:border-primary rounded outline-0 p-2 text-foreground"
                >
                  {suggestedValues[k].map((sv) => (
                    <option value={sv} key={sv}>
                      {sv}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name={k}
                  id={k}
                  placeholder={
                    customLabels && k in customLabels
                      ? customLabels[k]
                      : generatedLabel
                  }
                  type={inferredType}
                  defaultValue={currentValue}
                  readOnly={readonlyColumns?.includes(k)}
                  className="w-full border border-gray-200 dark:border-gray-600 focus:border-primary rounded outline-0 p-2 text-foreground read-only:text-gray-400"
                />
              )}
            </div>
          );
        })}
      </div>
      <button
        type="submit"
        className="ml-auto bg-primary px-6 py-3 rounded cursor-pointer"
      >
        Done
      </button>
    </form>
  );
}
