import React from "react";
import type { Meta, StoryFn, StoryObj } from "@storybook/react";
import {
  NinjaGL,
  INinjaGL,
  ExportNjcFile,
  NJCFile,
  initTpConfig,
  initTpOMs,
  initTpSMs,
  initTpUMs,
} from "../lib";
import { HiEye, HiEyeSlash } from "react-icons/hi2";

const meta: Meta<typeof NinjaGL> = {
  title: "NinjaGL",
  component: NinjaGL,
  parameters: {
    layout: "centered",
  },
  argTypes: {},
  decorators: [
    (Story) => (
      <div
        style={{
          height: "90vh",
          width: "90vw",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NinjaGL>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultProps: INinjaGL = {};

const Template: StoryFn<typeof NinjaGL> = (args: INinjaGL) => {
  const njcFile = ExportNjcFile(
    initTpOMs(),
    initTpUMs(),
    [],
    initTpSMs(),
    initTpConfig(),
    {}
  );
  // config
  return <NinjaGL {...args} njc={njcFile} />;
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
