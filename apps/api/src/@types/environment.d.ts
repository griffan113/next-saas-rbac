declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined
      PORT: string
      JWT_TOKEN: string
      // add more environment variables and their types here
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
