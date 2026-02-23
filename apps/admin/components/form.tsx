'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@repo/shared/utils'
import { Form as RadixForm } from 'radix-ui'
import {
  Controller,
  DefaultValues,
  FieldValues,
  FormProvider,
  useForm,
  useFormContext,
} from 'react-hook-form'
import { ForwardedRef, forwardRef, Ref } from 'react'
import Sketch from '@uiw/react-color-sketch'
import type { z } from 'zod'
import Button from './button'
import Dropdown from './dropdown'
import LoadingIcon from '~icons/loading.svg'

type FormProps<T extends FieldValues> = {
  schema: z.ZodType<T>
  defaultValues: DefaultValues<T>
  onSubmit: (data: T) => void
  className?: string
  children: React.ReactNode
}

export function Form<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  className,
  children,
}: FormProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(
      schema as never
    ) as import('react-hook-form').Resolver<T>,
    defaultValues,
  })

  return (
    <FormProvider {...methods}>
      <RadixForm.Root
        autoComplete="off"
        className={cn('w-[260px]', className)}
        onSubmit={methods.handleSubmit(onSubmit as (data: T) => void)}
      >
        {children}
      </RadixForm.Root>
    </FormProvider>
  )
}

export type FormFieldConfig = {
  name: string
  label: string
  type: string
  required: boolean
  className?: string
  placeholder?: string
  options?: { label: string; value: string }[]
}

export function FormField({
  name,
  label,
  type,
  required,
  className,
  placeholder,
  options,
}: FormFieldConfig) {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  const errorMessage = errors[name]?.message as string | undefined

  return (
    <RadixForm.Field
      className={cn('grid not-first-of-type:mt-3', className)}
      name={name}
    >
      <RadixForm.Label className="text-base font-medium">
        {label}
      </RadixForm.Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <RadixForm.Control asChild>
            <Input
              name={name}
              type={type}
              required={required}
              className="mt-1"
              placeholder={placeholder}
              options={options}
              value={field.value ?? ''}
              onChange={(e) =>
                field.onChange(
                  typeof e === 'string'
                    ? e
                    : ((e?.target as HTMLInputElement)?.value ?? e)
                )
              }
              onBlur={field.onBlur}
              isError={Boolean(errorMessage)}
            />
          </RadixForm.Control>
        )}
      />
      {errorMessage && (
        <RadixForm.Message className="mt-1 text-sm text-red-500">
          {errorMessage}
        </RadixForm.Message>
      )}
    </RadixForm.Field>
  )
}

type InputProps = {
  name: string
  type: string
  required?: boolean
  className?: string
  isError?: boolean
  placeholder?: string
  value?: string
  id?: string
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string
  ) => void
  onBlur?: () => void
  options?: { label: string; value: string }[]
}

const inputClassName =
  'transition-all duration-300 w-full border border-gray-400/20 rounded-lg px-3.5 py-4 text-sm text-slate-900 hover:border-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900'
const errorInputClassName =
  'border-red-400 hover:border-red-500 focus:border-red-500 focus:ring-red-500'

export const Input = forwardRef(
  (
    {
      name,
      type,
      required,
      className,
      isError = false,
      value,
      onChange,
      onBlur,
      placeholder,
      options,
      id,
    }: InputProps,
    ref: ForwardedRef<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const sharedProps = {
      id,
      autoComplete: 'off',
      ref: ref as Ref<HTMLTextAreaElement | HTMLInputElement>,
      name,
      required,
      value,
      onChange,
      onBlur,
      placeholder,
    }

    if (type === 'select' && options) {
      const currentLabel =
        options.find((o) => o.value === value)?.label ??
        (value || placeholder || 'Select')
      return (
        <Dropdown
          trigger={
            <Button
              type="button"
              variant="outline"
              className={cn(
                'min-h-13.5 w-full justify-between text-sm font-medium',
                !!value && 'text-slate-900'
              )}
            >
              {currentLabel}
            </Button>
          }
          list={options.map((option) => ({
            label: option.label,
            onClick: () => onChange?.(option.value),
          }))}
        />
      )
    }

    if (type === 'color') {
      return (
        <div className="flex w-full items-center justify-between">
          <Dropdown
            className="shadow-none"
            trigger={
              <Button
                variant="icon"
                className={cn(
                  'min-h-13.5 min-w-13.5 text-sm font-medium',
                  !!value && 'text-slate-900'
                )}
              >
                <span
                  className="aspect-square h-full w-full rounded-full bg-slate-900"
                  style={{ backgroundColor: value || '#0f172b' }}
                />
              </Button>
            }
          >
            <ColorPicker
              value={value || ''}
              onChange={onChange as (color: string) => void}
            />
          </Dropdown>

          <Button
            variant="text"
            className="text-sm font-medium"
            onClick={() =>
              onChange?.(
                `#${(Math.floor(Math.random() * 0xffffff) | 0x0f0f0f).toString(16)}`
              )
            }
          >
            Randomize Color
          </Button>
        </div>
      )
    }

    if (type === 'textarea') {
      return (
        // @ts-expect-error - ref is not typed
        <textarea
          {...sharedProps}
          className={cn(
            inputClassName,
            className,
            isError && errorInputClassName
          )}
        />
      )
    }

    return (
      // @ts-expect-error - ref is not typed
      <input
        {...sharedProps}
        type={type}
        className={cn(
          inputClassName,
          className,
          isError && errorInputClassName
        )}
      />
    )
  }
)

Input.displayName = 'Input'

const PRESET_COLORS = [
  '#D0021B',
  '#F5A623',
  '#f8e61b',
  '#8B572A',
  '#7ED321',
  '#417505',
  '#BD10E0',
  '#9013FE',
]

type ColorPickerProps = {
  value: string
  onChange: (color: string) => void
}

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  return (
    <Sketch
      color={value}
      disableAlpha
      presetColors={PRESET_COLORS}
      onChange={(color) => onChange(color.hex)}
    />
  )
}

ColorPicker.displayName = 'ColorPicker'

type FormSubmitProps = {
  children: React.ReactNode
  className?: string
  disabled?: boolean
  loading?: boolean
}

export function FormSubmit({
  children,
  className,
  disabled,
  loading,
}: FormSubmitProps) {
  return (
    <RadixForm.Submit asChild>
      <Button className={className} disabled={disabled || loading}>
        {loading ? (
          <span className="relative flex items-center justify-center">
            <LoadingIcon className="absolute h-4 w-4 animate-spin" />
          </span>
        ) : (
          children
        )}
      </Button>
    </RadixForm.Submit>
  )
}

export default Form
