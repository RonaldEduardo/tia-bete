declare module '#nitro-internal-virtual/server-assets' {
  export const assets: {
    getItem<T>(key: string): Promise<T | null>
  }
}
