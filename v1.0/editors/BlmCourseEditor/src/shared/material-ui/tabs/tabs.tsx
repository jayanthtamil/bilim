import React, { useState, isValidElement, ReactElement } from "react";
import clsx from "clsx";
import MuiAppBar from "@material-ui/core/AppBar";
import MuiTabs from "@material-ui/core/Tabs";
import MuiTab from "@material-ui/core/Tab";

import { TabProps } from "./tab";
import "./tabs-styles.scss";

interface CompProps {
  children: (ReactElement<TabProps> | boolean | null | undefined)[];
  selectedIndex?: false | number;
  closableTab?: boolean;
  className?: string;
  onTabChange?: (value: number) => void;
}

export default function Tabs(props: CompProps) {
  const { children, selectedIndex = 0, closableTab = false, className, onTabChange } = props;
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);
  const tabs = children.filter<ReactElement<TabProps>>(isValidElement);

  React.useEffect(() => {
    setCurrentIndex(selectedIndex);
  }, [selectedIndex, setCurrentIndex]);

  const handleChange = (event: any, newValue: number) => {
    // const { ctrlKey, altKey, shiftKey } = event;
    const selectedTabText = event.currentTarget.textContent;
    if (
      (selectedTabText === "Flap" || selectedTabText === "Detailed") &&
      !(event.ctrlKey && event.altKey && event.shiftKey)
    ) {
      return;
    }
    const curInd = closableTab && currentIndex === newValue ? false : newValue;
    setCurrentIndex(curInd);

    if (onTabChange) {
      onTabChange(newValue);
    }
  };

  return (
    <div
      className={clsx("tabs-container", className, {
        "tab-selected": currentIndex !== false,
        "tab-disabled":
          currentIndex >= 0 && currentIndex < tabs.length
            ? tabs[currentIndex || 0].props.disabled
            : false,
      })}
    >
      <MuiAppBar position="static">
        <MuiTabs value={currentIndex} onChange={handleChange}>
          {tabs.map((tab, index) => (
            <MuiTab
              key={index}
              label={tab.props.label}
              disableRipple
              disabled={tab.props.disabled}
            />
          ))}
        </MuiTabs>
      </MuiAppBar>
      <div className="tab-panel-container">
        {tabs.map((tab, index) => {
          if (currentIndex === index) {
            return tab;
          } else {
            return null;
          }
        })}
      </div>
    </div>
  );
}
