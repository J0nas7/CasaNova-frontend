// External
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { clsx } from 'clsx'
import { CSSProperties, forwardRef, LegacyRef } from "react"

// Internal
import { Block, Heading } from '..'

type Variant = 'h1' | 'h2' | 'h3'
/**
 * Renders a form field.
 *
 * @param {string} props.title Text for heading.
 * @param {string} props.icon FontAwesomeIcon.
 * @param {string} props.className Custom classname for content-box.
 * @param {string} props.numberOfColumnns Number of columns to span. Defaults to 1.
 */

type Props = {
    title?: string,
    icon?: IconDefinition,
    titleAction?: React.ReactNode,
    className?: string,
    numberOfColumns?: number,
    onClick?: Function,
    children?: React.ReactNode
}

const FlexibleBox = forwardRef<any, Props>(
    (
        {
            title,
            icon = undefined,
            titleAction,
            className = '',
            numberOfColumns = 1,
            onClick,
            children
        },
        ref
    ) => {
        const gridSize: CSSProperties = {
            gridColumn: "span " + numberOfColumns + " / span " + numberOfColumns
        }
        let colSpanClasses =
            "col-span-1" +
            (numberOfColumns > 1 ? " md:col-span-2" : "") +
            (numberOfColumns > 2 ? " lg:col-span-3" : "") +
            (numberOfColumns > 3 ? " xl:col-span-4" : "")

        return (
            <Block
                className={clsx("content-box-flexible", colSpanClasses, className)}
                onClick={onClick ? () => onClick() : undefined}
                ref={ref ? ref : undefined}
            >
                {title && (
                    <Block className="box-title-with-icon flex items-center">
                        <Heading title={title} variant="h1" className="box-title" />
                        {icon && (<FontAwesomeIcon icon={icon} className="box-title-icon" />)}
                        {titleAction && (
                            <>&nbsp;{titleAction}</>
                        )}
                    </Block>
                )}
                <Block className="flexible-box-content">
                    {children}
                </Block>
                <Block className="clear-both"></Block>
            </Block>
        )
    }
)

// Adding display name for better debugging
FlexibleBox.displayName = 'FlexibleBox';

// Named export
export { FlexibleBox };