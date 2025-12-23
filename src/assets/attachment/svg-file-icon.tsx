import React from "react";
// image
import SvgFileIcon from "../icons/attachment/svg-icon.png";
import { Image } from "react-bootstrap";
import { ImageIconPros } from "../types";
// type

export const SvgIcon: React.FC<ImageIconPros> = ({ width, height }) => (
  <Image src={SvgFileIcon} height={height} width={width} alt="SvgFileIcon" />
);
