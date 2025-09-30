"use client";
import {
  Primitive
} from "./chunk-5YH6KOWX.js";
import "./chunk-35OGIGHX.js";
import "./chunk-IWGL5MBO.js";
import {
  require_jsx_runtime
} from "./chunk-7VVGZQXU.js";
import {
  require_react
} from "./chunk-FADBDFBI.js";
import {
  __toESM
} from "./chunk-G3PMV62Z.js";

// node_modules/.pnpm/@radix-ui+react-label@2.1.7_@types+react-dom@19.1.9_@types+react@19.1.13__@types+react@19.1.1_4phs5eyuinlsssw5uvnqriwbjq/node_modules/@radix-ui/react-label/dist/index.mjs
var React = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var NAME = "Label";
var Label = React.forwardRef((props, forwardedRef) => {
  return (0, import_jsx_runtime.jsx)(
    Primitive.label,
    {
      ...props,
      ref: forwardedRef,
      onMouseDown: (event) => {
        const target = event.target;
        if (target.closest("button, input, select, textarea")) return;
        props.onMouseDown?.(event);
        if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
      }
    }
  );
});
Label.displayName = NAME;
var Root = Label;
export {
  Label,
  Root
};
//# sourceMappingURL=@radix-ui_react-label.js.map
