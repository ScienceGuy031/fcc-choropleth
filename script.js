const countyUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const eduUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

let width = document.getElementById("root").scrollWidth * 0.9;
let height = window.innerHeight * 0.7;

// General Document Structure
const root = d3.select("#root");
root.style("height", "100vh");
const header = root.append("div").attr("id", "header");
const title = header
  .append("h1")
  .text("FreeCodeCamp Choropleth Map")
  .attr("id", "title");
const description = header
  .append("h2")
  .text("US Educational Attainment")
  .attr("id", "description");

const graph = root.append("div").attr("id", "graph");
const svg = graph
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", "0 0 960 600")
  .attr("id", "choropleth");

const path = d3.geoPath();

//Panning and Zooming
const g = svg.append('g');
svg.call(d3.zoom().on('zoom', (e) => {
  g.attr('transform', e.transform);
}));

// Tooltip
const tip = d3.tip().attr("class", "d3-tip").attr("id", "tooltip");
svg.call(tip);

// API call(s)
d3.json(countyUrl).then((countyData) => {
  const counties = topojson.feature(countyData, countyData.objects.counties);

  d3.json(eduUrl).then((eduData) => {
    g
      .selectAll("path")
      .data(counties.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "county")
      .attr("data-fips", (d) => d.id)
      .attr("data-education", (d) => {
        const result = eduData.filter((county) => county.fips === d.id);
        if (result[0]) {
          return result[0].bachelorsOrHigher;
        }
        return -1;
      })
      .attr("fill", (d) => {
        const result = eduData.filter((county) => county.fips === d.id);
        if (result[0]) {
          return getColor(result[0].bachelorsOrHigher);
        }
        return "red";
      })
      .on("mouseover", (e, d) => {
        let html = "";
        const edu = e.target.attributes[3].value;
        const result = eduData.filter((county) => county.fips === d.id);
        if (result[0]) {
          const name = result[0].area_name;
          const state = result[0].state;
          html += `${name}, ${state}<br>${edu}%`;

          tip.attr("data-education", edu);
          tip.html(html);
          tip.show(e);
        }
      })
      .on("mouseout", tip.hide);
  });
});

// Legend
graph.append("br");
const legend = graph.append("svg");
legend.attr("width", 650);
legend.attr("height", 150);
legend.attr("id", "legend");

const legendScale = d3.scaleLinear().domain([0, 10]).range([50, 550]);

legendAxis = d3.axisBottom(legendScale);
legendAxis.tickFormat((d) => d * 10 + "%");

legend.append("g").attr("transform", "translate(0,100)").call(legendAxis);

const colors = [];
for (let i = 5; i <= 95; i += 10) {
  colors.push(getColor(i));
}

legend
  .selectAll("rect")
  .data(colors)
  .enter()
  .append("rect")
  .attr("height", 50)
  .attr("width", 50)
  .attr("x", (d, i) => legendScale(i))
  .attr("y", 50)
  .attr("fill", (d) => d);

const legendLabel = legend.select("g").append("text");
legendLabel
  .attr("y", -70)
  .attr("x", legendScale(colors.length / 2))
  .attr("text-anchor", "middle")
  .attr("fill", "white")
  .attr("font-size", ".8rem")
  .text(
    "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)"
  );

function getColor(eduRate) {
  if (eduRate > 90) return "#1864ab";
  if (eduRate > 80) return "#1971c2";
  if (eduRate > 70) return "#1c7ed6";
  if (eduRate > 60) return "#228be6";
  if (eduRate > 50) return "#339af0";
  if (eduRate > 50) return "#4dabf7";
  if (eduRate > 40) return "#74c0fc";
  if (eduRate > 30) return "#a5d8ff";
  if (eduRate > 20) return "#d0ebff";
  if (eduRate >= 10) return "#e7f5ff";
  return "#f03e3e";
}
