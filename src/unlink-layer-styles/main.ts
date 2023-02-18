const SUPPORTED_NODE_TYPES = [
  "BOOLEAN_OPERATION",
  "COMPONENT_SET",
  "COMPONENT",
  "ELLIPSE",
  "FRAME",
  "GROUP",
  "INSTANCE",
  "LINE",
  "POLYGON",
  "RECTANGLE",
  "SECTION",
  "STAR",
  "VECTOR",
];

const STYLE_ID_PROPERTIES = [
  "gridStyleId",
  "textStyleId",
  "fillStyleId",
  "strokeStyleId",
  "effectStyleId",
] as const;

let totalStylesUnlinked = 0;
let totalElementsChanged = 0;

function unlinkStyle(node: SceneNode) {
  // TODO: Remove styles from text ranges

  return (
    total: number,
    styleIdProperty: typeof STYLE_ID_PROPERTIES[number]
  ) => {
    if (styleIdProperty in node && (node as any)[styleIdProperty] !== "") {
      (node as any)[styleIdProperty] = "";
      return total + 1;
    }

    return total;
  };
}

function unlinkStyles(node: SceneNode) {
  if (!SUPPORTED_NODE_TYPES.includes(node.type)) return;

  const totalChangesApplied = STYLE_ID_PROPERTIES.reduce(unlinkStyle(node), 0);

  if (totalChangesApplied > 0) {
    totalStylesUnlinked += totalChangesApplied;
    totalElementsChanged += 1;
  }

  if ("children" in node) {
    node.children.forEach((children: SceneNode) => {
      unlinkStyles(children);
    });
  }
}

function getMessage() {
  const stylesCopy = totalStylesUnlinked > 1 ? "styles" : "style";
  const elementsCopy = totalElementsChanged > 1 ? "elements" : "element";
  const fullStylesCopy = `${totalStylesUnlinked} ${stylesCopy}`;
  const fullElementsCopy = `${totalElementsChanged} ${elementsCopy}`;
  const message = `Removed ${fullStylesCopy} from ${fullElementsCopy}`;

  return message;
}

export default function () {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    return figma.notify("Select at least one element to unlink styles");
  }

  selection.forEach(unlinkStyles);

  if (totalStylesUnlinked === 0) return figma.notify("No linked styles found");

  figma.closePlugin(getMessage());
}
