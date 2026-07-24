"use client";

import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  useContext,
} from "react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";

export type ChoiceboxProps = ComponentProps<typeof RadioGroup>;

export const Choicebox = ({ className, ...props }: ChoiceboxProps) => (
  <RadioGroup className={cn("w-full", className)} {...props} />
);

type ChoiceboxItemContextValue = {
  value: ChoiceboxItemProps["value"];
  id?: ChoiceboxItemProps["id"];
};

const ChoiceboxItemContext = createContext<ChoiceboxItemContextValue | null>(
  null
);

const useChoiceboxItemContext = () => {
  const context = useContext(ChoiceboxItemContext);

  if (!context) {
    throw new Error(
      "useChoiceboxItemContext must be used within a ChoiceboxItem"
    );
  }

  return context;
};

export type ChoiceboxItemProps = ComponentProps<typeof RadioGroupItem>;

export const ChoiceboxItem = ({
  className,
  children,
  value,
  id,
}: ChoiceboxItemProps) => (
  <ChoiceboxItemContext.Provider value={{ value, id }}>
    <FieldLabel className="block" htmlFor={id}>
      <Field
        className={cn(
          "min-h-16 cursor-pointer rounded-2xl border bg-card/80 px-4 py-3 transition-colors hover:border-foreground/25 hover:bg-accent/60 has-[[data-state=checked]]:border-primary/70 has-[[data-state=checked]]:bg-primary/10",
          className
        )}
        orientation="horizontal"
      >
        {children}
      </Field>
    </FieldLabel>
  </ChoiceboxItemContext.Provider>
);

export type ChoiceboxItemHeaderProps = ComponentProps<typeof FieldContent>;

export const ChoiceboxItemHeader = ({
  className,
  ...props
}: ChoiceboxItemHeaderProps) => (
  <FieldContent className={className} {...props} />
);

export type ChoiceboxItemTitleProps = ComponentProps<typeof FieldTitle>;

export const ChoiceboxItemTitle = ({
  className,
  ...props
}: ChoiceboxItemTitleProps) => <FieldTitle className={className} {...props} />;

export type ChoiceboxItemSubtitleProps = HTMLAttributes<HTMLSpanElement>;

export const ChoiceboxItemSubtitle = ({
  className,
  ...props
}: ChoiceboxItemSubtitleProps) => (
  <span
    className={cn("font-normal text-muted-foreground text-xs", className)}
    {...props}
  />
);

export type ChoiceboxItemDescriptionProps = ComponentProps<
  typeof FieldDescription
>;

export const ChoiceboxItemDescription = ({
  className,
  ...props
}: ChoiceboxItemDescriptionProps) => (
  <FieldDescription className={className} {...props} />
);

export type ChoiceboxIndicatorProps = Partial<
  ComponentProps<typeof RadioGroupItem>
>;

export const ChoiceboxIndicator = (props: ChoiceboxIndicatorProps) => {
  const context = useChoiceboxItemContext();

  return <RadioGroupItem {...props} value={context.value} />;
};
