// External
import React from 'react'
import { render, screen } from "@testing-library/react"

// Internal
import Header from "../Header"

describe("Header", () => {
    test("renders the logo and navigation links", () => {
        render(<Header />);

        // Check if logo is present
        expect(screen.getByText(/MyLogo/i)).toBeInTheDocument();

        // Check for navigation links
        expect(screen.getByText(/Home/i)).toBeInTheDocument();
        expect(screen.getByText(/About/i)).toBeInTheDocument();
        expect(screen.getByText(/Contact/i)).toBeInTheDocument();
    });
});
