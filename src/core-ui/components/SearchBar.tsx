import { Block, Heading, Text } from "@/components";
import { useAxios, useDebounce } from "@/hooks";
import { selectAuthUser, useTypedSelector } from "@/redux";
import { User } from "@/types";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";

const SearchTextRotator = () => {
    const searchTerms = [
        "anything",
        "cities",
        "streets",
        "municipalities",
    ];

    const [displayedText, setDisplayedText] = useState<string>("Search for anything");
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isSwitching, setIsSwitching] = useState<boolean>(false);

    useEffect(() => {
        // Function to handle the transition between search terms
        const handleSwitch = async () => {
            const currentTerm = searchTerms[currentIndex];
            const nextTerm = searchTerms[(currentIndex + 1) % searchTerms.length];

            // Step 1: Remove letters from the current search term
            for (let i = currentTerm.length; i >= 0; i--) {
                await new Promise((resolve) => setTimeout(resolve, 100));
                setDisplayedText(`Search for ${currentTerm.slice(0, i)}`);
            }

            // Step 2: Add letters for the next search term
            for (let i = 0; i <= nextTerm.length; i++) {
                await new Promise((resolve) => setTimeout(resolve, 100));
                setDisplayedText(`Search for ${nextTerm.slice(0, i)}`);
            }

            // Update the index to the next term in the array
            setCurrentIndex((prevIndex) => (prevIndex + 1) % searchTerms.length);
        };

        // Set up the interval to switch search terms every 8 seconds
        const interval = setInterval(() => {
            setIsSwitching(true);
            handleSwitch().then(() => setIsSwitching(false)); // Perform the switch
        }, 2500); // Change every 4 seconds

        return () => clearInterval(interval); // Clean up the interval on component unmount
    }, [currentIndex, searchTerms]);

    return {
        displayedText
    }
};

interface SearchResult {
    [key: string]: any[]; // Dynamic response object
}

const SearchBar = () => {
    const router = useRouter()
    const authUser = useTypedSelector(selectAuthUser);
    const { httpGetRequest } = useAxios();
    const { displayedText } = SearchTextRotator()

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [results, setResults] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined); // Track selected index
    const debouncedSearch = useDebounce(searchTerm, 500); // Avoids excessive API calls

    useEffect(() => {
        if (debouncedSearch && debouncedSearch.length >= 3) {
            fetchResults(debouncedSearch);
        } else {
            setResults(null); // Clear results when input is empty or shorter than 3 characters
        }
    }, [debouncedSearch]);

    const fetchResults = async (query: string) => {
        if (!authUser) return;

        setLoading(true);
        try {
            const data = await httpGetRequest(`search/${authUser.User_ID}/${query}`);

            if (data) {
                setResults(data);
                setSelectedIndex(undefined)
            }
        } catch (error) {
            console.error("Error fetching search results:", error);
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setSearchTerm("")
    }

    const tableToLabel: { [key: string]: string } = {
        GT_Users: 'Users',
        GT_Organisations: 'Organisations',
        GT_Teams: 'Teams',
        GT_Projects: 'Projects',
        GT_Tasks: 'Tasks',
        ActivityLog: 'Activity Logs',
    };

    const formatResultItem = (item: any, type: string) => {
        switch (type) {
            case "GT_Users":
                const user: User = item
                return (
                    <div key={user.User_ID} className="flex items-center space-x-3">
                        {user.User_Profile_Picture ? (
                            <img
                                src={user.User_Profile_Picture}
                                alt={user.User_First_Name}
                                className="w-10 h-10 rounded-full border border-gray-300"
                            />
                        ) : (
                            <div className="w-10 h-10 flex items-center justify-center bg-gray-300 text-white font-semibold rounded-full">
                                {user.User_First_Name?.charAt(0)}{user.User_Last_Name?.charAt(0)}
                            </div>
                        )}
                        <div>
                            <p className="font-semibold">{user.User_First_Name} {user.User_Last_Name}</p>
                            <p className="text-sm text-gray-500">{user.User_Email}</p>
                            <p className="text-xs text-gray-400">Role: {user.User_Role}</p>
                        </div>
                    </div>
                );
            // case "GT_Projects":
            //     const project: Project = item
            //     return (
            //         <div key={project.Project_ID} className="space-y-2">
            //             <p className="font-semibold">{project.Project_Name}</p>
            //             <p className="text-sm text-gray-500">Key: {project.Project_Key}</p>
            //             <p className="text-xs text-gray-400">Status: {project.Project_Status}</p>
            //         </div>
            //     );
            default:
                return <div key={item.id}>{JSON.stringify(item)}</div>;
        }
    };

    const formatChooseItem = (item: any, type: string) => {
        console.log("formatChooseItem", type, item)
        switch (type) {
            case "GT_Users":
                const user: User = item
                break
            // case "GT_Projects":
            //     const project: Project = item
            //     router.push(`/project/${project.Project_ID}`)
            //     clearSearch()
            //     break
            default:
                return null
        }
    }

    // Function to handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (results) {
            if (e.key === "ArrowDown") {
                const newIndex = (selectedIndex !== undefined && (selectedIndex + 1) < getResultLength() ? selectedIndex + 1 : 0)
                setSelectedIndex(newIndex);
            } else if (e.key === "ArrowUp") {
                const newIndex = (selectedIndex !== undefined && selectedIndex > 0 ? selectedIndex - 1 : getResultLength() - 1)
                setSelectedIndex(newIndex);
            } else if (e.key === 'Enter' && selectedIndex !== undefined) {
                // Flatten results but keep track of table names
                const flattenedResults: { item: any; table: string }[] = Object.entries(results)
                    .flatMap(([table, items]) => items.map(item => ({ item, table })));

                const selectedItemData = flattenedResults[selectedIndex];

                if (selectedItemData) {
                    formatChooseItem(selectedItemData.item, selectedItemData.table);
                }
            }
        }
    };

    // Helper function to get total result length
    const getResultLength = () => {
        if (results) {
            return Object.values(results).reduce((acc, tableItems) => acc + tableItems.length, 0);
        }
        return 0;
    };

    return (
        <div className="w-full max-w-md relative" onKeyDown={handleKeyDown} tabIndex={0}>
            <div className="relative">
                <Block variant="span" className="flex items-center border bg-white border-gray-300 rounded-md">
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="text-gray-500 ml-3"
                    />
                    <input
                        type="text"
                        placeholder={displayedText}
                        value={searchTerm}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 rounded-md border-none text-black focus:outline-none"
                    />
                </Block>
            </div>

            {/* Display Results */}
            {results && (
                <div className="p-3 border rounded-md bg-white text-black shadow-lg absolute top-10 w-full overflow-hidden">
                    {Object.keys(results).length > 0 && (
                        (() => {
                            let searchIndex = -1;

                            return (
                                <>
                                    <Block>
                                        <Text>{getResultLength()} search results</Text>
                                        <Text variant="small" className="text-gray-400 text-xs">Keyboard-navigation with buttons ↑ ↓ ↵</Text>
                                    </Block>

                                    {Object.entries(results).map(([table, items]) => (
                                        <div key={table} className="space-y-4">
                                            <Heading variant="h3" className="font-semibold text-xl">
                                                {tableToLabel[table] || table} {/* Default to the table name if no mapping exists */}
                                            </Heading>
                                            <div className="space-y-2">
                                                {Array.isArray(items) &&
                                                    items.map((item, index) => {
                                                        searchIndex++
                                                        const itemIndex = searchIndex
                                                        const itemId = item[`${table}ID`] || item.id; // Get unique ID (adjust based on your structure)
                                                        const isSelected = selectedIndex === searchIndex; // Check if item is selected
                                                        return (
                                                            <div
                                                                key={itemId}
                                                                onMouseOver={() => setSelectedIndex(itemIndex)}
                                                                className={`p-3 border rounded-md shadow-sm ${isSelected ? 'bg-blue-100' : ''}`} // Highlight selected item
                                                            >
                                                                {formatResultItem(item, table)}
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )
                        })()
                    )}
                </div>
            )
            }
        </div >
    );
};

export default SearchBar;
