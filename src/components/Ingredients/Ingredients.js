import React, { useEffect, useCallback, useReducer } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";
import Search from "./Search";
import useHttp from "../../hooks/http";

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...currentIngredients, action.ingredients];
    case "DELETE":
      return currentIngredients.filter((ing) => ing.id !== action.id);
    default:
      throw new Error("Should not get there");
  }
};

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const {
    isLoading,
    error,
    data,
    sendRequest,
    reqExtra,
    reqIdentifier,
    clear,
  } = useHttp();

  useEffect(() => {
    fetch(
      "https://react-hooks-update-fd724-default-rtdb.europe-west1.firebasedatabase.app/ingredients.json"
    )
      .then((response) => response.json())
      .then((responseData) => {
        const loadedIngredients = [];
        for (const key in responseData) {
          loadedIngredients.push({
            id: key,
            title: responseData[key].title,
            amount: responseData[key].amount,
          });
        }
        // setUserIngredients(loadedIngredients);
        dispatch({ type: "SET", ingredients: loadedIngredients });
      });
  }, []);

  useEffect(() => {
    if (!isLoading && !error && reqIdentifier === "REMOVE_INGREDIENT") {
      dispatch({ type: "DELETE", id: reqExtra });
    } else if (!isLoading && !error && reqIdentifier === "ADD_INGREDIENT") {
      dispatch({
        type: "ADD",
        ingredients: {
          id: data.name,
          ...reqExtra,
        },
      });
    }
  }, [data, reqExtra, reqIdentifier, isLoading, error]);

  const filteredIngredientHandler = useCallback((filteredIngredients) => {
    dispatch({ type: "SET", ingredients: filteredIngredients });
  }, []);

  const addIngredientHandler = useCallback(
    (ingredient) => {
      sendRequest(
        "https://react-hooks-update-fd724-default-rtdb.europe-west1.firebasedatabase.app/ingredients.json",
        "POST",
        JSON.stringify(ingredient),
        ingredient,
        "ADD_INGREDIENT"
      );
    },
    [sendRequest]
  );

  const removeItemHandler = useCallback(
    (id) => {
      sendRequest(
        `https://react-hooks-update-fd724-default-rtdb.europe-west1.firebasedatabase.app/ingredients/${id}.json`,
        "DELETE",
        null,
        id,
        "REMOVE_INGREDIENT"
      );
    },
    [sendRequest]
  );

  return (
    <div className="App">
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientHandler} />
        <IngredientList
          ingredients={userIngredients}
          onRemoveItem={removeItemHandler}
        />
      </section>
    </div>
  );
};

export default Ingredients;
