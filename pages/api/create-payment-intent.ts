import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import * as stripeutil from 'utils/stripeutil'

const stripe = stripeutil.getStripe()

// セキュリティ上、金額はサーバ側で指定する
// https://stripe.com/docs/payments/accept-a-payment?platform=web&ui=elements#web-create-intent
export const getAmount = (item:string):number => {
  if (item === '1') {
    return 300
  } else if (item === '2') {
    return 600
  } else if (item === '3') {
    return 900
  } else if (item === '4') {
    return 1200
  } else if (item === '5') {
    return 1500
  } else {
    return 100
  }
}

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[create-payment-intent] start. ${JSON.stringify(req.body)}`)

  // TODO ログインチェック

  if (req.method === 'POST') {
    const { item }: {item: string} = req.body
    const amount = getAmount(item)
    if (!amount) {
      console.log('[create-payment-intent] amount is required.')
      res.status(400).json({'feed': {'title': 'No parameters.'}})
    }
    console.log(`[create-payment-intent] amount=${amount}`)
    const paymentIntent: Stripe.PaymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'jpy',
    })
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount: amount
    })
  } else {
    console.log(`[create-payment-intent] invalid method: ${req.method}`)
    res.status(405)
  }
}

export default handler
