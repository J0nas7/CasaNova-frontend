// External
import React from 'react'
import { render, screen } from "@testing-library/react"

// Internal
import { MainContent } from "../MainContent"

describe("MainContent", () => {
  test("renders main content with heading and paragraph", () => {
    render(<MainContent>Lorem ipsum dolor sit amet</MainContent>);
    
    expect(screen.getByText(/Lorem ipsum dolor sit amet/i)).toBeInTheDocument();
  });
});
