import { useState, useEffect } from "react";
import { PaymentElement, useStripe, useElements} from "@stripe/react-stripe-js";
import * as testutil from 'utils/testutil'
import * as stripeutil from 'utils/stripeutil'

type PaymentFormProps = {
  amount: string | string[]
}

const REDIRECT_PATHINFO = '/stripe_complete'

const PaymentForm = (props: PaymentFormProps) => {
  console.log(`[PaymentForm] start.`)

  const stripe = useStripe()
  const elements = useElements()

  const [message, setMessage] = useState<string | undefined | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [displayStripeForm, setDisplayStripeForm] = useState(true)
  const [amount, setAmount] = useState('')

  const displayForm = async () => {
    console.log(`[PaymentForm][displayForm] start.`)
    setDisplayStripeForm(false)
  }

  useEffect(() => {
    console.log(`[PaymentForm][useEffect] start.`)

    if (!stripe) {
      console.log(`[PaymentForm][useEffect] return by !stripe`)
      return
    }

    const tmpAmount = testutil.toString(props.amount)
    console.log(`[PaymentForm] tmpAmount=${tmpAmount}`)
    setAmount(tmpAmount)
  
  }, [stripe])

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    console.log(`[PaymentForm][handleSubmit] start.`)
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      console.log(`[PaymentForm][handleSubmit] return by !stripe || !elements`)
      return
    }

    setIsLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: stripeutil.getRedirectUrl(REDIRECT_PATHINFO),
      },
    })

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(error.message)
    } else {
      setMessage('An unexpected error occured.')
    }

    setIsLoading(false)
  }

  console.log(`[PaymentForm] before return. displayStripeForm=${displayStripeForm} stripe is null=${stripe == null || stripe == undefined}`)

  return (
    <>
      {displayStripeForm && 
        <div>決済情報を確認しています...</div>
      }
      {stripe &&
      <form id="payment-form" onSubmit={handleSubmit}>
          <h1>決済内容</h1>
            <div>{amount}<small>円</small></div>
          <PaymentElement
            onReady={() => {displayForm()}}
          />
          <button disabled={isLoading || !stripe || !elements} id="submit">
            <span id="button-text">
              {isLoading ? ' --- ' : `${amount}円 支払う`}
            </span>
          </button>
          {/* Show any error or success messages */}
          {message && <div>{message}</div>}
      </form>
      }
    </>
  )
}

export default PaymentForm
