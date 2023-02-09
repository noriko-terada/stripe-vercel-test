import { useState, useEffect, useRef} from "react";
import Link from 'next/link'
import { PaymentElement, useStripe, useElements} from "@stripe/react-stripe-js";
import { PaymentIntentResult } from '@stripe/stripe-js'
import * as testutil from 'utils/testutil'

type CompleteFormProps = {
  payment_intent: string | string[],
  payment_intent_client_secret: string | string[],
  redirect_status: string | string[],
}

const CompleteForm = (props: CompleteFormProps) => {
  console.log(`[CompleteForm] start. data=${JSON.stringify(props)}`)

  const stripe = useStripe()
  const [message, setMessage] = useState<string | undefined | null>(null)

  useEffect(() => {
    console.log(`[CompleteForm][useEffect] start.`)

    if (!stripe) {
      console.log(`[CompleteForm][useEffect] return by !stripe`)
      return
    }
  
    // URLのクエリから値を取得する
    const clientSecret = testutil.toString(props.payment_intent_client_secret)

    console.log(`[CompleteForm][useEffect] clientSecret=${clientSecret}`)

    // TODO 以下リダイレクトは、決済ボタンを押した後の処理で行うべきではないか？
    // http://localhost:8000/complete?payment_intent=pi_3MZ8JmC4uK8kqc6v13s2QqU4&payment_intent_client_secret=pi_3MZ8JmC4uK8kqc6v13s2QqU4_secret_AAXMCYUx1hmHV85Bsi92tU92p&redirect_status=succeeded

    // リダイレクト時にここに値が入る
    if (!clientSecret) {
      console.log(`[CompleteForm][useEffect] return by !clientSecret`)
      return
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }: PaymentIntentResult) => {
      console.log(`[CompleteForm][useEffect] retrievePaymentIntent.then paymentIntent.status=${paymentIntent?.status}`)
      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('Payment succeeded!')
          break
        case 'processing':
          setMessage('Your payment is processing.')
          break
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.')
          break
        default:
          setMessage('Something went wrong.')
          break
      }
    })
  }, [stripe])

  console.log(`[CompleteForm] before return. stripe is null=${stripe == null || stripe == undefined}`)

  return (
    <>
      {stripe &&
      <div>
        <h1>決済完了</h1>
        <div>お買い上げありがとうございました</div>
        {/* Show any error or success messages */}
        {message && <div>{message}</div>}
        <div>
          <Link href='/payment'>決済画面に戻る →</Link>
        </div>
      </div>
      }
    </>
  )
}

export default CompleteForm
