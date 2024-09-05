import hh from "hyperscript-helpers";
import { h, diff, patch } from "virtual-dom";
import createElement from "virtual-dom/create-element";

const { div, button, input, table, tr, th, td } = hh(h);

const messages = {
  ADD_MEAL: "ADD_MEAL",
  DELETE_MEAL: "DELETE_MEAL",
  UPDATE_MEAL_NAME: "UPDATE_MEAL_NAME",
  UPDATE_MEAL_CALORIES: "UPDATE_MEAL_CALORIES",
};

function view(dispatch, model) {
  const buttonStyle = "bg-green-500 px-3 py-1 rounded-md text-white mt-4";

  return div({ className: "flex flex-col gap-4 items-center" }, [
    div({ className: "text-3xl font-bold" }, `Total Calories: ${model.totalCalories || 0}`),
    div({ className: "text-3xl" }, `Meal:`),
    input({
      className: "w-full border p-2",
      oninput: (e) => dispatch(messages.UPDATE_MEAL_NAME, e.target.value),
      value: model.currentMeal.name,
    }),
    
    div({ className: "text-3xl" }, `Calories`),
      input({
        className: "w-full border p-2",
        type: "number",
        oninput: (e) => dispatch(messages.UPDATE_MEAL_CALORIES, e.target.value),
        value: model.currentMeal.calories,
      }),
    button(
      {
        className: buttonStyle,
        onclick: () => dispatch(messages.ADD_MEAL),
      },
      "Save"
    ),
    table({ className: "w-full" }, [
      tr([
        th({ className: "text-left font-semibold" }, "Meal"),
        th({ className: "text-left font-semibold " }, "Calories"),
        th({ className: "text-left font-semibold" }, ""),
      ]),
      ...model.meals.map((meal, index) =>
        tr({ key: index }, [
          td([meal.name]),
          td([meal.calories.toString()]),
          td([
            button(
              {
                className: "text-red-500",
                onclick: () => dispatch(messages.DELETE_MEAL, index),
              },
              "🗑"
            ),
          ]),
        ])
      ),
    ]),
  ]);
}

function update(message, model, value) {
  switch (message) {
    case messages.UPDATE_MEAL_NAME:
      return {
        ...model,
        currentMeal: { ...model.currentMeal, name: value },
      };

    case messages.UPDATE_MEAL_CALORIES:
      return {
        ...model,
        currentMeal: {
          ...model.currentMeal,
          calories: parseInt(value, 10) || 0,
        },
      };

    case messages.ADD_MEAL: {
      const newMeal = model.currentMeal;
      if (newMeal.name.trim() === "") return model;
      const meals = [...model.meals, newMeal];
      const totalCalories = meals.reduce((acc, meal) => acc + meal.calories, 0);
      return {
        ...model,
        meals,
        totalCalories,
        currentMeal: { name: "", calories: 0 },
      };
    }

    case messages.DELETE_MEAL: {
      const meals = model.meals.filter((_, index) => index !== value);
      const totalCalories = meals.reduce((acc, meal) => acc + meal.calories, 0);
      return { ...model, meals, totalCalories };
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
    model = update(message, model, value);
    const updatedView = view(dispatch, model);
    const patches = diff(currentView, updatedView);
    rootNode = patch(rootNode, patches);
    currentView = updatedView;
  }
}

const initialModel = {
  meals: [],
  currentMeal: { name: "", calories: 0 },
  totalCalories: 0,
};

const rootNode = document.getElementById("app");
app(initialModel, update, view, rootNode);
