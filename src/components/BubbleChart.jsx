// src/components/BubbleChart.jsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const BubbleChart = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // Clear previous render

    const width = 400;
    const height = 400;

    const pack = d3.pack()
      .size([width, height])
      .padding(10);

    const root = d3.hierarchy({ children: data })
      .sum(d => d.value);

    const nodes = pack(root).leaves();

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const node = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", "translate(0,0)")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("circle")
      .attr("r", d => d.r)
      .attr("fill", (d, i) => color(i));

    node.append("text")
      .attr("dy", "0.3em")
      .attr("text-anchor", "middle")
      .style("fill", "white")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .text(d => d.data.name);

  }, [data]);

  return <svg ref={ref} style={{ width: "100%", height: 400 }} />;
};

export default BubbleChart;
