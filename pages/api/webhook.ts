import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import * as stripeutil from 'utils/stripeutil'

// 注) リクエストデータがバイナリデータの場合、必ず以下の設定を行う。
export const config = {
  api: {
    bodyParser: false,
  },
}

const stripe = stripeutil.getStripe()

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  //console.log(`[webhook] start. ${req.method} ${req.url}`)
  //console.log(`[webhook] webhookSecret=${stripeutil.getWebhookSecret()}`)

  // Retrieve the event by verifying the signature using the raw body and secret.
  let event: Stripe.Event

  try {
    // リクエストの検証には生のリクエストデータが必要なため「bodyParser: false」を指定する。
    // https://stripe.com/docs/webhooks/quickstart#signature-verify
    const buf = await stripeutil.buffer(req)
    event = stripe.webhooks.constructEvent(
      buf,
      req.headers['stripe-signature'] ?? '',
      stripeutil.getWebhookSecret()
    )
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`)
    if (err instanceof Error) {
      console.log(`[webhook] ${err.name}: ${err.message}`)
    }
    res.status(400)
    res.end()
    return
  }

  // Extract the data from the event.
  const data: Stripe.Event.Data = event.data
  const eventType: string = event.type
  console.log(`[webhook] eventType=${eventType}`)
  if (eventType !== 'payment_intent.created') {
    console.log(`[webhook] data=${JSON.stringify(data)}`)
  }

  if (eventType === 'payment_intent.succeeded') {
    // Cast the event into a PaymentIntent to make use of the types.
    const pi: Stripe.PaymentIntent = data.object as Stripe.PaymentIntent
    // Funds have been captured
    // Fulfill any orders, e-mail receipts, etc
    // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds).
    console.log(`🔔  Webhook received: ${pi.object} ${pi.status}!`)
    console.log('💰 Payment captured!')
  } else if (eventType === 'payment_intent.payment_failed') {
    // Cast the event into a PaymentIntent to make use of the types.
    const pi: Stripe.PaymentIntent = data.object as Stripe.PaymentIntent
    console.log(`🔔  Webhook received: ${pi.object} ${pi.status}!`)
    console.log('❌ Payment failed.')
  }
  res.status(200)
  res.end()
}

export default handler
