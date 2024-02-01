import React, { CSSProperties, MouseEvent } from "react";
import reactCSS from "reactcss";
import { ColorState } from "react-color";
import UnfoldMoreHorizontalIcon from "@material-ui/icons/UnfoldMore";
//@ts-ignore
import * as color from "react-color/lib/helpers";
import isUndefined from "lodash/isUndefined";
import { EditableInput } from "react-color/lib/components/common";
import { EditableInputStyles } from "react-color/lib/components/common/EditableInput";

interface CompProps extends Pick<ColorState, "rgb" | "hsl" | "hex"> {
  view?: "hex" | "rgb" | "hsl";
  onChange: any;
}

interface CompState {
  view: "hex" | "rgb" | "hsl";
}

export class BlmCustomFields extends React.Component<CompProps, CompState> {
  constructor(props: CompProps) {
    super(props);

    if (props.hsl.a !== 1 && props.view === "hex") {
      this.state = {
        view: "rgb",
      };
    } else {
      this.state = {
        view: props.view || "hex",
      };
    }
  }

  static getDerivedStateFromProps(nextProps: CompProps, state: CompState) {
    if (nextProps.hsl.a !== 1 && state.view === "hex") {
      return { view: "rgb" };
    }
    return null;
  }

  toggleViews = () => {
    if (this.state.view === "hex") {
      this.setState({ view: "rgb" });
    } else if (this.state.view === "rgb") {
      this.setState({ view: "hsl" });
    } else if (this.state.view === "hsl") {
      if (this.props.hsl.a === 1) {
        this.setState({ view: "hex" });
      } else {
        this.setState({ view: "rgb" });
      }
    }
  };

  handleChange = (data: any, e?: any) => {
    if (data.hex) {
      color.isValidHex(data.hex) &&
        this.props.onChange(
          {
            hex: data.hex,
            source: "hex",
          },
          e
        );
    } else if (data.r || data.g || data.b) {
      this.props.onChange(
        {
          r: data.r || this.props.rgb.r,
          g: data.g || this.props.rgb.g,
          b: data.b || this.props.rgb.b,
          source: "rgb",
        },
        e
      );
    } else if (data.a) {
      if (data.a < 0) {
        data.a = 0;
      } else if (data.a > 1) {
        data.a = 1;
      }

      this.props.onChange(
        {
          h: this.props.hsl.h,
          s: this.props.hsl.s,
          l: this.props.hsl.l,
          a: Math.round(data.a * 100) / 100,
          source: "rgb",
        },
        e
      );
    } else if (data.h || data.s || data.l) {
      // Remove any occurances of '%'.
      if (typeof data.s === "string" && data.s.includes("%")) {
        data.s = data.s.replace("%", "");
      }
      if (typeof data.l === "string" && data.l.includes("%")) {
        data.l = data.l.replace("%", "");
      }

      // We store HSL as a unit interval so we need to override the 1 input to 0.01
      if (data.s === 1) {
        data.s = 0.01;
      } else if (data.l === 1) {
        data.l = 0.01;
      }

      this.props.onChange(
        {
          h: data.h || this.props.hsl.h,
          s: Number(!isUndefined(data.s) ? data.s : this.props.hsl.s),
          l: Number(!isUndefined(data.l) ? data.l : this.props.hsl.l),
          source: "hsl",
        },
        e
      );
    }
  };

  showHighlight = (e: MouseEvent<HTMLElement>) => {
    e.currentTarget.style.background = "#eee";
  };

  hideHighlight = (e: MouseEvent<HTMLElement>) => {
    e.currentTarget.style.background = "transparent";
  };

  render() {
    const styles = reactCSS(
      {
        default: {
          wrap: {
            paddingTop: "16px",
            display: "flex",
          },
          fields: {
            flex: "1",
            display: "flex",
            marginLeft: "-6px",
          },
          field: {
            paddingLeft: "6px",
            width: "100%",
          },
          toggle: {
            width: "32px",
            textAlign: "right",
            position: "relative",
          },
          icon: {
            marginRight: "-4px",
            marginTop: "12px",
            cursor: "pointer",
            position: "relative",
          },
          iconHighlight: {
            position: "absolute",
            width: "24px",
            height: "28px",
            background: "#eee",
            borderRadius: "4px",
            top: "10px",
            left: "12px",
            display: "none",
          },
          input: {
            fontSize: "11px",
            color: "#333",
            width: "100%",
            borderRadius: "2px",
            border: "none",
            boxShadow: "inset 0 0 0 1px #dadada",
            height: "21px",
            textAlign: "center",
          },
          label: {
            textTransform: "uppercase",
            fontSize: "11px",
            lineHeight: "11px",
            color: "#969696",
            textAlign: "center",
            display: "block",
            marginTop: "12px",
          },
          svg: {
            fill: "#333",
            width: "24px",
            height: "24px",
            border: "1px transparent solid",
            borderRadius: "5px",
          },
        },
      },
      this.props,
      this.state
    );

    let fields;
    if (this.state.view === "hex") {
      fields = (
        <div style={styles.fields} className="flexbox-fix">
          <div style={styles.field}>
            <EditableInput
              style={{ input: styles.input, label: styles.label } as EditableInputStyles}
              label="hex"
              value={this.props.hex}
              onChange={this.handleChange}
            />
          </div>
        </div>
      );
    } else if (this.state.view === "rgb") {
      fields = (
        <div style={styles.fields} className="flexbox-fix">
          <div style={styles.field}>
            <EditableInput
              style={{ input: styles.input, label: styles.label } as EditableInputStyles}
              label="r"
              value={this.props.rgb.r}
              onChange={this.handleChange}
            />
          </div>
          <div style={styles.field}>
            <EditableInput
              style={{ input: styles.input, label: styles.label } as EditableInputStyles}
              label="g"
              value={this.props.rgb.g}
              onChange={this.handleChange}
            />
          </div>
          <div style={styles.field}>
            <EditableInput
              style={{ input: styles.input, label: styles.label } as EditableInputStyles}
              label="b"
              value={this.props.rgb.b}
              onChange={this.handleChange}
            />
          </div>
        </div>
      );
    } else if (this.state.view === "hsl") {
      fields = (
        <div style={styles.fields} className="flexbox-fix">
          <div style={styles.field}>
            <EditableInput
              style={{ input: styles.input, label: styles.label } as EditableInputStyles}
              label="h"
              value={Math.round(this.props.hsl.h)}
              onChange={this.handleChange}
            />
          </div>
          <div style={styles.field}>
            <EditableInput
              style={{ input: styles.input, label: styles.label } as EditableInputStyles}
              label="s"
              value={`${Math.round(this.props.hsl.s * 100)}%`}
              onChange={this.handleChange}
            />
          </div>
          <div style={styles.field}>
            <EditableInput
              style={{ input: styles.input, label: styles.label } as EditableInputStyles}
              label="l"
              value={`${Math.round(this.props.hsl.l * 100)}%`}
              onChange={this.handleChange}
            />
          </div>
        </div>
      );
    }

    return (
      <div style={styles.wrap} className="flexbox-fix">
        {fields}
        <div style={styles.toggle as CSSProperties}>
          <div style={styles.icon as CSSProperties} onClick={this.toggleViews}>
            {/* @ts-ignore */}
            <UnfoldMoreHorizontalIcon
              style={styles.svg}
              onMouseOver={this.showHighlight}
              onMouseEnter={this.showHighlight}
              onMouseOut={this.hideHighlight}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default BlmCustomFields;
