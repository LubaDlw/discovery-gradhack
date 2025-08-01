import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const DonutProgress = ({ progress, size = 80, strokeWidth = 8, color = "#4caf50" }) => {
  const ref = useRef();

  useEffect(() => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference - (progress / 100) * circumference;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); 

    svg
      .attr("width", size)
      .attr("height", size)
      .append("g")
      .attr("transform", `translate(${size / 2}, ${size / 2})`);

    const group = svg.select("g");

    group
      .append("circle")
      .attr("r", radius)
      .attr("fill", "none")
      .attr("stroke", "#ddd")
      .attr("stroke-width", strokeWidth);

    group
      .append("circle")
      .attr("r", radius)
      .attr("fill", "none")
      .attr("stroke", color) 
      .attr("stroke-width", strokeWidth)
      .attr("stroke-linecap", "round")
      .attr("transform", "rotate(-90)")
      .attr("stroke-dasharray", circumference)
      .attr("stroke-dashoffset", progressOffset);
  }, [progress, size, strokeWidth]);

  return <svg ref={ref} />;
};

export default DonutProgress;
