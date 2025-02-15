import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// Set up dimensions
async function radialplot() {
    const width = 1200;
    const height = 1200;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const chartSize = Math.min(width, height) - Math.max(margin.top + margin.bottom, margin.left + margin.right);

    // Create SVG container
    const svg = d3.select("#radial-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/2}, ${height/2})`);

    // List of CSV files to load
    const csvFiles = ["Data/S1/Final/TEMP.csv", "Data/S2/Final/TEMP.csv", "Data/S3/Final/TEMP.csv", "Data/S4/Final/TEMP.csv", "Data/S5/Final/TEMP.csv", "Data/S6/Final/TEMP.csv", "Data/S7/Final/TEMP.csv", "Data/S8/Final/TEMP.csv", "Data/S9/Final/TEMP.csv", "Data/S10/Final/TEMP.csv"];

    // Load and process data from multiple CSV files
    const dataPromises = csvFiles.map(file => d3.text(file).then(text => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const initialTime = parseInt(lines[0]) * 1000; // Convert to milliseconds, <- THIS IS SUPER WRONG
        const sampleRate = parseFloat(lines[1]);
        const temperatures = lines.slice(2).map(parseFloat);

        // Array with time and temperature values
        return temperatures.map((temp, i) => ({
            time: initialTime + (i * 1000) / sampleRate,
            temperature: temp
        }));
    }));

    const allData = await Promise.all(dataPromises);

    // Flatten the data array
    const flatData = allData.flat();

    // Set up scales
    const angleScale = d3.scaleLinear()
        .domain([flatData[0].time, flatData[flatData.length - 1].time])
        .range([0, 2 * Math.PI]);

    const radiusScale = d3.scaleLinear()
        .domain([d3.min(flatData, d => d.temperature), d3.max(flatData, d => d.temperature)])
        .range([30, chartSize/2]);

    // Create radial line generator
    const line = d3.lineRadial()
        .angle(d => angleScale(d.time))
        .radius(d => radiusScale(d.temperature))
        .curve(d3.curveLinear);

    // Define a color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Draw temperature grid circles
    const tempTicks = radiusScale.ticks(4);
    svg.selectAll(".grid-circle")
        .data(tempTicks)
        .enter().append("circle")
        .attr("class", "grid-circle")
        .attr("r", d => radiusScale(d))
        .attr("stroke", "#eee");

    // Add temperature labels
    svg.selectAll(".temp-label")
        .data(tempTicks)
        .enter().append("text")
        .attr("class", "temp-label")
        .attr("x", d => radiusScale(d) + 5)
        .attr("y", 0)
        .text(d => `${d}°C`);

    // Draw main paths for each dataset with different colors
    allData.forEach((data, i) => {
        svg.append("path")
            .datum(data)
            .attr("d", line)
            .attr("fill", "none")
            .attr("stroke", colorScale(i))
            .attr("stroke-width", 2);
    });

    // Add time labels
    const timeTicks = flatData.filter(d => {
        const date = new Date(d.time);
        const hours = date.getUTCHours();
        return hours >= 9 && hours <= 13;
    });

    svg.selectAll(".time-label")
        .data(timeTicks)
        .enter().append("text")
        .attr("class", "time-label")
        .attr("text-anchor", d => {
            const angle = angleScale(d.time);
            return (angle > Math.PI/2 && angle < 3*Math.PI/2) ? "end" : "start";
        })
        .attr("x", d => Math.sin(angleScale(d.time)) * (chartSize/2 + 10))
        .attr("y", d => -Math.cos(angleScale(d.time)) * (chartSize/2 + 10))
        .text(d => {
            const date = new Date(d.time);
            const hours = date.getUTCHours();
            const minutes = date.getUTCMinutes();
            return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
        });
}

radialplot();