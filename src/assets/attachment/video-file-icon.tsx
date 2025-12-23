import React from "react";
// image
// import VideoFileIcon from "@/public/attachment/video-icon.png";
import VideoFileIcon from "../icons/attachment/video-icon.png";
import { ImageIconPros } from "../types";
import { Image } from "react-bootstrap";
// type

export const VideoIcon: React.FC<ImageIconPros> = ({ width, height }) => (
  <Image src={VideoFileIcon} height={height} width={width} alt="VideoFileIcon" />
);
