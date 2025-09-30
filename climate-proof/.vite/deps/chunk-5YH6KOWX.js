import {
  require_react_dom
} from "./chunk-35OGIGHX.js";
import {
  createSlot
} from "./chunk-IWGL5MBO.js";
import {
  require_jsx_runtime
} from "./chunk-7VVGZQXU.js";
import {
  require_react
} from "./chunk-FADBDFBI.js";
import {
  __toESM
} from "./chunk-G3PMV62Z.js";

// node_modules/.pnpm/@radix-ui+react-primitive@2.1.3_@types+react-dom@19.1.9_@types+react@19.1.13__@types+react@19_tg3cq2ir3pnco2ptbwvdsi7lma/node_modules/@radix-ui/react-primitive/dist/index.mjs
var React = __toESM(require_react(), 1);
var ReactDOM = __toESM(require_react_dom(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
];
var Primitive = NODES.reduce((primitive, node) => {
  const Slot = createSlot(`Primitive.${node}`);
  const Node = React.forwardRef((props, forwardedRef) => {
    const { asChild, ...primitiveProps } = props;
    const Comp = asChild ? Slot : node;
    if (typeof window !== "undefined") {
      window[Symbol.for("radix-ui")] = true;
    }
    return (0, import_jsx_runtime.jsx)(Comp, { ...primitiveProps, ref: forwardedRef });
  });
  Node.displayName = `Primitive.${node}`;
  return { ...primitive, [node]: Node };
}, {});

export {
  Primitive
};
//# sourceMappingURL=chunk-5YH6KOWX.js.map
