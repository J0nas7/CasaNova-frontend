// External
import { CSSProperties } from 'react'
import Image from 'next/image'

// Internal
import { Block } from "@/components"

export const Jumbotron = () => {
    const random1to4 = Math.floor(Math.random() * (4 - 1 + 1) + 1)
    const requireImg = "/app-" + random1to4 + ".jpeg"

    const jumbotronCSS: CSSProperties = {
        backgroundImage: `url('${requireImg}')`
    }

    return (
        <Block className="jumbotron-wrapper" style={jumbotronCSS}>
        </Block>
    )
}