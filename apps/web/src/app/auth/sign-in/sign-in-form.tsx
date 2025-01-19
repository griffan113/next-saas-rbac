'use client'

import githubIcon from '@/assets/github-icon.svg'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useState, useTransition } from 'react'

import { signInWithEmailAndPassword } from './actions'

export function SignInForm() {
  // const [{ success, message, errors }, formAction, isPending] = useActionState(
  //   signInWithEmailAndPassword,
  //   { success: false, message: null, errors: null }
  // )

  const [isPending, startTransition] = useTransition()

  const [{ success, message, errors }, setFormState] = useState<{
    success: boolean
    message: string | null
    errors: Record<string, string[]> | null
  }>({
    success: false,
    message: null,
    errors: null,
  })

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget

    const data = new FormData(form)

    startTransition(async () => {
      const state = await signInWithEmailAndPassword(data)

      setFormState(state)
    })
  }

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      {success === false && message && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Falha no login</AlertTitle>
          <AlertDescription>
            <p>{message}</p>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-1">
        <Label htmlFor="email">E-mail</Label>
        <Input name="email" type="text" id="email" />

        {errors?.email && (
          <p className="text-xs font-medium text-destructive">
            {errors.email[0]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Senha</Label>
        <Input name="password" type="password" id="password" />

        <Link
          href="/auth/forgot-password"
          className="text-xs font-medium text-foreground hover:underline"
        >
          Esqueceu sua senha?
        </Link>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          'Entrar com o e-mail'
        )}
      </Button>

      <Button variant="link" className="w-full" size="sm" asChild>
        <Link href="/auth/sign-up">Criar uma nova conta</Link>
      </Button>

      <Separator />

      <Button className="w-full" variant="outline">
        <Image src={githubIcon} alt="" className="size-4 mr-2 dark:invert" />
        Entrar com GitHub
      </Button>
    </form>
  )
}
