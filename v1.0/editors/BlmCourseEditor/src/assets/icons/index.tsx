import React from "react";

import DropdownArrowIcon from "../images/forms/dropdown-arrow-1.png";

export const RepoExpandIcon = createIcon(require("../images/expand-6-open.png"));
export const RepoOptionsIcon = createIcon(require("../images/tree/context-btn.png"));

export const DropdownImg1 = createIcon(require("../images/forms/dropdown-arrow-1.png"));
export const DropdownImg2 = createIcon(require("../images/text-editor/dropdown-arrow.png"));
export const ConnectionCtxItemIcon = createIcon(require("../images/tree/connection-item-icon.png"));
export const MoveToOpenIcon = createIcon(require("../images/expand-4-close.png"));
export const MoveToCloseIcon = createIcon(require("../images/expand-4-open.png"));
export const ExpandImage = createIcon(require("../images/expand-2-open.png"));
export const ExpandImage2 = createIcon(require("assets/images/expand-2-close-over.png"));

export const StandardOptionIcon = createIcon(require("../images/media/standard.png"));
export const ParallaxOptionIcon = createIcon(require("../images/media/parallax.png"));
export const MaskOptionIcon = createIcon(require("../images/media/mask.png"));
export const CoverOptionIcon = createIcon(require("../images/media/cover.png"));
export const ContainOptionIcon = createIcon(require("../images/media/contain.png"));
export const NoResizeOptionIcon = createIcon(require("../images/media/no-resize.png"));

export const LeftAlignIcon = createIcon(require("../images/text-editor/left-align.png"));
export const CenterAlignIcon = createIcon(require("../images/text-editor/center-align.png"));
export const RightAlignIcon = createIcon(require("../images/text-editor/right-align.png"));
export const JustifyAlignIcon = createIcon(require("../images/text-editor/justify-align.png"));

export const NumListIcon = createIcon(require("../images/text-editor/num-list.png"));
export const BulletListIcon = createIcon(require("../images/text-editor/bullet-list.png"));

export const SquareIcon = createIcon(require("../images/content-media/format/square.png"));
export const RoundIcon = createIcon(require("../images/content-media/format/round.png"));
export const LargeIcon = createIcon(require("../images/content-media/format/large.png"));
export const WideIcon = createIcon(require("../images/content-media/format/wide.png"));
export const ExtraWideIcon = createIcon(require("../images/content-media/format/extra-wide.png"));
export const FixedHeightIcon = createIcon(
  require("../images/content-media/format/fixed-height.png")
);
export const RelativeHeightIcon = createIcon(
  require("../images/content-media/format/relative-height.png")
);
export const FixedWidthIcon = createIcon(require("../images/content-media/format/fixed-width.png"));
export const FixedSizeIcon = createIcon(require("../images/content-media/format/fixed-size.png"));
export const HighIcon = createIcon(require("../images/content-media/format/high.png"));
export const ExtraHighIcon = createIcon(require("../images/content-media/format/extra-high.png"));
export const FullHeightIcon = createIcon(require("../images/content-media/format/full-height.png"));
export const AutoIcon = createIcon(require("../images/content-media/format/auto.png"));

export const ExpandOpen = createIcon(require("../images/tree/expand-open.png"));
export const ExpandClose = createIcon(require("../images/tree/expand-close.png"));

function createIcon(icon: string, name = "") {
  const Component = () => {
    return <img src={icon} alt={name} />;
  };

  return Component;
}

export const DropdownImg = <img src={DropdownArrowIcon} alt="Dropdown" />;
