"use client";

import dynamic from "next/dynamic";
import { colors } from "./types";
import { rgbaObjectToString } from "./utils";

// Disable SSR for color pickers to avoid hydration mismatches caused by 
// dynamic ID generation and browser-specific styles in react-color.
const ChromePicker = dynamic(
  () => import("react-color").then((mod) => mod.ChromePicker),
  { ssr: false }
);

const CirclePicker = dynamic(
  () => import("react-color").then((mod) => mod.CirclePicker),
  { ssr: false }
);

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
};

export const ColorPicker = ({
  value,
  onChange,
}: ColorPickerProps) => {
  return (
    <div className="w-full space-y-4">
      <ChromePicker
        color={value}
        onChange={(color) => {
          const formattedValue = rgbaObjectToString(color.rgb);
          onChange(formattedValue);
        }}
        className="border rounded-lg"
      />
      <CirclePicker
        color={value}
        colors={colors}
        onChangeComplete={(color) => {
          const formattedValue = rgbaObjectToString(color.rgb);
          onChange(formattedValue);
        }}
      />
    </div>
  );
};




