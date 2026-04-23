export function setupViewerToolbar(
  viewer: Autodesk.Viewing.GuiViewer3D,
  onClickBtn: () => void,
) {
  const button = new window.Autodesk.Viewing.UI.Button("my-custom-button");
  button.setToolTip("Fish");

  button.onClick = () => {
    onClickBtn();
  };
  const group = new window.Autodesk.Viewing.UI.ControlGroup("my-custom-group");
  group.addControl(button);

  const addToolbar = () => {
    if (!viewer.toolbar?.getControl("my-custom-group")) {
      viewer.toolbar.addControl(group);
    }
  };

  if (viewer.toolbar) {
    addToolbar();
  } else {
    viewer.addEventListener(
      window.Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
      addToolbar,
    );
  }

  //The returned cleanup function that we can run later in the useEffect return.
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
