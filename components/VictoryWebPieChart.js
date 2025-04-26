import React, { useState } from "react";
import { VictoryPie } from "victory";

const VictoryWebPieChart = ({ data }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const chartData = data.map((item, index) => ({
    x: item.name,
    y: item.count,
    label:
      selectedIndex === index
        ? `${item.name}\n${((item.count / total) * 100).toFixed(1)}%`
        : item.name,
    fill: item.color,
  }));

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 10,
        overflow: "visible",
      }}
    >
      <VictoryPie
        data={chartData}
        colorScale={data.map((d) => d.color)}
        innerRadius={40}
        radius={({ index }) => (selectedIndex === index ? 120 : 115)}
        labelRadius={135}
        width={360}
        height={360}
        style={{
          labels: {
            fill: "#333",
            fontSize: 18,
            fontWeight: "bold",
            pointerEvents: "none",
            textAnchor: "middle",
          },
        }}
        events={[
          {
            target: "data",
            eventHandlers: {
              onClick: (_, props) => {
                setSelectedIndex(props.index === selectedIndex ? null : props.index);
              },
            },
          },
        ]}
      />
    </div>
  );
};

export default VictoryWebPieChart;
