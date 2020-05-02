import React, { useState } from "react";
import anser from "anser";
import { format } from "date-fns";

import { ReactComponent as ArrowRight } from "./arrow-right.svg";
import { ReactComponent as ArrowDown } from "./arrow-down.svg";

// const startRegex = /section_start:(?<startTimestamp>\d+):(?<sectionName>.+)\re\[0K(?<sectionHeader>.+)?/;
const startRegex = /section_start:(?<startTimestamp>\d+):(?<sectionName>.+)/;

// const endRegex = /section_end:(?<endTimestamp>\d+):(?<sectionName>.+)\re\[0K/;
const endRegex = /section_end:(?<endTimestamp>\d+):(?<sectionName>.+)/;

const { pathname } = window.location;

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

function convertDateToUTC(date) {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
}

function Parser(props) {
  const logsByRows = props.trace.split("\n").map((text, index) => {
    return {
      text,
      lineNumber: index + 1,
    };
  });

  const groupBeSection = [
    {
      lines: [],
    },
  ];

  for (const line of logsByRows) {
    const lastGroup = groupBeSection[groupBeSection.length - 1];
    const openMatched = line.text.match(startRegex);
    const closeMatched = line.text.match(endRegex);

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

  window.__groupBeSection = groupBeSection;
  window.__format = format;

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

  let durationString;
  if (props.endTimestamp && props.startTimestamp) {
    const date = new Date((props.endTimestamp - props.startTimestamp) * 1000);
    const utcDate = convertDateToUTC(date);
    const template = utcDate.getHours() === 0 ? "mm:ss" : "HH:mm:ss";
    durationString = format(convertDateToUTC(date), template);
  }

  return (
    <>
      <section>
        {props.lines.map((line, lineIndex) => {
          const json = anser.ansiToJson(line.text);

          const sectionStart = lineIndex === 0 && props.sectionName;

          const text = json.map((stringPart, partIndex) => {
            return (
              <span key={partIndex} style={getStyle(stringPart)}>
                {stringPart.content}
              </span>
            );
          });

          if (sectionStart || opened) {
            return (
              <div
                key={lineIndex}
                className={`row ${sectionStart ? "section-row" : ""}`}
                onClick={sectionStart ? () => toggle(!opened) : undefined}
                role={sectionStart ? "button" : ""}
                id={`L${line.lineNumber}`}
              >
                {sectionStart && (
                  <div className="arrow">
                    {opened ? <ArrowDown /> : <ArrowRight />}
                  </div>
                )}
                <a
                  href={`${pathname}#L${line.lineNumber}`}
                  className="line-number"
                >
                  {line.lineNumber}
                </a>

                <div className="text">
                  <div key={lineIndex}>{text}</div>
                  {sectionStart && (
                    <span className="duration">{durationString}</span>
                  )}
                </div>
              </div>
            );
          }
          {
            /* 
          if (lineIndex === 0 && props.sectionName) {
            return (
              <div className="row">
                <a
                  href={`${pathname}#${line.lineNumber}`}
                  className="line-number"
                >
                  {line.lineNumber}
                </a>
                <div
                  key={lineIndex}
                  role="button"
                  className="section-name"
                  onClick={() => toggle(!opened)}
                >
                  {json.map((stringPart, partIndex) => {
                    return (
                      <span key={partIndex} style={getStyle(stringPart)}>
                        {stringPart.content}
                      </span>
                    );
                  })}
                  <span className="duration">{durationString}</span>
                </div>
              </div>
            );
          } */
          }

          {
            /* if (opened) {
            return (
              <div className="row">
                <a className="line-number">{line.lineNumber}</a>
                <div key={lineIndex}>
                  {json.map((stringPart, partIndex) => {
                    return (
                      <span key={partIndex} style={getStyle(stringPart)}>
                        {stringPart.content}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          } */
          }

          return null;
        })}
      </section>
    </>
  );
}

export default Parser;
