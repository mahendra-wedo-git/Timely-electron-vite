import React from "react";
// image
import CSVFileIcon from "../icons/attachment/csv-icon.png";
// import CSVFileIcon from "@/public/attachment/csv-icon.png";
import { ImageIconPros } from "../types";
import { Image } from "react-bootstrap";
// type

export const CsvIcon: React.FC<ImageIconPros> = ({ width, height }) => (
  <Image src={CSVFileIcon} height={height} width={width} alt="CSVFileIcon" />
);
