import Stripe from 'stripe'
import type { Readable } from 'node:stream'

const STRIPE_API_VERSION = '2022-11-15'

export const getStripe = ():Stripe => {
  console.log(`[getStripe] apiVersion=${STRIPE_API_VERSION} secretKey=${getSecretKey()}`)
  return new Stripe(getSecretKey(), {
    apiVersion: STRIPE_API_VERSION,
    typescript: true,
  })
}

export const getPublicKey = ():string => {
    return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
  }
  
export const getSecretKey = ():string => {
  return process.env.STRIPE_SECRET_KEY ?? ''
}

export const getWebhookSecret = ():string => {
  return process.env.STRIPE_WEBHOOK_SECRET ?? ''
}

export const getRedirectUrl = (pathInfo:string):string => {
  return `${process.env.NEXT_PUBLIC_VTECXNEXT_URL ?? ''}${pathInfo ?? ''}`
}

/**
 * ストリームからバイナリデータを取得
 * @param readable Readable
 * @returns バイナリデータ
 */
export const buffer = async (readable: Readable):Promise<Buffer> => {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}
