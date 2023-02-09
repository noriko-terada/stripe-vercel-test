import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from "react";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { getPublicKey } from 'utils/stripeutil'
import * as testutil from 'utils/testutil'
import CompleteForm from 'components/completeform'

const stripePromise = loadStripe(getPublicKey())

const HomePage = () => {
  const router = useRouter()

  const [options, setOptions] = useState<any>(null)
  const [payment_intent, setPayment_intent] = useState<string | string[]>('')
  const [payment_intent_client_secret, setPayment_intent_client_secret] = useState<string | string[]>('')
  const [redirect_status, setRedirect_status] = useState<string | string[]>('')

  useEffect(() => {
    if (router.isReady) {
      const clientSecret = testutil.toString(router.query.payment_intent_client_secret)
      console.log(`[complement][useEffect] clientSecret=${clientSecret}`)
      setOptions({clientSecret : clientSecret})
      setPayment_intent(testutil.toString(router.query.payment_intent))
      setPayment_intent_client_secret(testutil.toString(router.query.payment_intent_client_secret))
      setRedirect_status(testutil.toString(router.query.redirect_status))
    } else {
      console.log(`[payment][useEffect] router is not ready.`)
    }
  }, [router])

  return (
    <main>
      <div>
        <Head>
          <title>Stripeテスト </title>
        </Head>
        <div>Stripeテスト 決済後ページ</div>
        {options && (
          <Elements stripe={stripePromise} options={options}>
            <CompleteForm payment_intent={payment_intent} payment_intent_client_secret={payment_intent_client_secret} redirect_status={redirect_status} />
          </Elements>
        )}
      </div>
    </main>
  )
}

export default HomePage
