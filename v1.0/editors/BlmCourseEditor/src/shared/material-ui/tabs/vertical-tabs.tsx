import React, {
  useState,
  useRef,
  ReactElement,
  ChangeEvent,
  isValidElement,
  ReactNode,
} from "react";
import clsx from "clsx";
import MuiTabs from "@material-ui/core/Tabs";
import MuiTab from "@material-ui/core/Tab";

import { TabProps } from "./tab";
import "./tabs-styles.scss";

interface CompProps {
  children: (ReactElement<TabProps> | boolean | null | undefined)[];
  otherChildren?: ReactNode;
  selectedIndex?: false | number;
  className?: string;
  onTabChange?: (value: number) => void;
}

export default function VerticalTabs(props: CompProps) {
  const { children, otherChildren, selectedIndex, className, onTabChange } = props;
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);
  const tabs = children.filter<ReactElement<TabProps>>(isValidElement);
  const tabPanelRef = useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setCurrentIndex(selectedIndex);
  }, [selectedIndex, setCurrentIndex]);

  const handleChange = (event: ChangeEvent<{}>, newValue: number) => {
    const tapPanel = tabPanelRef.current;

    setCurrentIndex(newValue);

    if (tapPanel) {
      tapPanel.scrollTop = 0;
    }

    if (onTabChange) {
      onTabChange(newValue);
    }
  };

  return (
    <div
      className={clsx("vertical-tabs-container", className, {
        "tab-selected": currentIndex !== false,
      })}
    >
      <MuiTabs orientation="vertical" value={currentIndex} onChange={handleChange}>
        {tabs.map((tab, index) => (
          <MuiTab key={index} label={tab.props.label} disableRipple />
        ))}
      </MuiTabs>
      <div ref={tabPanelRef} className="tab-panel-container">
        {tabs.map((tab, index) => {
          if (currentIndex === index) {
            return tab;
          } else {
            return null;
          }
        })}
      </div>
      {otherChildren}
    </div>
  );
}
