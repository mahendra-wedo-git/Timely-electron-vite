import React from "react";
// image
import ImgFileIcon from "../icons/attachment/img-icon.png";
import { ImageIconPros } from "../types";
import { Image } from "react-bootstrap";
// type

export const ImgIcon: React.FC<ImageIconPros> = ({ width, height }) => (
  <Image src={ImgFileIcon} height={height} width={width} alt="ImgFileIcon" />
);
