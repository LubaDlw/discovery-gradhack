import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const MultiRingProgress = ({
  financeProgress,
  wellnessProgress,
  campusProgress,
  size = 200,
  strokeWidth = 10,
}) => {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const center = size / 2;
    const baseRadius = (size - strokeWidth * 3) / 2;

    const progressData = [
      {
        label: "Finance",
        progress: financeProgress,
        color: "#4856B9",
        radius: baseRadius,
      },
      {
        label: "Wellness",
        progress: wellnessProgress,
        color: "#75517A",
        radius: baseRadius - strokeWidth * 1.5,
      },
      {
        label: "Campus",
        progress: campusProgress,
        color: "#BF5BCD",
        radius: baseRadius - strokeWidth * 3,
      },
    ];

    const group = svg
      .attr("width", size)
      .attr("height", size)
      .append("g")
      .attr("transform", `translate(${center}, ${center})`);

    progressData.forEach(({ progress, color, radius }) => {
      const circumference = 2 * Math.PI * radius;
      const offset = circumference * (1 - progress / 100);

      // Background circle
      group
        .append("circle")
        .attr("r", radius)
        .attr("fill", "none")
        .attr("stroke", "#eee")
        .attr("stroke-width", strokeWidth);

      // Foreground arc
      group
        .append("circle")
        .attr("r", radius)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", circumference)
        .attr("stroke-dashoffset", offset)
        .attr("transform", "rotate(-90)");
    });
  }, [financeProgress, wellnessProgress, campusProgress, size, strokeWidth]);

  return <svg ref={ref} />;
};

export default MultiRingProgress;
