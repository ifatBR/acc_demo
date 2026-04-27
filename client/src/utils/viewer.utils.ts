const ButtonState = {
  ACTIVE: 0,
  INACTIVE: 1,
} as const;

export function setupViewerToolbar(
  viewer: Autodesk.Viewing.GuiViewer3D,
  onClickBtn: () => void,
  onFilterToggle: () => void,
) {
  const makeButton = (
    id: string,
    tooltip: string,
    onClick: () => void,
  ): Autodesk.Viewing.UI.Button => {
    const btn = new window.Autodesk.Viewing.UI.Button(id);
    btn.setToolTip(tooltip);
    btn.onClick = onClick;
    return btn;
  };

  const group = new window.Autodesk.Viewing.UI.ControlGroup("my-custom-group");

  const navButtons: Autodesk.Viewing.UI.Button[] = [];

  const setNavActive = (active: Autodesk.Viewing.UI.Button) => {
    navButtons.forEach((b) => b.setState(ButtonState.INACTIVE));
    active.setState(ButtonState.ACTIVE);
  };

  const orbitBtn = makeButton("btn-orbit", "Orbit", () => {
    viewer.setActiveNavigationTool("orbit");
    setNavActive(orbitBtn);
  });
  const panBtn = makeButton("btn-pan", "Pan", () => {
    viewer.setActiveNavigationTool("pan");
    setNavActive(panBtn);
  });

  // Sections button

  let sectionLoaded = false;

  async function enableSection() {
    if (!sectionLoaded) {
      await viewer.loadExtension("Autodesk.Section");
      sectionLoaded = true;
    }

    viewer.toolController.activateTool("section");
  }

  const sectionCombo: Autodesk.Viewing.UI.Button = new (
    window.Autodesk.Viewing.UI as any
  ).ComboButton("btn-section");
  sectionCombo.setToolTip("Add section plane");

  const sectionSubBtns: Autodesk.Viewing.UI.Button[] = [];
  let sectionActive = false;

  const sectionAxisClasses = ["section-y", "section-x", "section-z"];

  const updateSectionComboIcon = (index: number) => {
    const container = (sectionCombo as any).container as HTMLElement | null;
    if (!container) return;
    sectionAxisClasses.forEach(
      (cls) =>
        ["section-y", "section-x", "section-z"].includes(cls) &&
        container.classList.remove(cls),
    );
    if (index >= 0) {
      container.classList.add(sectionAxisClasses[index]);
    }
  };

  const sectionPlaneConfigs = [
    { id: "section-y", label: "Section Y", normal: [0, 1, 0, 0] },
    { id: "section-x", label: "Section X", normal: [1, 0, 0, 0] },
    { id: "section-z", label: "Section Z", normal: [0, 0, 1, 0] },
  ];

  const deactivateSection = () => {
    sectionActive = false;
    const sectionExt = viewer.getExtension("Autodesk.Section") as any;
    sectionExt?.deactivate();
    viewer.setCutPlanes([]);

    viewer.setActiveNavigationTool("orbit");
    sectionSubBtns.forEach((b) => b.setState(ButtonState.INACTIVE));
    navButtons.forEach((b) => b.setState(ButtonState.INACTIVE));
    orbitBtn.setState(ButtonState.ACTIVE);
    updateSectionComboIcon(-1);
  };

  const activateSectionPlane = async (index: number) => {
    sectionActive = true;
    sectionSubBtns.forEach((b, i) =>
      b.setState(i === index ? ButtonState.ACTIVE : ButtonState.INACTIVE),
    );

    await enableSection();
    const sectionExt = viewer.getExtension("Autodesk.Section") as any;
    const modes = ["y", "x", "z"];
    sectionExt.activate(modes[index]);

    setNavActive(sectionCombo);
    updateSectionComboIcon(index);
  };

  sectionCombo.onClick = () => {
    enableSection();
    if (sectionActive) {
      deactivateSection();
    } else {
      (sectionCombo as any).subMenu?.setVisible(true);
    }
  };

  sectionPlaneConfigs.forEach(({ id, label }, index) => {
    const subBtn = makeButton(id, label, () => activateSectionPlane(index));
    sectionSubBtns.push(subBtn);
    (sectionCombo as any).addControl(subBtn);
  });

  navButtons.push(orbitBtn, panBtn, sectionCombo);

  const fullscreenBtn = makeButton("btn-fullscreen", "Full screen", () => {
    const container = viewer.container as HTMLElement;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.();
      fullscreenBtn.setState(ButtonState.ACTIVE);
    } else {
      document.exitFullscreen?.();
      fullscreenBtn.setState(ButtonState.INACTIVE);
    }
  });

  const propertiesBtn = makeButton("btn-properties", "Properties", () => {
    const panel = (viewer as any).getPropertyPanel?.(true);
    const willShow = !panel?.isVisible?.();
    panel?.setVisible?.(willShow);
    propertiesBtn.setState(
      willShow ? ButtonState.ACTIVE : ButtonState.INACTIVE,
    );
  });

  const filterBtn = makeButton(
    "filter-elements-button",
    "Filter elements",
    () => {
      const next = filterBtn.getState() !== ButtonState.ACTIVE;
      filterBtn.setState(next ? ButtonState.ACTIVE : ButtonState.INACTIVE);
      onFilterToggle();
    },
  );

  group.addControl(orbitBtn);
  group.addControl(panBtn);
  group.addControl(sectionCombo);
  group.addControl(fullscreenBtn);
  group.addControl(propertiesBtn);
  group.addControl(filterBtn);
  group.addControl(makeButton("my-custom-button", "Fish", onClickBtn));

  const addToolbar = () => {
    ["navTools", "modelTools", "settingsTools"].forEach((id) => {
      const ctrl = viewer.toolbar.getControl(id);
      if (ctrl) viewer.toolbar.removeControl(ctrl);
    });
    if (!viewer.toolbar.getControl("my-custom-group")) {
      viewer.toolbar.addControl(group);
    }
    orbitBtn.setState(ButtonState.ACTIVE);
    updateSectionComboIcon(-1);
  };

  if (viewer.toolbar) {
    addToolbar();
  } else {
    viewer.addEventListener(
      window.Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
      addToolbar,
    );
  }

  return () => {
    viewer.removeEventListener(
      window.Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
      addToolbar,
    );
    const existingGroup = viewer.toolbar?.getControl("my-custom-group");
    if (existingGroup) {
      viewer.toolbar.removeControl(existingGroup);
    }
  };
}
