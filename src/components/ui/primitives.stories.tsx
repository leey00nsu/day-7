import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Avatar, AvatarFallback } from "./avatar";
import { Badge } from "./badge";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldTitle,
} from "./field";
import { Label } from "./label";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Separator } from "./separator";

const meta = {
  title: "UI/Foundations",
  parameters: {
    docs: {
      description: {
        component:
          "Kibo UI가 내부적으로 조합하는 shadcn 기본 요소를 한곳에서 검수합니다.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primitives: Story = {
  render: () => (
    <div className="w-[420px] space-y-6 rounded-3xl border bg-card p-6">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>김</AvatarFallback>
        </Avatar>
        <div>
          <Label>김인턴</Label>
          <p className="text-sm text-muted-foreground">전략기획팀 인턴</p>
        </div>
        <Badge className="ml-auto" variant="secondary">
          DAY 1
        </Badge>
      </div>
      <Separator />
      <Field>
        <FieldContent>
          <FieldTitle>자막 표시</FieldTitle>
          <FieldDescription>영상 위 HTML 자막을 표시합니다.</FieldDescription>
        </FieldContent>
      </Field>
      <RadioGroup defaultValue="on" aria-label="자막 표시">
        <div className="flex items-center gap-2">
          <RadioGroupItem id="subtitle-on" value="on" />
          <Label htmlFor="subtitle-on">켜기</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem id="subtitle-off" value="off" />
          <Label htmlFor="subtitle-off">끄기</Label>
        </div>
      </RadioGroup>
    </div>
  ),
};
