import React, { useState } from "react";
import anser from "anser";
import { format } from "date-fns";

import { ReactComponent as ArrowRight } from "./arrow-right.svg";
import { ReactComponent as ArrowDown } from "./arrow-down.svg";
import { Fragment } from "react/jsx-runtime";

// const startRegex = /section_start:(?<startTimestamp>\d+):(?<sectionName>.+)\re\[0K(?<sectionHeader>.+)?/;
const startRegex = /section_start:(?<startTimestamp>\d+):(?<sectionName>[a-zA-Z0-9-_]+)(?:\[(?<sectionOptions>[a-zA-Z0-9-_,=]+)\])?/;

// const endRegex = /section_end:(?<endTimestamp>\d+):(?<sectionName>.+)\re\[0K/;
const endRegex = /section_end:(?<endTimestamp>\d+):(?<sectionName>[a-zA-Z0-9-_]+)/;

function hasStyle(part) {
  return part.decoration || part.fg || part.bg;
}

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

  const rootGroup =
  {
    lines: [],
    options: [],
    indent: 0,
  };

  let groupStack = [rootGroup];

  let lastGroup = rootGroup;

  for (const line of logsByRows) {
    const lastGroup = groupStack[groupStack.length - 1];
    const openMatched = line.text.match(startRegex);
    const closeMatched = line.text.match(endRegex);

    if (!openMatched && !closeMatched) {
      if(line.text)
      {
        lastGroup.lines.push(line);
      }
    } else if (openMatched) {
      const { startTimestamp, sectionName, sectionOptions } = openMatched.groups;

      const parsedOptions = sectionOptions ? sectionOptions.split(",") : [];

      let group = {
        lineNumber: line.lineNumber,
        startTimestamp,
        sectionName,
        lines: [],
        indent: lastGroup.indent + 1,
        options: parsedOptions,
      };
      lastGroup.lines.push(group);
      groupStack.push(group);
    } else if (closeMatched) {
      const { endTimestamp, sectionName } = closeMatched.groups;

      for(let groupIndex = groupStack.length - 1; groupIndex >= 1; --groupIndex)
      {
        const section = groupStack[groupIndex];
        // In case of missing end_section tags, apply to all still unclosed sections on the stack.
        section.endTimestamp = endTimestamp;
        if(section.sectionName === sectionName)
        {
          groupStack.splice(groupIndex, groupStack.length - groupIndex);
          break;
        }
      }
    }
  }

  window.__format = format;

  return (
    <Section {...rootGroup}/>
  );
}

function Line(props) {
  const formatedText = anser.ansiToJson(props.text).map((stringPart, partIndex) => {
    return stringPart.content ? (
      hasStyle(stringPart) ? (
        <span style={getStyle(stringPart)}>
          {stringPart.content}
        </span>
      ) : stringPart.content
    ) : null;
  }).filter(Boolean);

  if(formatedText.length > 0)
  {
    return (
      <div
        className="row"
        id={`L${props.lineNumber}`}
      >
        <a
          href={`#L${props.lineNumber}`}
          className="line-number"
        >
          {props.lineNumber}
        </a>
        <div className="text" style={{'padding-left': props.indent * 2 + "ex"}}>
          {React.createElement.apply(null, [Fragment, {}, ...formatedText])}
        </div>
      </div>
    );
  }
  else
  {
    return null;
  }
}

function SectionHeader(props) {
  let durationString = "Not available";
  if (props.endTimestamp && props.startTimestamp) {
    const date = new Date((props.endTimestamp - props.startTimestamp) * 1000);
    const utcDate = convertDateToUTC(date);
    const template = utcDate.getHours() === 0 ? "mm:ss" : "HH:mm:ss";
    durationString = format(convertDateToUTC(date), template);
  }

  const formatedText = anser.ansiToJson(props.text).map((stringPart, partIndex) => {
    return stringPart.content ? (
      hasStyle(stringPart) ? (
        <span style={getStyle(stringPart)}>
          {stringPart.content}
        </span>
      ) : stringPart.content
    ) : null;
  }).filter(Boolean);

  return (
    <div
      className="row section-row"
      onClick={() => props.toggle(!props.opened)}
      role="button"
      id={`L${props.lineNumber}`}
    >
      <div className="arrow">
        {props.opened ? <ArrowDown /> : <ArrowRight />}
      </div>
      <a
        href={`#L${props.lineNumber}`}
        className="line-number"
      >
        {props.lineNumber}
      </a>

      <div className="text" style={{'padding-left': props.indent * 2 + "ex"}}>
        {React.createElement.apply(null, ['span', {}, ...formatedText])}
        <span className="duration">{durationString}</span>
      </div>
    </div>
  );
}

function Section(props) {
  const [opened, toggle] = useState(props.options.includes("collapsed=true") ? false : true);
    return (
    <>
      <section>
        {props.lines.map((line, lineIndex) => {

          const sectionStart = lineIndex === 0 && props.sectionName;

          if (sectionStart || opened) {
            if('text' in line)
            {
              if(sectionStart)
              {
                return (<SectionHeader {...line} startTimestamp={props.startTimestamp} endTimestamp={props.endTimestamp} toggle={toggle} opened={opened} indent={props.indent - 1} key={lineIndex}/>)
              }
              else
              {
                return (<Line text={line.text} lineNumber={line.lineNumber} indent={props.indent} key={lineIndex}/>)
              }
            }
            else if('lines' in line)
            {
              return (<Section {...line} key={lineIndex}/>);
            }
          }
          return null;
        })}
      </section>
    </>
  );
}

export default Parser;
