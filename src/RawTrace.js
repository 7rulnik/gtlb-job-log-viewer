import React from "react";

export function RawTrace(props) {
  return (
    <pre style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}>
      {props.trace}
    </pre>
  );
}
