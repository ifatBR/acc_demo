import { forwardRef } from "react";
import { Input as ChakraInput, Flex } from "@chakra-ui/react";
import type { InputProps as ChakraInputProps } from "@chakra-ui/react";
import {
  COLORS,
  RADII,
  FONT_SIZES,
  FONTS,
  SPACING,
} from "@/styles/designTokens";
import { ErrorText } from "./Typography";

interface InputProps extends ChakraInputProps {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error = false, style, ...rest },
  ref,
) {
  const isError = !!error;
  const inputStyle: React.CSSProperties = {
    backgroundColor: COLORS.input.bg,
    border: `1px solid ${isError ? COLORS.input.borderError : COLORS.input.border}`,
    borderRadius: RADII.md,
    color: COLORS.input.color,
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.base,
    padding: `${SPACING[2]} ${SPACING[3]}`,
    outline: "none",
    width: "100%",
    transition: "border-color 0.15s ease",
    ...style,
  };

  return (
    <Flex direction="column">
      <ChakraInput
        ref={ref}
        {...rest}
        style={inputStyle}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = isError
            ? COLORS.input.borderError
            : COLORS.input.borderFocus;
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = isError
            ? COLORS.input.borderError
            : COLORS.input.border;
          rest.onBlur?.(e);
        }}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </Flex>
  );
});
