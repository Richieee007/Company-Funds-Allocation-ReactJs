import React, { createContext, useReducer } from 'react';

// 5. The reducer - this is used to update the state, based on the action
export const AppReducer = (state, action) => {
    // eslint-disable-next-line
    let budget = 0; // Initialize budget
    switch (action.type) {
        case 'ADD_EXPENSE':
            let total_budget = 0;

            // Calculate the total budget by summing up all expenses
            total_budget = state.expenses.reduce(
                (previousExp, currentExp) => {
                    return previousExp + currentExp.cost;
                }, 0
            );
            total_budget = total_budget + action.payload.cost;

            // Check if the total budget is within the allowed budget
            if (total_budget <= state.budget) {
                total_budget = 0;

                // Check if the department already exists
                const existingExpense = state.expenses.find(
                    (currentExp) => currentExp.name === action.payload.name
                );

                // If the department exists, update the cost
                if (existingExpense) {
                    const updatedExpenses = state.expenses.map((currentExp) => {
                        if (currentExp.name === action.payload.name) {
                            currentExp.cost = action.payload.cost + currentExp.cost;
                        }
                        return currentExp;
                    });
                    return {
                        ...state,
                        expenses: updatedExpenses, // Return updated expenses list
                    };
                } else {
                    // If the department does not exist, add a new one
                    return {
                        ...state,
                        expenses: [
                            ...state.expenses,
                            {
                                id: action.payload.name, // Use the name as the ID
                                name: action.payload.name, // Department name
                                cost: action.payload.cost, // Allocated cost
                            },
                        ],
                    };
                }
            } else {
                alert('Cannot increase the allocation! Out of funds'); // Alert when over budget
                return {
                    ...state, // Return current state if over budget
                };
            }

        case 'RED_EXPENSE':
            // Reduce the allocation for the specified department
            const red_expenses = state.expenses.map((currentExp) => {
                if (
                    currentExp.name === action.payload.name &&
                    currentExp.cost - action.payload.cost >= 0
                ) {
                    currentExp.cost = currentExp.cost - action.payload.cost; // Deduct cost
                    budget = state.budget + action.payload.cost; // Adjust remaining budget
                }
                return currentExp; // Return the updated expense
            });
            return {
                ...state,
                expenses: [...red_expenses], // Return updated expenses list
            };

        case 'DELETE_EXPENSE':
            // Delete the selected department's expense
            const updatedExpenses = state.expenses.filter(
                (currentExp) => currentExp.name !== action.payload
            );
            return {
                ...state,
                expenses: updatedExpenses, // Return updated expenses list without the deleted item
            };

        case 'SET_BUDGET':
            // Update the budget value
            return {
                ...state,
                budget: action.payload, // New budget value
            };

        case 'CHG_CURRENCY':
            // Change the currency
            return {
                ...state,
                currency: action.payload, // New currency
            };

        default:
            // Return the current state for unknown actions
            return state;
    }
};

// 1. Sets the initial state when the app loads
const initialState = {
    budget: 5000,
    expenses: [
        { id: "Marketing", name: 'Marketing', cost: 50 },
        { id: "Finance", name: 'Finance', cost: 300 },
        { id: "Sales", name: 'Sales', cost: 70 },
        { id: "Human Resource", name: 'Human Resource', cost: 40 },
        { id: "IT", name: 'IT', cost: 500 },
    ],
    currency: '£'
};

// 2. Creates the context this is the thing our components import and use to get the state
export const AppContext = createContext();

// 3. Provider component - wraps the components we want to give access to the state
// Accepts the children, which are the nested(wrapped) components
export const AppProvider = (props) => {
    // 4. Sets up the app state. takes a reducer, and an initial state
    const [state, dispatch] = useReducer(AppReducer, initialState);
    let remaining = 0;

    if (state.expenses) {
            const totalExpenses = state.expenses.reduce((total, item) => {
            return (total = total + item.cost);
        }, 0);
        remaining = state.budget - totalExpenses;
    }

    return (
        <AppContext.Provider
            value={{
                expenses: state.expenses,
                budget: state.budget,
                remaining: remaining,
                dispatch,
                currency: state.currency
            }}
        >
            {props.children}
        </AppContext.Provider>
    );
};