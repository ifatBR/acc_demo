export const FileTypes = { RVT: ".rvt", IFC: ".ifc" } as const;
export type FileType = (typeof FileTypes)[keyof typeof FileTypes];
