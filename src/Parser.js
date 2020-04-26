import React, { useState } from "react";
import anser from "anser";

// eslint-disable-next-line import/no-webpack-loader-syntax
import log from "!!raw-loader!./log.txt";

// const content = document.querySelector("pre").innerText;

// const startRegex = /section_start:(?<startTimestamp>\d+):(?<sectionName>.+)\re\[0K(?<sectionHeader>.+)?/;
const startRegex = /section_start:(?<startTimestamp>\d+):(?<sectionName>.+)/;

// const endRegex = /section_end:(?<endTimestamp>\d+):(?<sectionName>.+)\re\[0K/;
const endRegex = /section_end:(?<endTimestamp>\d+):(?<sectionName>.+)/;

function getStyle(part) {
  const style = {};

  if (part.decoration === "bold") {
    style.fontWeight = "bold";
  } else if (part.decoration === "dim") {
    style.opacity = 0.5;
  } else if (part.decoration === "italic") {
    style.fontStyle = "italic";
  } else if (part.decoration === "reverse") {
    style.filter = "invert(100%)";
  } else if (part.decoration === "hidden") {
    style.visibility = "hidden";
  } else if (part.decoration === "strikethrough") {
    style.textDecoration = "line-through";
  } else {
    style.textDecoration = part.decoration;
  }

  if (part.fg) {
    style.color = `rgb(${part.fg})`;
  }

  if (part.bg) {
    style.background = `rgb(${part.bg})`;
  }

  return style;
}

function Parser() {
  const logsByRows = log.split("\n");

  const groupBeSection = [
    {
      lines: [],
    },
  ];

  for (const line of logsByRows) {
    //   debugger;
    const lastGroup = groupBeSection[groupBeSection.length - 1];
    const openMatched = line.match(startRegex);
    const closeMatched = line.match(endRegex);

    if (!openMatched && !closeMatched) {
      lastGroup.lines.push(line);
    } else if (openMatched) {
      const { startTimestamp, sectionName, sectionHeader } = openMatched.groups;

      groupBeSection.push({
        startTimestamp,
        sectionName,
        lines: [],
        sectionHeader,
      });
    } else if (closeMatched) {
      const { endTimestamp, sectionName } = closeMatched.groups;

      if (lastGroup.sectionName === sectionName) {
        lastGroup.endTimestamp = endTimestamp;
      }
    }
  }

  //   debugger;

  const logsAsJson = logsByRows.map((row) => anser.ansiToJson(row));

  //   return (
  //     <code>
  //       {logsAsJson.map((row, key) => {
  //         return (
  //           <div key={key} className="row">
  //             {row.map((stringPart, index) => {
  //               if (stringPart.content.startsWith("section_start:")) {
  //                 return (
  //                   <>
  //                     <br />
  //                     <br />
  //                   </>
  //                 );
  //               }

  //               if (stringPart.content.startsWith("section_end:")) {
  //                 return null;
  //               }
  //               return (
  //                 <span key={index} style={getStyle(stringPart)}>
  //                   {stringPart.content}
  //                 </span>
  //               );
  //             })}
  //           </div>
  //         );
  //       })}
  //     </code>
  //   );

  return (
    <code>
      {groupBeSection.map((section, index) => {
        return <Section {...section} key={index} />;
      })}
    </code>
  );
}

function Section(props) {
  const [opened, toggle] = useState(true);
  return (
    <>
      <br />
      <br />
      <section>
        <div onClick={() => toggle(!opened)}>
          {opened ? "↓" : "→"}
          {props.sectionName} diff: {new Date((props.endTimestamp - props.startTimestamp) * 1000).toLocaleString()}
        </div>
        <br />
        {opened &&
          props.lines.map((line, lineIndex) => {
            const json = anser.ansiToJson(line);
            return (
              <div key={lineIndex} className="row">
                {json.map((stringPart, partIndex) => {
                  return (
                    <span key={partIndex} style={getStyle(stringPart)}>
                      {stringPart.content}
                    </span>
                  );
                })}
              </div>
            );
          })}
      </section>
    </>
  );
}

export default Parser;
