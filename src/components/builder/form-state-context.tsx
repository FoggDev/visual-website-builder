"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface FormState {
  [formId: string]: {
    [fieldName: string]: any
  }
}

interface FormStateContextType {
  formStates: FormState
  updateFormField: (formId: string, fieldName: string, value: any) => void
  getFormState: (formId: string) => Record<string, any>
  renameFormField: (formId: string, oldFieldName: string, newFieldName: string) => void
}

const FormStateContext = createContext<FormStateContextType | null>(null)

export function FormStateProvider({ children }: { children: React.ReactNode }) {
  const [formStates, setFormStates] = useState<FormState>({})

  const updateFormField = (formId: string, fieldName: string, value: any) => {
    console.log("[v0] Updating form field:", { formId, fieldName, value })
    setFormStates((prev) => ({
      ...prev,
      [formId]: {
        ...prev[formId],
        [fieldName]: value,
      },
    }))
  }

  const getFormState = (formId: string) => {
    return formStates[formId] || {}
  }

  const renameFormField = (formId: string, oldFieldName: string, newFieldName: string) => {
    console.log("[v0] Renaming form field:", { formId, oldFieldName, newFieldName })
    setFormStates((prev) => {
      const formState = prev[formId] || {}
      const oldValue = formState[oldFieldName]

      // Create new state without the old field name and with the new field name
      const newFormState = { ...formState }
      if (oldValue !== undefined) {
        newFormState[newFieldName] = oldValue
      }
      delete newFormState[oldFieldName]

      return {
        ...prev,
        [formId]: newFormState,
      }
    })
  }

  return (
    <FormStateContext.Provider value={{ formStates, updateFormField, getFormState, renameFormField }}>
      {children}
    </FormStateContext.Provider>
  )
}

export function useFormState() {
  const context = useContext(FormStateContext)
  if (!context) {
    throw new Error("useFormState must be used within a FormStateProvider")
  }
  return context
}
