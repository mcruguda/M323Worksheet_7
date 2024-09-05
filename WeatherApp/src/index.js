import hh from "hyperscript-helpers";
import { h, diff, patch } from "virtual-dom";
import createElement from "virtual-dom/create-element";

const { div, button, input, table, tr, th, td } = hh(h);


const messages = {
  ADD_LOCATION: "ADD_LOCATION",
  DELETE_LOCATION: "DELETE_LOCATION",
  UPDATE_FORM: "UPDATE_FORM",
};

async function weatherApi(location, dispatch) {
  const baseUrl = "https://api.openweathermap.org/data/2.5/weather";
  const apiKey = "b68fe95f307440b9da18243f6f787869";
  const apiUrl = `${baseUrl}?q=${encodeURI(location)}&units=metric&APPID=${apiKey}`;
  try {
    const response = await fetch(apiUrl);
    const responseBody = await response.json();
    console.log(responseBody);
    const temps = {
      temp: responseBody.main.temp,
      maxTemp: responseBody.main.temp_max,
      minTemp: responseBody.main.temp_min,
    }
    // return temps;
    dispatch(messages.ADD_LOCATION, temps)
  } catch (error) {
    console.error(error.message);
  }
}

function view(dispatch, model) {
  const buttonStyle = "bg-blue-500 px-3 py-1 rounded-md text-white mt-4";

  return div({ className: "flex flex-col gap-4 items-center" }, [
    div({ className: "text-3xl flex-row" }),
    div({ className: "flex flex-row gap-5 items-center" }, [
    input({
      className: "w-full border p-2",
      oninput: (e) => dispatch(messages.UPDATE_FORM, e.target.value),
      value: model.currentWeather.location,
      placeholder: `Enter Location...`,
    }),
    button(
      {
        className: buttonStyle,
        onclick: () => weatherApi(model.currentWeather.location, dispatch),
      },
      "ADD"
    ),
  ]),
    table({ className: "w-full" }, [
      tr([
        th({ className: "text-left font-semibold" }, "Location"),
        th({ className: "text-left font-semibold " }, "Temp"),
        th({ className: "text-left font-semibold " }, "Max"),
        th({ className: "text-left font-semibold " }, "Min"),
        th({ className: "text-left font-semibold" }, ""),
      ]),
      ...model.weatherList.map((weather, index) =>
        tr({ key: index }, [
          td([weather.location]),
          td([weather.temp.toString()]),
          td([weather.high.toString()]),
          td([weather.low.toString()]),
          td([
            button(
              {
                className: "text-red-500",
                onclick: () => dispatch(messages.DELETE_LOCATION, index),
              },
              "🗑"
            ),
          ]),
        ])
      ),
    ]),
  ]);
}

function update(message, model, dispatch, value) {
  switch (message) {
    case messages.UPDATE_FORM:
      return {
        ...model,
        currentWeather: { ...model.currentWeather, location: value },
      };

    case messages.ADD_LOCATION: {
      const newWeather = {...model.currentWeather, temp: value.temp, low: value.minTemp, high: value.maxTemp};
      if (newWeather.location.trim() === "") return model;
      const weatherList = [...model.weatherList, newWeather];
      return {
        ...model,
        weatherList,
        currentWeather: { location: "" },
      };
    }

    case messages.DELETE_LOCATION: {
      const weatherList = model.weatherList.filter((_, index) => index !== value);
      return { ...model, weatherList };
    }

    default:
      return model;
  }
}

function app(initialModel, update, view, node) {
  let model = initialModel;
  let currentView = view(dispatch, model);
  let rootNode = createElement(currentView);
  node.appendChild(rootNode);

  function dispatch(message, value) {
    model = update(message, model, dispatch, value);
    const updatedView = view(dispatch, model);
    const patches = diff(currentView, updatedView);
    rootNode = patch(rootNode, patches);
    currentView = updatedView;
  }
}

const initialModel = {
  weatherList: [],
  currentWeather: { location: "" },
};

const rootNode = document.getElementById("app");
app(initialModel, update, view, rootNode);
