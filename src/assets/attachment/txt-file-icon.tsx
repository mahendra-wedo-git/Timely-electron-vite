import React from "react";
// image
import TxtFileIcon from "../icons/attachment/txt-icon.png";
import { ImageIconPros } from "../types";
import { Image } from "react-bootstrap";
// type

export const TxtIcon: React.FC<ImageIconPros> = ({ width, height }) => (
  <Image src={TxtFileIcon} height={height} width={width} alt="TxtFileIcon" />
);
