import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const BubbleChart = ({ data }) => {
  const ref = useRef();
  const width = 500;
  const height = 500;

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    let mousePos = { x: null, y: null };

    const pack = d3.pack()
      .size([width, height])
      .padding(5);

    const root = d3.hierarchy({ children: data }).sum(d => Math.pow(d.value, 0.5));
    const nodes = pack(root).leaves();

    nodes.forEach(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.name))
      .range(["#D0B4BD", "#9A7196", "#77547F", "#2F2649", "#907181"]);

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background-color", "#32436F")
      .append("g")
      .attr("transform", "translate(50, -20)");

    const defs = svg.append("defs");

        defs.append("filter")
        .attr("id", "drop-shadow")
        .attr("height", "130%")
        .append("feDropShadow")
        .attr("dx", "2")
        .attr("dy", "2")
        .attr("stdDeviation", "3")
        .attr("flood-color", "#000")
        .attr("flood-opacity", "0.3");

    const node = g.selectAll("g")
      .data(nodes)
      .join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("circle")
      .attr("r", d => d.r)
      .attr("fill", (d, i) => color(i))
      .attr("fill-opacity", 0.9)
      .style("filter", "url(#drop-shadow)");

    node.append("text")
      .text(d => d.data.name)
      .attr("text-anchor", "middle")
      .attr("dy", d => d.r > 25 ? "-0.3em" : "0") 
      .style("font-size", d => `${Math.min(d.r / 3, 14)}px`)
      .style("fill", "#f0f0f0")
      .style("font-family", "Discovery-Font")
      .style("pointer-events", "none");

    node.append("text")
      .text(d => d.data.value)
      .attr("text-anchor", "middle")
      .attr("dy", d => d.r > 25 ? "1em" : "0.4em") 
      .style("font-size", d => `${Math.min(d.r / 3, 12)}px`)
      .style("fill", "#f0f0f0")
      .style("font-family", "Discovery-Font")
      .style("pointer-events", "none");

    const springForce = (mx, my) => {
      nodes.forEach(d => {
        const dx0 = d.x0 - d.x;
        const dy0 = d.y0 - d.y;
        d.vx += dx0 * 0.08;
        d.vy += dy0 * 0.08;

        if (mx !== null && my !== null) {
          const dx = d.x - mx;
          const dy = d.y - my;
          const distSq = dx * dx + dy * dy;

          if (distSq < 10000) {
            const force = 2 / Math.sqrt(distSq);
            d.vx += dx * force;
            d.vy += dy * force;
          }
        }
      });
    };

    const simulation = d3.forceSimulation(nodes)
      .force("collide", d3.forceCollide().radius(d => d.r + 1).strength(0.9))
      .alphaDecay(0.08)
      .on("tick", () => {
        springForce(mousePos.x, mousePos.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
      });

    svg.on("mousemove", (event) => {
      const [mx, my] = d3.pointer(event);
      mousePos = { x: mx, y: my };
      simulation.alpha(0.4).restart();
    });

    svg.on("mouseleave", () => {
      mousePos = { x: null, y: null };
      simulation.alpha(0.2).restart();
    });
  }, [data]);

  return <svg ref={ref} style={{ width: "100%", height: height }} />;
};

export default BubbleChart;
