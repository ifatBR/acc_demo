import type { ReactNode } from "react";
import { Heading, Text } from "@chakra-ui/react";
import { COLORS, FONT_SIZES, FONT_WEIGHTS } from "@/styles/designTokens";

interface ChildrenProps {
  children: ReactNode;
}

export function PageTitle({ children }: ChildrenProps) {
  return (
    <Heading
      as="h1"
      margin={0}
      fontSize={FONT_SIZES["2xl"]}
      fontWeight={FONT_WEIGHTS.semibold}
      color={COLORS.text.primary}
    >
      {children}
    </Heading>
  );
}

export function SectionTitle({ children }: ChildrenProps) {
  return (
    <Heading
      as="h2"
      margin={0}
      fontSize={FONT_SIZES.lg}
      fontWeight={FONT_WEIGHTS.semibold}
      color={COLORS.text.primary}
    >
      {children}
    </Heading>
  );
}

interface BodyTextProps extends ChildrenProps {
  align?: string;
  secondary?: boolean;
}

export function BodyText({
  children,
  align,
  secondary = false,
}: BodyTextProps) {
  return (
    <Text
      textAlign={align}
      m={0}
      fontSize={FONT_SIZES.base}
      fontWeight={FONT_WEIGHTS.regular}
      color={secondary ? COLORS.text.secondary : COLORS.text.primary}
    >
      {children}
    </Text>
  );
}

export function Caption({ children }: ChildrenProps) {
  return (
    <Text
      as="span"
      fontSize={FONT_SIZES.sm}
      fontWeight={FONT_WEIGHTS.regular}
      color={COLORS.text.tertiary}
    >
      {children}
    </Text>
  );
}

interface ErorTextProps extends ChildrenProps {
  bold?: boolean;
}
export function ErrorText({ children, bold }: ErorTextProps) {
  return (
    <Text
      as="span"
      fontSize={FONT_SIZES.sm}
      fontWeight={bold ? FONT_WEIGHTS.bold : FONT_WEIGHTS.regular}
      color={COLORS.semantic.error}
    >
      {children}
    </Text>
  );
}
