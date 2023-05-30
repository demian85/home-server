declare module 'dalai' {
  interface Request {
    prompt: string
    model: string
    url?: string
  }
  class Dalai {
    constructor(path?: string)
    serve(port: number): void
    request(req: Request, callback: (response: string) => void): void
  }

  export default Dalai
}
