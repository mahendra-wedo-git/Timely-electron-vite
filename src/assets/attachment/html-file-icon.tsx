import React from "react";
// image
import HtmlFileIcon from "../icons/attachment/html-icon.png";
import { ImageIconPros } from "../types";
import { Image } from "react-bootstrap";
// import HtmlFileIcon from "@/public/attachment/html-icon.png";
// type


export const HtmlIcon: React.FC<ImageIconPros> = ({ width, height }) => (
  <Image src={HtmlFileIcon} height={height} width={width} alt="HtmlFileIcon" />
);
