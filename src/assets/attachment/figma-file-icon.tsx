import React from "react";
// image
import FigmaFileIcon from "../icons/attachment/figma-icon.png";
import { ImageIconPros } from "../types";
import { Image } from "react-bootstrap";
// type

export const FigmaIcon: React.FC<ImageIconPros> = ({ width, height }) => (
  <Image src={FigmaFileIcon} height={height} width={width} alt="FigmaFileIcon" />
);
