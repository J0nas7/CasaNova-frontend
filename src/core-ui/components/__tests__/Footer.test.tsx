// External
import React from 'react';
import { render, screen } from "@testing-library/react";

// Internal
import Footer from "../Footer";

describe("Footer", () => {
    test("renders footer with current year and privacy policy link", () => {
        render(<Footer />);

        const currentYear = new Date().getFullYear();
        expect(screen.getByText(`© ${currentYear} MyCompany. All rights reserved.`)).toBeInTheDocument();
        expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
    });
});
