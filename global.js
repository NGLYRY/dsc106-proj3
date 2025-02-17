import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

async function radial_plot() {
    const width = 800, height = 800, margin = 60;
    // The file names, change if you need to for your file configs
    const files = ["Data/S1/Final/HR.csv", "Data/S2/Final/HR.csv", "Data/S3/Final/HR.csv", "Data/S4/Final/HR.csv", "Data/S5/Final/HR.csv", "Data/S6/Final/HR.csv", "Data/S7/Final/HR.csv", "Data/S8/Final/HR.csv", "Data/S9/Final/HR.csv", "Data/S10/Final/HR.csv"]; // Add your filenames here

    // Create SVG container
    const svg = d3.select(".container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Load and process multiple files
    Promise.all(files.map(file => d3.text(file)))
        .then(rawDataArray => {
            // Parses all files
            const datasets = rawDataArray.map(rawData => {
                const lines = rawData.split('\n');
                return {
                    initialTime: parseInt(lines[0]),
                    sampleRate: parseFloat(lines[1]),
                    hrValues: lines.slice(2, 20002).map(parseFloat)
                };
            });

            // Verify consistent sampling parameters
            const first = datasets[0];
            if (!datasets.every(d => 
                d.initialTime === first.initialTime && 
                d.sampleRate === first.sampleRate)) {
                throw new Error("Different start times or sample rates");
            }

            // Calculate row means 
            const minLength = Math.min(...datasets.map(d => d.hrValues.length));
            const aggregatedData = Array.from({length: minLength}, (_, i) => {
                const sum = datasets.reduce((acc, d) => acc + d.hrValues[i], 0);
                const value = sum / datasets.length;
                return {
                    value: value,
                    angle: (i / minLength) * 2 * Math.PI
                };
            });

            // Calculate the mean of aggregatedData values
            const meanValue = d3.mean(aggregatedData, d => d.value);
            console.log("Mean value of aggregatedData:", meanValue);

            // Replace NaN values with the mean value
            aggregatedData.forEach(d => {
                if (isNaN(d.value)) {
                    d.value = meanValue;
                }
            });

            // Create scales
            const radiusScale = d3.scaleLinear()
                .domain([d3.min(aggregatedData, d => d.value), 
                        d3.max(aggregatedData, d => d.value)])
                .range([width/4, width/2 - margin]);

            // Radial line generator
            const lineGenerator = d3.lineRadial()
                .angle(d => d.angle)
                .radius(d => radiusScale(d.value));

            // Draw aggregated line
            svg.append("path")
                .datum(aggregatedData)
                .attr("d", lineGenerator)
                .attr("fill", "none")
                .attr("stroke", "#e41a1c")
                .attr("stroke-width", 2)
                .attr("transform", `translate(${width/2},${height/2})`);

            // Add circular axes
            const axisCircles = [d3.min(radiusScale.domain()), 
                               d3.mean(radiusScale.domain()), 
                               d3.max(radiusScale.domain())];

            const axis = svg.append("g")
                .attr("transform", `translate(${width/2},${height/2})`);

            axis.selectAll("circle")
                .data(axisCircles)
                .enter().append("circle")
                .attr("r", d => radiusScale(d))
                .attr("fill", "none")
                .attr("stroke", "#ccc");

            axis.selectAll(".axis-label")
                .data(axisCircles)
                .enter().append("text")
                .attr("text-anchor", "middle")
                .attr("y", d => -radiusScale(d))
                .text(d => `${d} BPM`);
                

            const timeScale = d3.scaleTime()
                .domain([
                    new Date(first.initialTime * 1000),
                    new Date((first.initialTime + 
                            (minLength / first.sampleRate)) * 1000)
                ])
                .range([0, 2 * Math.PI]);

            const timeAxis = d3.axisLeft()
                .scale(timeScale)
                .ticks(12)
                .tickFormat(d3.timeFormat("%H:%M:%S"));

            svg.append("g")
                .attr("transform", `translate(${width/2},${height/2})`)
                .call(timeAxis)
                .selectAll("text")
                .attr("transform", d => `rotate(${93 - timeScale(d) * 180/Math.PI})`)
                .attr("x", 375)
                .style("text-anchor", "middle");
            // NOTE: the axes for the circles are based on min, mean, and max of aggregatedData
            // Might want to change that to something else
            // THE TIMES LABELS ARE PROBABLY NOT CORRECT, but it's as close as I think I can get
            // idk how to flip the time labels
            // the data has times before the final might need to take those out or take them into account.
        });
};

radial_plot();

function updateHeartbeat(bpm) {
    const duration = 10 / bpm; // Convert BPM to seconds
    document.documentElement.style.setProperty('--beat-duration', `${duration}s`);
}

updateHeartbeat(10);
