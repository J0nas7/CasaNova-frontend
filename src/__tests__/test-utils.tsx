// src/test-utils.tsx
import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { PropertiesProvider, PropertiesContextType } from "@/contexts/Contexts";

// Create mock store
const mockStore = configureStore([]);
const store = mockStore({
    auth: {
        user: { id: 1, name: "Test User" },
    },
});

// Mock properties context value
const mockPropertiesContextValue: Partial<PropertiesContextType> = {
    properties: [],
    readProperties: jest.fn(),
};

export const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <Provider store={store}>
            <PropertiesProvider> {/* Use the Provider instead of manually setting context */}
                {children}
            </PropertiesProvider>
        </Provider>
    );
};

// Custom render function
export const renderWithProviders = (ui: React.ReactElement) => {
    return render(<TestProvider>{ui}</TestProvider>);
};
