import React from "react";
import type { Meta, StoryFn, StoryObj } from "@storybook/react";
import {
  ExportButton,
} from "./ExportButton";

const meta: Meta<typeof ExportButton> = {
  title: "Testing/ExportTesting",
  component: ExportButton,
  parameters: {
    layout: "centered",
  },
  argTypes: {},
  decorators: [
    (Story) => (
      <Story />
    ),
  ],
} satisfies Meta<typeof ExportButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultProps = {};

const Template: StoryFn<typeof ExportButton> = () => {
  return <ExportButton />;
};

/**
 * Plane Geometry && Dom Alignment
 */
export const Default: Story = {
  render: Template,
  args: {
    ...defaultProps,
  },
};
