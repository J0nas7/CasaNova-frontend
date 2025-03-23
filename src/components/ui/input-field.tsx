// Renders a form field.
/**
 * 
 * @param {Object} props - Incoming props for the component.
 * @param {string} props.type - The type of input (e.g., "text", "password", "email").
 * @param {string} props.lbl - The label text for the form field.
 * @param {string} [props.customId] - An optional custom ID for the input field.
 * @param {string} props.value - The current value of the input field.
 * @param {Function} props.onChange - Callback function triggered when the input value changes. Receives the new value as an argument.
 * @param {Function} [props.onKeyDown] - Optional callback for handling `onKeyDown` events in the input field.
 * @param {Function} [props.endButton] - Optional callback to render a button or action at the end of the input field.
 * @param {string} [props.endContent] - Optional string content displayed at the end of the input field.
 * @param {boolean} props.disabled - If true, the input field is disabled and cannot be interacted with.
 * @param {string} [props.error] - An optional error message displayed if the field has validation issues.
 * @param {boolean} [props.required] - If true, the field is marked as required for form submission.
 * @param {boolean} [props.displayLabel] - If true, the label is displayed. Otherwise, it will be hidden.
 * @param {boolean} [props.innerLabel] - If true, the label is rendered inside the input field as a placeholder.
 * @param {boolean} [props.hiddenMUILabel] - If true, the Material-UI label is hidden while still keeping the input accessible.
 * @param {string} [props.placeholder] - Placeholder text displayed in the input field when it is empty.
 * @param {RefObject<HTMLDivElement>} [props.refRef] - Optional ref object for the container element of the input field.
 * @param {string} [props.description] - Additional description or hint text for the field, often displayed below the input.
 * @param {boolean} [props.grow] - If true, the field becomes a textarea that dynamically adjusts its height as the user types.
 * @param {number} [props.growMin] - The minimum height (in pixels) for the textarea when `grow` is true.
 * @param {string} [props.autoComplete] - The autocomplete attribute for the input, providing hints to the browser for pre-filling values.
 * @param {string} [props.className] - Optional CSS class name(s) for styling the input container.
 * @param {Object} [props.props] - Additional properties passed to the input field (e.g., `id`, `aria-label`, or other HTML attributes).
 */

import { IconButton, InputAdornment, TextField } from "@mui/material"
import { Block, Text } from "./block-text"
import TextareaAutosize from 'react-textarea-autosize'
import { RefObject } from "react"

type FieldProps = {
    type: string,
    lbl: string,
    customId?: string,
    value: string,
    onChange: Function,
    onKeyDown?: Function,
    endButton?: Function,
    endContent?: string,
    disabled: boolean,
    error?: string,
    required?: boolean,
    displayLabel?: boolean,
    innerLabel?: boolean,
    hiddenMUILabel?: boolean,
    placeholder?: string,
    refRef?: RefObject<HTMLDivElement>,
    description?: string,
    grow?: boolean,
    growMin?: number,
    autoComplete?: string,
    className?: string,
    props?: Object
}

export const Field = ({
    type, lbl, customId, displayLabel, innerLabel, hiddenMUILabel, placeholder, refRef, description, required, value, grow, growMin, disabled, className, onChange, onKeyDown, endButton, endContent, error, ...props
}: FieldProps) => {
    const inputProps = {
        type,
        value,
        className,
        label: `${(innerLabel ? lbl : '')}`,
        id: customId ? customId : `field-${lbl}`,
        placeholder,
        disabled,
        required,
        ...props,
    }

    return (
        <Block className={'custom-field-container field ' + className + (error ? ' field--error' : '')} theId={className}>
            {((lbl || displayLabel === true) && !innerLabel) && (
                <label htmlFor={`field-${lbl}`}>
                    {lbl}
                </label>
            )}
            <Block className="field-input">
                {grow === true ? (
                    <TextareaAutosize
                        {...inputProps}
                        minRows={(growMin ? growMin : 1)}
                        maxRows={10}
                        onChange={(event) => onChange(event.target.value)}
                    />
                ) : (
                    <Text variant="span" className="input-field-wrap">
                        <TextField
                            {...inputProps}
                            ref={refRef ?
                                refRef :
                                undefined}
                            onChange={
                                (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => 
                                onChange(event.target.value)
                            }
                            onKeyDown={onKeyDown ?
                                (event) => onKeyDown!(event) :
                                undefined}
                            InputProps={endButton ?
                                {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                edge="end"
                                                onClick={() => endButton()}
                                            >
                                                {endContent}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }
                                : undefined}
                        />
                    </Text>
                )}
            </Block>
            {description && (
                <Text variant="p" className="field__description">
                    {description}
                </Text>
            )}
            {error && (
                <Text variant="p" className="field__error">
                    {error}
                </Text>
            )}
        </Block>
    )
}