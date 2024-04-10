# Streamlit Stripe Payment Component

This Streamlit custom component allows users to process payments using Stripe, handling credit card inputs and communicating payment status effectively within a Streamlit app. It integrates seamlessly with Stripe's APIs to manage transaction processes securely.


## Installation instructions

```sh
pip install stripecard
```

## Additional Notes
Ensure your Streamlit application is running over HTTPS to enable secure transactions and prevent any security warnings from browsers regarding the handling of payment information.

The 0.0.1 version have the warning and success mesagge in spanish, in the next update i will add the english version. if you need the english version, please contact with me at linkedin: 

## Usage instructions

```import streamlit as st
from stripecard import my_component

# Set your Stripe public key
STRIPE_PUBLIC_KEY = "your_stripe_public_key_here"

# Use the component
resultado = my_component(stripe_public_key=STRIPE_PUBLIC_KEY)
if resultado:
    paymentMethodID = resultado["paymentMethodID"]
    message_result = resultado["message"]
    if paymentMethodID:
        st.success(message_result)
        # Example: Charging $20, expressed in cents
        amount = 2000  # The amount in cents
        currency = "usd"
        payment_method_id = paymentMethodID
        customer_id = 'cus_example'  # Example customer ID

        # Function to create a payment intent
        payment_intent = crear_payment_intent(amount, currency, payment_method_id, customer_id)
        if payment_intent:
            print("Payment successful:", payment_intent['id'])
            st.success("Payment made successfully: " + payment_intent['id'])
        else:
            print("Failed to make payment due to an error.")
            st.error("Failed to make payment due to an error.")
    else:
        st.error("Payment process error. Please try again.")
        st.error(message_result)
else:
    st.markdown("Awaiting data...")
```



## Component Function Definition
The my_component function is defined as follows:

```
def my_component(stripe_public_key, key=None):
    """
    Create a new instance of 'stripecard'.

    Parameters
    ----------
    stripe_public_key: str
        The Stripe API public key
    key: str or None
        An optional key that uniquely identifies this component. If None, and the component's arguments are changed, the component will be re-mounted in the Streamlit frontend and lose its current state.

    Returns
    -------
    component_value : Object
        An object with the following keys:
        - paymentMethodID: Identifier for the payment method generated during the payment process. 'null' if an error occurs.
        - message: Status or error message indicating the success or failure of the payment transaction.
    """

```


## Creating a Payment Intent Function
This example uses  crear_payment_intent function, which you would define to interact with Stripe's APIs to create a payment intent:

```

import stripe

def crear_payment_intent(amount, currency, payment_method_id, customer_id=None, metadata=None):
    """
    Creates a PaymentIntent with Stripe.

    Parameters
    ----------
    amount : int
        The amount to be charged, in the smallest currency unit (e.g., cents for USD).
    currency : str
        The currency in which to charge (e.g., 'usd').
    payment_method_id : str
        The ID of the payment method to be charged.
    customer_id : str, optional
        The ID of a Stripe customer associated with the PaymentIntent.
    metadata : dict, optional
        A dictionary of additional data to associate with the PaymentIntent.

    Returns
    -------
    dict or None
        The created PaymentIntent object if successful, or None if an error occurred.
    """
    stripe.api_key = "sk_test_4eC39HqLyjWDarjtT1zdp7dc"  # Set your secret key

    try:
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            payment_method=payment_method_id,
            confirmation_method='manual',
            confirm=True,
            customer=customer_id,
            metadata=metadata,
            return_url='https://yourdomain.com/return_url'  # Specify your return URL here
        )
        return intent
    except stripe.error.StripeError as e:
        print(f"Stripe Error: {e.user_message if hasattr(e, 'user_message') else str(e)}")
        return None

```