import { useEffect, useState } from "react";
import { Box, Flex, NativeSelect, Spinner } from "@chakra-ui/react";
import { Button } from "@/components/Button";
import { BodyText, Caption, ErrorText } from "@/components/Typography";
import {
  BORDER_WIDTHS,
  COLORS,
  RADII,
  SHADOWS,
  SPACING,
} from "@/styles/designTokens";
import {
  type FilterOptions,
  type FilterPropName,
  type SelectedFilters,
  clearViewerHighlight,
  filterDbIdsByProperties,
  getDbIdsByPropertyValue,
  getFilterOptions,
  getRenderableDbIds,
  highlightDbIds,
} from "../helpers/viewerFilters";

const CATEGORY_PROP: FilterPropName = "Category";
const DEPENDENT_PROPS: FilterPropName[] = ["Type Name"];
const LEVEL_PROP: FilterPropName = "Level";
const ALL_DEPENDENT: FilterPropName[] = [...DEPENDENT_PROPS, LEVEL_PROP];

interface ModelFilterMenuProps {
  viewer: Autodesk.Viewing.GuiViewer3D;
  visible: boolean;
}

export function ModelFilterMenu({ viewer, visible }: ModelFilterMenuProps) {
  const [allDbIds, setAllDbIds] = useState<number[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryDbIds, setCategoryDbIds] = useState<number[]>([]);
  const [dependentOptions, setDependentOptions] = useState<FilterOptions>({});
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({});
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingDependent, setIsLoadingDependent] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [noMatch, setNoMatch] = useState(false);
  const [matchCount, setMatchCount] = useState(0);

  useEffect(() => {
    setIsLoadingCategories(true);
    const ids = getRenderableDbIds(viewer);
    setAllDbIds(ids);
    getFilterOptions(viewer, ids, [CATEGORY_PROP])
      .then((opts) => setCategoryOptions(opts[CATEGORY_PROP] ?? []))
      .finally(() => setIsLoadingCategories(false));
  }, [viewer]);

  useEffect(() => {
    setSelectedFilters({});
    setNoMatch(false);

    if (!selectedCategory) {
      setCategoryDbIds([]);
      setDependentOptions({});
      return;
    }

    setIsLoadingDependent(true);
    getDbIdsByPropertyValue(viewer, allDbIds, CATEGORY_PROP, selectedCategory)
      .then((catIds) => {
        setCategoryDbIds(catIds);
        return getFilterOptions(viewer, catIds, ALL_DEPENDENT);
      })
      .then(setDependentOptions)
      .finally(() => setIsLoadingDependent(false));
  }, [selectedCategory]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setNoMatch(false);
  };

  const handleFilterChange = (propName: FilterPropName, value: string) => {
    setSelectedFilters((prev) => {
      const next = { ...prev };
      if (value) next[propName] = value;
      else delete next[propName];
      return next;
    });
    setNoMatch(false);
  };

  const handleHighlight = async () => {
    setNoMatch(false);
    const matching = await filterDbIdsByProperties(
      viewer,
      categoryDbIds,
      selectedFilters,
    );
    if (matching.length === 0) {
      clearViewerHighlight(viewer);
      setIsHighlighted(false);
      setNoMatch(true);
      return;
    }
    setMatchCount(matching.length);

    highlightDbIds(viewer, matching);
    setIsHighlighted(true);
  };

  const handleClear = () => {
    clearViewerHighlight(viewer);
    setIsHighlighted(false);
    setNoMatch(false);
    setSelectedCategory("");
  };

  const fieldStyle = {
    bg: COLORS.bg.surface,
    color: COLORS.text.primary,
    borderColor: COLORS.border.default,
    fontSize: "sm",
  };

  return (
    <Box
      position="absolute"
      top={SPACING[4]}
      right={SPACING[10]}
      zIndex={10}
      bg={COLORS.bg.elevated}
      borderRadius={RADII.md}
      shadow={SHADOWS.popup}
      p={SPACING[4]}
      w="240px"
      display={visible ? undefined : "none"}
    >
      {isLoadingCategories ? (
        <Flex justify="center" py={SPACING[4]}>
          <Spinner size="sm" color={COLORS.text.secondary} />
        </Flex>
      ) : (
        <Flex direction="column" gap={SPACING[3]}>
          {/* Category — always enabled */}
          <Box>
            <Caption>{CATEGORY_PROP}</Caption>
            <NativeSelect.Root size="sm" mt={SPACING[1]}>
              <NativeSelect.Field
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                {...fieldStyle}
              >
                <option value="">Select category</option>
                {categoryOptions.map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Box>

          {/* Dependent dropdowns */}
          {isLoadingDependent ? (
            <Flex justify="center" py={SPACING[2]}>
              <Spinner size="sm" color={COLORS.text.secondary} />
            </Flex>
          ) : (
            ALL_DEPENDENT.map((propName) => {
              const options = dependentOptions[propName] ?? [];
              if (selectedCategory && options.length === 0) return null;

              return (
                <Box key={propName} opacity={!selectedCategory ? 0.45 : 1}>
                  <Caption>{propName}</Caption>
                  <NativeSelect.Root
                    size="sm"
                    mt={SPACING[1]}
                    disabled={!selectedCategory}
                  >
                    <NativeSelect.Field
                      value={selectedFilters[propName] ?? ""}
                      onChange={(e) =>
                        handleFilterChange(propName, e.target.value)
                      }
                      {...fieldStyle}
                    >
                      <option value="">All</option>
                      {options.map((val) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Box>
              );
            })
          )}

          {noMatch && <ErrorText>No match was found</ErrorText>}

          <Button
            variant="primary"
            onClick={handleHighlight}
            disabled={!selectedCategory || isLoadingDependent}
          >
            Highlight & Select
          </Button>
          <Button
            variant="secondary"
            onClick={handleClear}
            disabled={!isHighlighted}
          >
            Clear Filtering
          </Button>
          {matchCount ? (
            <Box
              borderTop={`${BORDER_WIDTHS.sm} solid ${COLORS.border.default}`}
            >
              <BodyText {...{ mt: "15px" }}>
                {matchCount} elements found
              </BodyText>
            </Box>
          ) : (
            <></>
          )}
        </Flex>
      )}
    </Box>
  );
}
