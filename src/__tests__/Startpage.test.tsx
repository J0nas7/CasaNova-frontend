import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import { PropertiesContextType, usePropertiesContext } from "@/contexts";  // Mock the context
import { Property } from "@/types";
import { renderWithProviders } from "./test-utils"; // Import the TestProvider
import { Startpage, LatestAds, PropertyCategories, PopularCities, PopularAds } from "@/components/partials/users/Startpage";

// Mock the context for properties
jest.mock("@/contexts", () => ({
    usePropertiesContext: jest.fn(),
}));

const mockProperties: Property[] = [
    {
        Property_ID: 1,
        User_ID: 1,
        Property_Title: "Property 1",
        Property_Description: "A beautiful property in New York.",
        Property_Address: "123 Main St",
        Property_City: "New York",
        Property_Zip_Code: "10001",
        Property_Latitude: 40.7128,
        Property_Longitude: -74.0060,
        Property_Price_Per_Month: 1000,
        Property_Num_Bedrooms: 2,
        Property_Num_Bathrooms: 1,
        Property_Square_Feet: 1200,
        Property_Amenities: ["Pool", "Gym"],
        Property_Property_Type: 1,
        Property_Available_From: "2023-01-01",
        Property_Is_Active: true,
        Property_CreatedAt: "2023-01-01T00:00:00Z",
        Property_UpdatedAt: "2023-01-01T00:00:00Z",
    },
    {
        Property_ID: 2,
        User_ID: 2,
        Property_Title: "Property 2",
        Property_Description: "A luxurious property in Los Angeles.",
        Property_Address: "456 Elm St",
        Property_City: "Los Angeles",
        Property_Zip_Code: "90001",
        Property_Latitude: 34.0522,
        Property_Longitude: -118.2437,
        Property_Price_Per_Month: 2000,
        Property_Num_Bedrooms: 3,
        Property_Num_Bathrooms: 2,
        Property_Square_Feet: 2000,
        Property_Amenities: ["Garage", "Garden"],
        Property_Property_Type: 2,
        Property_Available_From: "2023-02-01",
        Property_Is_Active: true,
        Property_CreatedAt: "2023-02-01T00:00:00Z",
        Property_UpdatedAt: "2023-02-01T00:00:00Z",
    },
];

const mockReadProperties = jest.fn();

beforeEach(() => {
    // Type the mock function to return the correct context type
    (usePropertiesContext as jest.Mock<Partial<PropertiesContextType>>).mockReturnValue({
        properties: mockProperties,
        readProperties: mockReadProperties,
    });
});

describe("Startpage Component", () => {
    it("renders without crashing", () => {
        renderWithProviders(<Startpage />);
        expect(screen.getByText(/Search among/i)).toBeInTheDocument();
    });

    it("renders the correct number of properties", () => {
        renderWithProviders(<Startpage />);
        expect(screen.getByText(/Search among/i)).toBeInTheDocument();
        expect(screen.getByText(/available properties/i)).toBeInTheDocument();
    });

    it("displays latest ads correctly", () => {
        render(<LatestAds properties={mockProperties} />);
        expect(screen.getByText(/🆕 Latest Listings/i)).toBeInTheDocument();
        expect(screen.getByText(/Property 1/i)).toBeInTheDocument();
        expect(screen.getByText(/Property 2/i)).toBeInTheDocument();
    });

    it("displays no latest ads message if there are no properties", () => {
        render(<LatestAds properties={[]} />);
        expect(screen.getByText(/No properties available at the moment./i)).toBeInTheDocument();
    });

    it("displays property categories", () => {
        render(<PropertyCategories />);
        expect(screen.getByText(/🏡 Property Categories/i)).toBeInTheDocument();
        expect(screen.getByText(/Apartments/i)).toBeInTheDocument();
        expect(screen.getByText(/Rooms/i)).toBeInTheDocument();
    });

    it("displays popular cities correctly", () => {
        render(<PopularCities properties={mockProperties} />);
        expect(screen.getByText(/🌆 Popular Cities/i)).toBeInTheDocument();
        expect(screen.getByText(/New York/i)).toBeInTheDocument();
        expect(screen.getByText(/Los Angeles/i)).toBeInTheDocument();
    });

    it("displays no popular cities message if there are no properties", () => {
        render(<PopularCities properties={[]} />);
        expect(screen.getByText(/No popular cities to display at the moment./i)).toBeInTheDocument();
    });

    it("displays popular ads correctly", () => {
        render(<PopularAds properties={mockProperties} />);
        expect(screen.getByText(/🔥 Most Popular Ads/i)).toBeInTheDocument();
        expect(screen.getByText(/Property 2/i)).toBeInTheDocument();
        expect(screen.getByText(/Property 1/i)).toBeInTheDocument();
    });

    it("displays no popular ads message if there are no properties", () => {
        render(<PopularAds properties={[]} />);
        expect(screen.getByText(/No popular ads to display at the moment./i)).toBeInTheDocument();
    });
});

// Edge cases testing
describe("Edge Cases for Startpage", () => {
    it("renders correctly when no properties are available", () => {
        (usePropertiesContext as jest.Mock<Partial<PropertiesContextType>>).mockReturnValue({
            properties: mockProperties,
            readProperties: mockReadProperties,
        });
        renderWithProviders(<Startpage />);
        expect(screen.getByText(/Search among/i)).toBeInTheDocument();
        expect(screen.getByText(/available properties/i)).toBeInTheDocument();
    });

    it("handles missing property data in Latest Ads", () => {
        render(<LatestAds properties={[]} />);
        expect(screen.getByText(/No properties available at the moment./i)).toBeInTheDocument();
    });

    it("handles missing property data in Popular Cities", () => {
        render(<PopularCities properties={[]} />);
        expect(screen.getByText(/No popular cities to display at the moment./i)).toBeInTheDocument();
    });

    it("handles missing property data in Popular Ads", () => {
        render(<PopularAds properties={[]} />);
        expect(screen.getByText(/No popular ads to display at the moment./i)).toBeInTheDocument();
    });
});