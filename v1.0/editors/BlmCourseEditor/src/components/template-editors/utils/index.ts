import { getIFrameClientRect } from "utils";

export function createModifiersForIFrame(xOff: number, yOff: number) {
  return {
    offset: {
      enabled: true,
      fn: (data: any) => {
        //BILIM-276: [react] option popup move when scroll and edit
        const {
          placement,
          instance: { reference },
          offsets: { popper },
        } = data;
        const basePlacement = placement.split("-")[0];
        const { x, y } = getIFrameClientRect(reference);
        const offsets = [x + xOff, y + yOff];

        if (basePlacement === "left") {
          popper.top += offsets[0];
          popper.left -= offsets[1];
        } else if (basePlacement === "right") {
          popper.top += offsets[0];
          popper.left += offsets[1];
        } else if (basePlacement === "top") {
          popper.left += offsets[0];
          popper.top -= offsets[1];
        } else if (basePlacement === "bottom") {
          popper.left += offsets[0];
          popper.top += offsets[1];
        }

        data.popper = popper;
        return data;
      },
    },
    flip: {
      enabled: false,
    },
    keepTogether: {
      enabled: false,
    },
    arrow: {
      enabled: false,
    },
    preventOverflow: {
      enabled: false,
    },
    hide: {
      enabled: false,
    },
    computeStyle: {
      gpuAcceleration: false,
    },
  };
}
