// External
import React from 'react'
import { render, screen } from "@testing-library/react"

// Internal
import { Header } from "../Header"
import { renderWithProviders } from '@/__tests__/test-utils';

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        pathname: "/",
        asPath: "/",
        query: {},
    })),
}));

describe("Header", () => {
    test("renders the logo and navigation links", () => {
        renderWithProviders(<Header />);

        // Check if logo is present by alt text
        expect(screen.getByAltText(/CasaNova Logo/i)).toBeInTheDocument();

        // Check for navigation links
        expect(screen.getByText(/Log on/i)).toBeInTheDocument();
    });
});
