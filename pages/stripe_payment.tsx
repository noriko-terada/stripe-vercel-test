import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from "react"
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { getPublicKey } from 'utils/stripeutil'
import * as testutil from 'utils/testutil'
import PaymentForm from 'components/paymentform'

const stripePromise = loadStripe(getPublicKey())

const HomePage = () => {
  const router = useRouter()
  const [options, setOptions] = useState<any>(null)
  const [amount, setAmount] = useState<string>('')

  useEffect(() => {
    if (router.isReady) {
      const item = testutil.toString(router.query.item)
      console.log(`[payment][useEffect] item=${item}`);
      (async () => {
        const res = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item: item })
        })
        if (!res.ok) {
          throw `payment-intentでエラー : ${res.status}`
        }
        const data = await res.json()
        console.log(`[payment][useEffect] data = ${JSON.stringify(data)}`)
        setOptions({clientSecret : data.clientSecret})
        setAmount(testutil.toString(data.amount))
        //setClientSecret(data.clientSecret)      
      })()
    } else {
      console.log(`[payment][useEffect] router is not ready.`)
    }
  }, [router, amount])

  console.log(`[payment] amount=${amount} option判定=${options ? 'true' : 'false'} options=${JSON.stringify(options)}`);

  /*
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorBackground: "#4864e8",
        colorText: '#fff',
        colorDanger: '#EC407A',
        spacingGridRow: "40px"
      },
      rules: {
        '.Input:focus': {
          border: '1px solid #2dd7e0',
        },
      }
    },
  };
  */

  return (
    <main>
      <div>
        <Head>
          <title>Stripeテスト</title>
        </Head>
        <div>Stripeテスト</div>
        {options && (
          <Elements stripe={stripePromise} options={options}>
            <PaymentForm amount={amount} />
          </Elements>
        )}
      </div>
    </main>
  )
}

export default HomePage
