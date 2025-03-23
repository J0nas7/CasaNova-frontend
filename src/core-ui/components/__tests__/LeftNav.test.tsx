// External
import React from 'react'
import { render, screen } from "@testing-library/react"

// Internal
import LeftNav from "../LeftNav"

describe("LeftNav", () => {
  test("renders all navigation links", () => {
    render(<LeftNav />);
    
    const links = ["Dashboard", "Settings", "Profile", "Help"];
    links.forEach((link) => {
      expect(screen.getByText(link)).toBeInTheDocument();
    });
  });
});
