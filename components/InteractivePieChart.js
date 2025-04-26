import React, { useState } from "react";
import { View } from "react-native";
import { VictoryPie } from "victory-native";

const InteractivePieChart = ({ data }) => {
  const [selectedSlice, setSelectedSlice] = useState(null);

  const total = data.reduce((sum, item) => sum + item.count, 0);

  const chartData = data.map((item, index) => ({
    x: item.name,
    y: item.count,
    label: selectedSlice === index
      ? `${item.name}\n${((item.count / total) * 100).toFixed(1)}%`
      : "",
    color: item.color || "#ccc",
  }));

  return (
    <View>
      <VictoryPie
        data={chartData}
        colorScale={data.map((item) => item.color)}
        radius={({ index }) => (selectedSlice === index ? 130 : 120)}
        innerRadius={50}
        labelRadius={140}
        labels={({ datum }) => datum.label}
        style={{
          labels: {
            fontSize: 14,
            fill: "#333",
            fontWeight: "bold",
            textAlign: "center",
          },
        }}
        events={[
          {
            target: "data",
            eventHandlers: {
              onPressIn: (_, props) => {
                setSelectedSlice(props.index === selectedSlice ? null : props.index);
              },
            },
          },
        ]}
        width={360}
        height={320}
      />
    </View>
  );
};

export default InteractivePieChart;
