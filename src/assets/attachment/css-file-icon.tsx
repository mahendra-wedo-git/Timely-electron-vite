import React from "react";
import { Image } from "react-bootstrap";
// image
import CssFileIcon from "../icons/attachment/css-icon.png";
// import CssFileIcon from "@/public/attachment/css-icon.png";
import { ImageIconPros } from "../types";
// type

export const CssIcon: React.FC<ImageIconPros> = ({ width, height }) => (
  <Image src={CssFileIcon} height={height} width={width} alt="CssFileIcon" />
);
