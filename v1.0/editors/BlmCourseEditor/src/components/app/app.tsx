import React from "react";
import { Provider } from "react-redux";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";
import "rc-tree/assets/index.css";

import BlmCourseEditor from "components/main/course-editor";
import store from "redux/store";
import "./app.scss";

function App() {
  const theme = createMuiTheme({
    props: {
      // Name of the component
      MuiCheckbox: {
        color: "default",
        disableRipple: true, // No more ripple, on the whole application!
        icon: <div className="checkbox-icon" />,
        checkedIcon: <div className="checkbox-checked-icon" />,
      },
      MuiRadio: {
        color: "default",
        disableRipple: true,
        icon: <div className="radio-icon" />,
        checkedIcon: <div className="radio-checked-icon" />,
      },
      MuiSelect: {
        disableUnderline: true,
        MenuProps: {
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "left",
          },
          transformOrigin: {
            vertical: "top",
            horizontal: "left",
          },
          getContentAnchorEl: null,
        },
        IconComponent: (props: any) => <div {...props} />,
      },
      MuiMenuItem: {
        //@ts-ignore
        disableRipple: true,
      },
      MuiSwitch: {
        color: "default",
        disableRipple: true,
      },
    },
    overrides: {
      MuiTypography: {
        body1: {
          fontFamily: "BlmRoboto",
        },
      },
      MuiCheckbox: {
        root: {
          padding: 0,
          color: "red",
          "&$checked": {
            color: "green",
          },
          "&$disabled": {
            opacity: 0.5,
          },
        },
      },
      MuiRadio: {
        root: {
          padding: 0,
          "&:hover": {
            backgroundColor: "transparent",
          },
          "&$disabled": {
            opacity: 0.5,
          },
        },
      },
      MuiSelect: {
        root: {
          fontFamily: "BlmRoboto",
          fontSize: "14px",
          fontWeight: "bold",
          color: "#3a3e42",
        },
        select: {
          border: "1px solid #dadada",
          borderRadius: "5px",
          padding: "5px 0 6px 15px",
          "&:focus": {
            backgroundColor: "none",
            borderRadius: "5px",
          },
        },
        icon: {
          width: "1em",
          height: "1em",
          display: "inline-block",
          fontSize: "1.5rem",
          transition: "fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
          flexShrink: 0,
          "-mozUserSelect": "none",
        },
      },
      MuiMenuItem: {
        root: {
          "&$selected, &$selected:hover": {
            backgroundColor: "#507de2",
          },
          "&:hover": {
            backgroundColor: "#d9e3fb",
          },
        },
      },
      MuiSwitch: {
        root: {
          width: 25,
          height: 14,
          padding: 0,
          display: "flex",
        },
        switchBase: {
          padding: 2,
          color: "#bcbfc3",
          "&$checked": {
            transform: "translateX(11px)",
            color: "#ffffff",
            "& + $track": {
              opacity: 1,
              backgroundColor: "#3b7ddb",
              borderColor: "#3b7ddb",
            },
            "&$disabled + $track": {
              opacity: 1,
              backgroundColor: "#bcbfc3",
              borderColor: "#bcbfc3",
            },
            "&$disabled $thumb": {
              backgroundColor: "#ffffff",
            },
          },
          "&$disabled + $track": {
            opacity: 1,
            backgroundColor: "#bcbfc3",
            borderColor: "#bcbfc3",
          },
          "&$disabled $thumb": {
            backgroundColor: "#ffffff",
          },
          "&:hover": {
            backgroundColor: "transparent",
          },
        },
        thumb: {
          width: 10,
          height: 10,
          boxShadow: "none",
        },
        track: {
          boxSizing: "border-box",
          border: "1px solid #bcbfc3",
          borderRadius: 14 / 2,
          opacity: 1,
          backgroundColor: "#ffffff",
        },
      },
      MuiTab: {
        root: {
          fontFamily: "BlmRoboto",
        },
      },
    },
  });

  return (
    <MuiThemeProvider theme={theme}>
      <Provider store={store}>
        <div className="app">
          <BlmCourseEditor />
        </div>
      </Provider>
    </MuiThemeProvider>
  );
}

export default App;
