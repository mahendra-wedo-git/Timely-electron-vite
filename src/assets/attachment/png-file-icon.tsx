import React from "react";
// image
import PngFileIcon from "../icons/attachment/png-icon.png";
import { ImageIconPros } from "../types";
import { Image } from "react-bootstrap";
// type

export const PngIcon: React.FC<ImageIconPros> = ({ width, height }) => (
  <Image src={PngFileIcon} height={height} width={width} alt="PngFileIcon" />
);
