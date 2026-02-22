import { Form as RadixForm } from 'radix-ui'
import { ForwardedRef, forwardRef, Ref } from 'react'
import Button from './button'
import { cn } from '@repo/shared/utils'

type FormProps = {
  fields: {
    name: string
    label: string
    type: string
    required: boolean
  }[]
  btnLabel: string
  onSubmit: (data: any) => void
  className?: string
  loading?: boolean
  error?: string | null
}

const Form = ({
  fields,
  btnLabel,
  onSubmit,
  className,
  loading,
  error,
}: FormProps) => {
  return (
    <RadixForm.Root
      autoComplete="off"
      className={cn('w-[260px]', className)}
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const data = Object.fromEntries(formData)
        onSubmit(data)
      }}
    >
      {fields.map((field) => (
        <RadixForm.Field
          key={field.name}
          className="grid not-first-of-type:mt-3"
          name={field.name}
        >
          <RadixForm.Label className="text-base font-medium">
            {field.label}
          </RadixForm.Label>
          <RadixForm.Control asChild>
            <Input
              name={field.name}
              type={field.type}
              required={field.required}
              className="mt-1"
            />
          </RadixForm.Control>
        </RadixForm.Field>
      ))}

      <RadixForm.Submit asChild>
        <Button className="mt-4 w-full" disabled={loading}>
          {btnLabel}
        </Button>
      </RadixForm.Submit>
    </RadixForm.Root>
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
  onChange?: (value: string) => void
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
      placeholder,
    }: InputProps,
    ref: ForwardedRef<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (type === 'textarea') {
      return (
        <textarea
          autoComplete="off"
          ref={ref as Ref<HTMLTextAreaElement>}
          name={name}
          required={required}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            inputClassName,
            className,
            isError && errorInputClassName
          )}
          placeholder={placeholder}
        />
      )
    }

    return (
      <input
        autoComplete="off"
        ref={ref as Ref<HTMLInputElement>}
        type={type}
        name={name}
        required={required}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          inputClassName,
          className,
          isError && errorInputClassName
        )}
        placeholder={placeholder}
      />
    )
  }
)

Input.displayName = 'Input'

export default Form
