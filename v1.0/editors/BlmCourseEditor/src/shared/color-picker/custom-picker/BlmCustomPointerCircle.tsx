import React from "react";

function BlmCustomPointerCircle() {
  const styles = {
    picker: {
      width: "12px",
      height: "12px",
      borderRadius: "6px",
      boxShadow: "inset 0 0 0 1px #fff",
      transform: "translate(-6px, -6px)",
    },
  };

  return <div style={styles.picker} />;
}

export default BlmCustomPointerCircle;
