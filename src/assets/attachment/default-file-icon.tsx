import React from "react";
// image
import DefaultFileIcon from "../icons/attachment/default-icon.png";
// import DefaultFileIcon from "@/public/attachment/default-icon.png";
import { ImageIconPros } from "../types";
import { Image } from "react-bootstrap";
// type

export const DefaultIcon: React.FC<ImageIconPros> = ({ width, height }) => (
  <Image src={DefaultFileIcon} height={height} width={width} alt="DefaultFileIcon" />
);
