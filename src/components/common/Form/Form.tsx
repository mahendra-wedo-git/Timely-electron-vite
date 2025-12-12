import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { useEffect } from "react";
import {
  DefaultValues,
  FieldValues,
  FormProvider,
  Resolver,
  UseFormReturn,
  useForm,
} from "react-hook-form";

export type ISubmitHandler<T extends FieldValues> = (
  data: T,
  methods: UseFormReturn<T>
) => unknown | Promise<unknown>;

export interface FormProps<T extends FieldValues> {
  onSubmit: ISubmitHandler<T>;
  schema?: any;
  children: React.ReactNode;
  className: string;
  defaultValues?: DefaultValues<T>;
  resetData?: DefaultValues<T>;
  mode?: any;
}

export function Form<T extends FieldValues>({
  schema,
  children,
  onSubmit,
  defaultValues,
  resetData,
  mode = "onChange",
  ...rest
}: FormProps<T>) {
  const methods = useForm<T>({
    defaultValues,
    resolver: yupResolver(schema as any) as Resolver<T, any, T>,
    mode: mode,
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (resetData) {
      methods.reset(resetData);
    }
  }, [methods, resetData]);

  const handleSubmit = async (values: T) => {
    try {
      await onSubmit(values, methods);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleSubmit)}
        noValidate // Add this to prevent browser validation
        {...rest}
      >
        {children}
      </form>
    </FormProvider>
  );
}
