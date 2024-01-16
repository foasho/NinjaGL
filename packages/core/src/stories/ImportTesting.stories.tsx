import React from "react";
import type { Meta, StoryFn, StoryObj } from "@storybook/react";
import {
  ImportButton,
} from "./ImportButton";

const meta: Meta<typeof ImportButton> = {
  title: "Testing/ImportTesting",
  component: ImportButton,
  parameters: {
    layout: "centered",
  },
  argTypes: {},
  decorators: [
    (Story) => (
      <Story />
    ),
  ],
} satisfies Meta<typeof ImportButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultProps = {};

const Template: StoryFn<typeof ImportButton> = () => {
  return <ImportButton />;
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
