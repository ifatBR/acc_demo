export const FILTER_PROPS = [
  "Category",
  "Family",
  "Family and Type",
  "Type Name",
  "Level",
] as const;

export type FilterPropName = (typeof FILTER_PROPS)[number];
export type FilterOptions = Partial<Record<FilterPropName, string[]>>;
export type SelectedFilters = Partial<Record<FilterPropName, string>>;

export function getRenderableDbIds(
  viewer: Autodesk.Viewing.GuiViewer3D,
): number[] {
  const tree = viewer.model.getInstanceTree();
  const rootId = tree.getRootId();
  const dbIds: number[] = [];

  tree.enumNodeChildren(
    rootId,
    (dbId) => {
      let hasFragments = false;
      tree.enumNodeFragments(dbId, () => {
        hasFragments = true;
      });
      if (hasFragments) dbIds.push(dbId);
    },
    true,
  );

  return dbIds;
}

export function getFilterOptions(
  viewer: Autodesk.Viewing.GuiViewer3D,
  dbIds: number[],
  filterPropertyNames: readonly string[],
): Promise<FilterOptions> {
  return new Promise((resolve, reject) => {
    viewer.model.getBulkProperties(
      dbIds,
      { propFilter: [...filterPropertyNames] },
      (items) => {
        const map: Partial<Record<string, Set<string>>> = {};

        for (const item of items) {
          for (const prop of item.properties) {
            const val = String(prop.displayValue).trim();
            if (!val || val === "undefined" || val === "null") continue;
            if (!map[prop.displayName]) map[prop.displayName] = new Set();
            map[prop.displayName]!.add(val);
          }
        }

        const result: FilterOptions = {};
        for (const name of filterPropertyNames as readonly FilterPropName[]) {
          const set = map[name];
          if (set?.size) result[name] = Array.from(set).sort();
        }
        resolve(result);
      },
      reject,
    );
  });
}

export function getDbIdsByPropertyValue(
  viewer: Autodesk.Viewing.GuiViewer3D,
  dbIds: number[],
  propertyName: string,
  value: string,
): Promise<number[]> {
  return new Promise((resolve, reject) => {
    viewer.model.getBulkProperties(
      dbIds,
      { propFilter: [propertyName] },
      (items) => {
        const matching = items
          .filter((item) => {
            const prop = item.properties.find(
              (p) => p.displayName === propertyName,
            );
            return prop && String(prop.displayValue).trim() === value;
          })
          .map((item) => item.dbId);
        resolve(matching);
      },
      reject,
    );
  });
}

export function filterDbIdsByProperties(
  viewer: Autodesk.Viewing.GuiViewer3D,
  dbIds: number[],
  selectedFilters: SelectedFilters,
): Promise<number[]> {
  const entries = Object.entries(selectedFilters).filter(
    (entry): entry is [FilterPropName, string] => !!entry[1],
  );

  if (entries.length === 0) return Promise.resolve(dbIds);

  return new Promise((resolve, reject) => {
    viewer.model.getBulkProperties(
      dbIds,
      { propFilter: entries.map(([k]) => k) },
      (items) => {
        const matching = items
          .filter((item) =>
            entries.every(([propName, value]) => {
              const prop = item.properties.find(
                (p) => p.displayName === propName,
              );
              return prop && String(prop.displayValue).trim() === value;
            }),
          )
          .map((item) => item.dbId);
        resolve(matching);
      },
      reject,
    );
  });
}

export function highlightDbIds(
  viewer: Autodesk.Viewing.GuiViewer3D,
  dbIds: number[],
): void {
  const model = viewer.model;
  viewer.clearThemingColors(model);
  viewer.isolate(dbIds);
  viewer.select(dbIds);
  const red = new THREE.Vector4(1, 0, 0, 1);
  dbIds.forEach((id) => viewer.setThemingColor(id, red, model, true));
  viewer.fitToView(dbIds);
  viewer.impl?.invalidate?.(true, true, true);
}

export function clearViewerHighlight(viewer: Autodesk.Viewing.GuiViewer3D): void {
  viewer.clearSelection();
  viewer.clearThemingColors(viewer.model);
  viewer.isolate([]);
  viewer.impl?.invalidate?.(true, true, true);
}
