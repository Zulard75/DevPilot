import { createTwoFilesPatch } from "diff";

export const generateDiff = ({ path, oldContent, newContent }) => {
  return createTwoFilesPatch(
    `a/${path}`,
    `b/${path}`,
    oldContent || "",
    newContent || "",
    "",
    ""
  );
};