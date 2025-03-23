// External
import clsx from "clsx"
import React from "react"
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDoorOpen, faUser } from "@fortawesome/free-solid-svg-icons";

// Internal
import styles from "../styles/modules/Header.module.scss";
import { Block, Text } from "@/components";
import SearchBar from "./SearchBar";
import { selectAuthUser, useTypedSelector } from "@/redux";
import { useAuth } from "@/hooks";

export const Header: React.FC = () => {
    // Hooks
    const { handleLogoutSubmit } = useAuth()

    const authUser = useTypedSelector(selectAuthUser); // Redux

    // if (!authUser) return null

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/">
                    <Block className={styles['logo-wrapper']}>
                        <Image
                            src="/casanova-logo.png"
                            alt="Logo"
                            width={54}
                            height={36}
                        />
                        <Text variant="span">
                            <Text variant="span" className={styles.title}>
                                CasaNova
                            </Text>
                        </Text>
                    </Block>
                </Link>

                <SearchBar />

                <nav>
                    <ul className={styles.navList}>
                        <li>
                            <Block variant="span" className="flex items-center space-x-3">
                                {authUser?.User_Profile_Picture ? (
                                    <img
                                        src={authUser?.User_Profile_Picture}
                                        alt={authUser?.User_First_Name}
                                        className="w-5 h-5 rounded-full border border-gray-300"
                                    />
                                ) : (
                                    <FontAwesomeIcon icon={faUser} />
                                )}
                                <Link
                                    href="/profile"
                                    className={clsx(
                                        `inline-block text-sm`
                                    )}
                                >
                                    <Text variant="span" className="text-sm text-white">{authUser?.User_First_Name} {authUser?.User_Last_Name}</Text>
                                </Link>
                            </Block>
                        </li>
                        <li>
                            <Block variant="span" className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faDoorOpen} />
                                <Block
                                    variant="span"
                                    className={clsx(
                                        `inline-block text-sm text-white cursor-pointer`
                                    )}
                                    onClick={handleLogoutSubmit}
                                >
                                    Log out
                                </Block>
                            </Block>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};